import { createLogger } from '@openpanel/logger';
import { originalCh } from './clickhouse/client';
import { decrypt, encrypt } from './encryption';
import { db } from './prisma-client';

const logger = createLogger({ name: 'db:yandex' });

const YANDEX_OAUTH_TOKEN_URL = 'https://oauth.yandex.ru/token';
const YANDEX_WEBMASTER_API_URL = 'https://api.webmaster.yandex.net/v4';

export interface YandexHost {
  hostId: string;
  name: string;
  verified: boolean;
}

export async function exchangeYandexCodeForToken(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
}> {
  const clientId = process.env.YANDEX_CLIENT_ID;
  const clientSecret = process.env.YANDEX_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'YANDEX_CLIENT_ID or YANDEX_CLIENT_SECRET is not set in this environment'
    );
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(YANDEX_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to exchange Yandex code for token: ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  if (!data.refresh_token) {
    throw new Error('No refresh token returned from Yandex OAuth');
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    accessTokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

export function createYandexAuthorizationUrl(
  state: string,
  redirectUri: string
): string {
  const clientId = process.env.YANDEX_CLIENT_ID;
  if (!clientId) {
    throw new Error('YANDEX_CLIENT_ID is not set in this environment');
  }

  const url = new URL('https://oauth.yandex.ru/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  // Force consent so a refresh token is always returned
  url.searchParams.set('force_confirm', 'yes');
  return url.toString();
}

interface YandexTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

async function refreshYandexToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
  const clientId = process.env.YANDEX_CLIENT_ID;
  const clientSecret = process.env.YANDEX_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'YANDEX_CLIENT_ID or YANDEX_CLIENT_SECRET is not set in this environment'
    );
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(YANDEX_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to refresh Yandex token: ${text}`);
  }

  const data = (await res.json()) as YandexTokenResponse;
  // Yandex may rotate the refresh token — persist the new one when it does
  const nextRefreshToken = data.refresh_token ?? refreshToken;
  return {
    accessToken: data.access_token,
    refreshToken: nextRefreshToken,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

export async function getYandexAccessToken(projectId: string): Promise<string> {
  const conn = await db.yandexWebmasterConnection.findUniqueOrThrow({
    where: { projectId },
  });

  if (
    conn.accessTokenExpiresAt &&
    conn.accessTokenExpiresAt.getTime() > Date.now() + 60_000
  ) {
    logger.info(
      { projectId, expiresAt: conn.accessTokenExpiresAt },
      'Yandex using cached access token',
    );
    return decrypt(conn.accessToken);
  }

  logger.info(
    {
      projectId,
      expiresAt: conn.accessTokenExpiresAt,
      hasRefreshToken: !!conn.refreshToken,
    },
    'Yandex access token expired, attempting refresh',
  );

  try {
    const { accessToken, refreshToken, expiresAt } = await refreshYandexToken(
      decrypt(conn.refreshToken)
    );
    await db.yandexWebmasterConnection.update({
      where: { projectId },
      data: {
        accessToken: encrypt(accessToken),
        refreshToken: encrypt(refreshToken),
        accessTokenExpiresAt: expiresAt,
      },
    });
    logger.info({ projectId, expiresAt }, 'Yandex token refreshed successfully');
    return accessToken;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to refresh token';
    logger.error(
      { err: error, projectId, errorMessage },
      'Yandex token refresh failed',
    );
    await db.yandexWebmasterConnection.update({
      where: { projectId },
      data: {
        lastSyncStatus: 'token_expired',
        lastSyncError: errorMessage,
      },
    });
    throw new Error(
      `Yandex token refresh failed for project ${projectId}: ${errorMessage}`
    );
  }
}

async function yandexApiFetch<T>(
  accessToken: string,
  path: string
): Promise<T> {
  const res = await fetch(`${YANDEX_WEBMASTER_API_URL}${path}`, {
    headers: { Authorization: `OAuth ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Yandex Webmaster API request failed (${path}): ${text}`);
  }

  return (await res.json()) as T;
}

export async function getYandexUserId(accessToken: string): Promise<string> {
  const data = await yandexApiFetch<{ user_id: number }>(
    accessToken,
    '/user'
  );
  return String(data.user_id);
}

export async function listYandexHosts(
  projectId: string
): Promise<YandexHost[]> {
  const accessToken = await getYandexAccessToken(projectId);
  const conn = await db.yandexWebmasterConnection.findUniqueOrThrow({
    where: { projectId },
  });

  if (!conn.yandexUserId) {
    throw new Error('No Yandex user id stored for this project');
  }

  const data = await yandexApiFetch<{
    hosts?: Array<{
      host_id: string;
      ascii_host_url?: string;
      unicode_host_url?: string;
      verified: boolean;
    }>;
  }>(accessToken, `/user/${conn.yandexUserId}/hosts`);

  return (data.hosts ?? [])
    .filter((host) => host.verified)
    .map((host) => ({
      hostId: host.host_id,
      name: host.unicode_host_url ?? host.ascii_host_url ?? host.host_id,
      verified: host.verified,
    }));
}

interface YandexIndicatorPoint {
  date: string;
  value: number;
}

interface YandexAllHistoryResponse {
  indicators?: Partial<
    Record<
      | 'TOTAL_SHOWS'
      | 'TOTAL_CLICKS'
      | 'AVG_SHOW_POSITION'
      | 'AVG_CLICK_POSITION',
      YandexIndicatorPoint[]
    >
  >;
}

interface YandexPopularResponse {
  queries?: Array<{
    query_id: string;
    query_text: string;
    indicators?: Partial<
      Record<
        | 'TOTAL_SHOWS'
        | 'TOTAL_CLICKS'
        | 'AVG_SHOW_POSITION'
        | 'AVG_CLICK_POSITION',
        number
      >
    >;
  }>;
  date_from?: string;
  date_to?: string;
  count?: number;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toDateKey(indicatorDate: string): string {
  // Dates come as "2019-07-18T00:00:00.000+03:00" (Yandex local tz) — take
  // the date part, which is the day Yandex aggregates its stats for.
  return indicatorDate.slice(0, 10);
}

function nowString(): string {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

const POPULAR_FETCH_DELAY_MS = 150;

async function fetchYandexAllHistory(
  accessToken: string,
  yandexUserId: string,
  hostId: string,
  startDate: string,
  endDate: string
): Promise<YandexAllHistoryResponse['indicators']> {
  const encodedHost = encodeURIComponent(hostId);
  const query = [
    'query_indicator=TOTAL_SHOWS',
    'query_indicator=TOTAL_CLICKS',
    'query_indicator=AVG_SHOW_POSITION',
    `date_from=${startDate}`,
    `date_to=${endDate}`,
  ].join('&');

  const data = await yandexApiFetch<YandexAllHistoryResponse>(
    accessToken,
    `/user/${yandexUserId}/hosts/${encodedHost}/search-queries/all/history?${query}`
  );
  return data.indicators ?? {};
}

async function fetchYandexPopularQueries(
  accessToken: string,
  yandexUserId: string,
  hostId: string,
  startDate: string,
  endDate: string
): Promise<YandexPopularResponse['queries']> {
  const encodedHost = encodeURIComponent(hostId);
  const query = [
    'order_by=TOTAL_SHOWS',
    'query_indicator=TOTAL_SHOWS',
    'query_indicator=TOTAL_CLICKS',
    'query_indicator=AVG_SHOW_POSITION',
    `date_from=${startDate}`,
    `date_to=${endDate}`,
    'offset=0',
    'limit=500',
  ].join('&');

  const data = await yandexApiFetch<YandexPopularResponse>(
    accessToken,
    `/user/${yandexUserId}/hosts/${encodedHost}/search-queries/popular?${query}`
  );
  return data.queries ?? [];
}

/**
 * Sync Yandex Webmaster search data for a project into ClickHouse.
 *
 * 1. `search-queries/all/history` — aggregated daily totals → `yandex_daily`
 * 2. `search-queries/popular` per day — top-500 queries per day → `yandex_queries_daily`
 *
 * Yandex has no page-level search data in its API, so unlike GSC there is
 * no pages table.
 */
export async function syncYandexData(
  projectId: string,
  startDate: Date,
  endDate: Date
): Promise<void> {
  const conn = await db.yandexWebmasterConnection.findUniqueOrThrow({
    where: { projectId },
  });

  if (!conn.hostId || !conn.yandexUserId) {
    throw new Error('No Yandex host configured for this project');
  }

  const accessToken = await getYandexAccessToken(projectId);
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  const syncedAt = nowString();

  // 1. Daily totals — authoritative numbers for the overview chart
  const indicators = await fetchYandexAllHistory(
    accessToken,
    conn.yandexUserId,
    conn.hostId,
    start,
    end
  );

  const shows = indicators.TOTAL_SHOWS ?? [];
  if (shows.length > 0) {
    const clicksByDate = new Map<string, number>(
      (indicators.TOTAL_CLICKS ?? []).map((point) => [
        toDateKey(point.date),
        Math.round(point.value ?? 0),
      ])
    );
    const positionByDate = new Map<string, number>(
      (indicators.AVG_SHOW_POSITION ?? []).map((point) => [
        toDateKey(point.date),
        point.value ?? 0,
      ])
    );

    const dailyRows = shows
      .filter((point) => {
        const date = toDateKey(point.date);
        return date >= start && date <= end;
      })
      .map((point) => {
        const date = toDateKey(point.date);
        const impressions = Math.round(point.value ?? 0);
        const clicks = clicksByDate.get(date) ?? 0;
        return {
          project_id: projectId,
          date,
          clicks,
          impressions,
          ctr: impressions > 0 ? clicks / impressions : 0,
          position: positionByDate.get(date) ?? 0,
          synced_at: syncedAt,
        };
      });

    if (dailyRows.length > 0) {
      await originalCh.insert({
        table: 'yandex_daily',
        values: dailyRows,
        format: 'JSONEachRow',
      });
    }
  }

  // 2. Per-query breakdown — Yandex only exposes top queries per period,
  // so fetch day by day to build a date × query table
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    const day = formatDate(cursor);
    const queries = await fetchYandexPopularQueries(
      accessToken,
      conn.yandexUserId,
      conn.hostId,
      day,
      day
    );

    const rows = queries
      .map((q) => {
        const impressions = Math.round(q.indicators?.TOTAL_SHOWS ?? 0);
        const clicks = Math.round(q.indicators?.TOTAL_CLICKS ?? 0);
        return {
          project_id: projectId,
          date: day,
          query: q.query_text,
          clicks,
          impressions,
          ctr: impressions > 0 ? clicks / impressions : 0,
          position: q.indicators?.AVG_SHOW_POSITION ?? 0,
          synced_at: syncedAt,
        };
      })
      .filter((row) => row.query);

    if (rows.length > 0) {
      await originalCh.insert({
        table: 'yandex_queries_daily',
        values: rows,
        format: 'JSONEachRow',
      });
    }

    cursor.setDate(cursor.getDate() + 1);
    if (cursor <= endDate) {
      await new Promise((resolve) =>
        setTimeout(resolve, POPULAR_FETCH_DELAY_MS)
      );
    }
  }
}

export async function getYandexOverview(
  projectId: string,
  startDate: string,
  endDate: string,
  interval: 'day' | 'week' | 'month' = 'day'
): Promise<
  Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>
> {
  const dateExpr =
    interval === 'month'
      ? 'toStartOfMonth(date)'
      : interval === 'week'
        ? 'toStartOfWeek(date)'
        : 'date';

  const result = await originalCh.query({
    query: `
      SELECT
        ${dateExpr} as date,
        sum(clicks) as clicks,
        sum(impressions) as impressions,
        avg(ctr) as ctr,
        avg(position) as position
      FROM yandex_daily
      FINAL
      WHERE project_id = {projectId: String}
        AND date >= {startDate: String}
        AND date <= {endDate: String}
      GROUP BY date
      ORDER BY date ASC
    `,
    query_params: { projectId, startDate, endDate },
    format: 'JSONEachRow',
  });
  return result.json();
}

export async function getYandexQueries(
  projectId: string,
  startDate: string,
  endDate: string,
  limit = 100
): Promise<
  Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>
> {
  const result = await originalCh.query({
    query: `
      SELECT
        query,
        sum(clicks) as clicks,
        sum(impressions) as impressions,
        avg(ctr) as ctr,
        avg(position) as position
      FROM yandex_queries_daily
      FINAL
      WHERE project_id = {projectId: String}
        AND date >= {startDate: String}
        AND date <= {endDate: String}
      GROUP BY query
      ORDER BY clicks DESC
      LIMIT {limit: UInt32}
    `,
    query_params: { projectId, startDate, endDate, limit },
    format: 'JSONEachRow',
  });
  return result.json();
}
