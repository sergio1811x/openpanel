import { db, encrypt, exchangeYandexCodeForToken, getYandexUserId } from '@openpanel/db';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { LogError } from '@/utils/errors';

const OAUTH_SENSITIVE_KEYS = ['code', 'state'];

function sanitizeOAuthQuery(
  query: Record<string, unknown> | null | undefined
): Record<string, string> {
  if (!query || typeof query !== 'object') {
    return {};
  }
  return Object.fromEntries(
    Object.entries(query).map(([k, v]) => [
      k,
      OAUTH_SENSITIVE_KEYS.includes(k) ? '<redacted>' : String(v),
    ])
  );
}

export async function yandexWebmasterCallback(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const schema = z.object({
      code: z.string(),
      state: z.string(),
    });

    const query = schema.safeParse(req.query);
    if (!query.success) {
      throw new LogError(
        'Invalid Yandex Webmaster callback query params',
        sanitizeOAuthQuery(req.query as Record<string, unknown>)
      );
    }

    const { code, state } = query.data;

    const rawStoredState = req.cookies.yandex_oauth_state ?? null;
    const rawProjectId = req.cookies.yandex_project_id ?? null;

    const storedStateResult =
      rawStoredState !== null ? req.unsignCookie(rawStoredState) : null;
    const projectIdResult =
      rawProjectId !== null ? req.unsignCookie(rawProjectId) : null;

    if (!(storedStateResult?.value && projectIdResult?.value)) {
      throw new LogError('Missing Yandex Webmaster OAuth cookies', {
        storedState: !storedStateResult?.value,
        projectId: !projectIdResult?.value,
      });
    }

    if (!(storedStateResult?.valid && projectIdResult?.valid)) {
      throw new LogError('Invalid Yandex Webmaster OAuth cookies', {
        storedState: !storedStateResult?.value,
        projectId: !projectIdResult?.value,
      });
    }

    const stateStr = storedStateResult?.value;
    const projectIdStr = projectIdResult?.value;

    if (state !== stateStr) {
      throw new LogError('Yandex Webmaster OAuth state mismatch', {
        hasState: true,
        hasStoredState: true,
        stateMismatch: true,
      });
    }

    const tokens = await exchangeYandexCodeForToken(code);

    // Every Webmaster API resource is scoped to the user id from the token
    const yandexUserId = await getYandexUserId(tokens.accessToken);

    const project = await db.project.findUnique({
      where: { id: projectIdStr },
      select: { id: true, organizationId: true },
    });

    if (!project) {
      throw new LogError('Project not found for Yandex Webmaster connection', {
        projectId: projectIdStr,
      });
    }

    await db.yandexWebmasterConnection.upsert({
      where: { projectId: projectIdStr },
      create: {
        projectId: projectIdStr,
        accessToken: encrypt(tokens.accessToken),
        refreshToken: encrypt(tokens.refreshToken),
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        yandexUserId,
        hostId: '',
      },
      update: {
        accessToken: encrypt(tokens.accessToken),
        refreshToken: encrypt(tokens.refreshToken),
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        yandexUserId,
        lastSyncStatus: null,
        lastSyncError: null,
      },
    });

    reply.clearCookie('yandex_oauth_state');
    reply.clearCookie('yandex_project_id');

    const dashboardUrl =
      process.env.DASHBOARD_URL || process.env.NEXT_PUBLIC_DASHBOARD_URL!;
    const redirectUrl = `${dashboardUrl}/${project.organizationId}/${projectIdStr}/settings/yandex`;
    return reply.redirect(redirectUrl);
  } catch (error) {
    req.log.error({ err: error }, 'Yandex Webmaster OAuth callback error');
    reply.clearCookie('yandex_oauth_state');
    reply.clearCookie('yandex_project_id');
    return redirectWithError(reply, error);
  }
}

function redirectWithError(reply: FastifyReply, error: LogError | unknown) {
  const url = new URL(
    process.env.DASHBOARD_URL || process.env.NEXT_PUBLIC_DASHBOARD_URL!
  );
  url.pathname = '/login';
  if (error instanceof LogError) {
    url.searchParams.set('error', error.message);
  } else {
    url.searchParams.set('error', 'Failed to connect Yandex Webmaster');
  }
  url.searchParams.set('correlationId', reply.request.id);
  return reply.redirect(url.toString());
}
