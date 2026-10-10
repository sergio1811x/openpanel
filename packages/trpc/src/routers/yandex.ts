import crypto from 'node:crypto';
import {
  db,
  getChartStartEndDate,
  getSettingsForProject,
  getYandexOverview,
  getYandexQueries,
  listYandexHosts,
} from '@openpanel/db';
import { yandexQueue } from '@openpanel/queue';
import { zRange, zTimeInterval } from '@openpanel/validation';
import { z } from 'zod';
import { getProjectAccess, requireProjectAccess } from '../access';
import { TRPCForbiddenError, TRPCNotFoundError } from '../errors';
import { createTRPCRouter, protectedProcedure } from '../trpc';

const zYandexDateInput = z.object({
  projectId: z.string(),
  range: zRange,
  interval: zTimeInterval.optional().default('day'),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
});

async function resolveDates(
  projectId: string,
  input: { range: string; startDate?: string | null; endDate?: string | null }
) {
  const { timezone } = await getSettingsForProject(projectId);
  const { startDate, endDate } = getChartStartEndDate(
    {
      range: input.range as any,
      startDate: input.startDate,
      endDate: input.endDate,
    },
    timezone
  );
  return {
    startDate: startDate.slice(0, 10),
    endDate: endDate.slice(0, 10),
  };
}

export const yandexRouter = createTRPCRouter({
  getConnection: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      const access = await getProjectAccess({
        projectId: input.projectId,
        userId: ctx.session.userId,
      });
      if (!access) {
        throw new TRPCForbiddenError('You do not have access to this project');
      }
      return db.yandexWebmasterConnection.findUnique({
        where: { projectId: input.projectId },
        select: {
          id: true,
          hostId: true,
          lastSyncedAt: true,
          lastSyncStatus: true,
          lastSyncError: true,
          backfillStatus: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }),

  initiateOAuth: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await requireProjectAccess({
        userId: ctx.session.userId,
        projectId: input.projectId,
        level: 'write',
      });

      const clientId = process.env.YANDEX_CLIENT_ID;
      const redirectUri = process.env.YANDEX_REDIRECT_URI;
      if (!clientId || !redirectUri) {
        throw new TRPCNotFoundError(
          'Yandex Webmaster is not configured on this instance'
        );
      }

      // State is only used to protect against CSRF (Yandex OAuth does not
      // use PKCE for confidential server-side apps)
      const state = `${input.projectId}:${crypto.randomUUID()}`;
      const url = new URL('https://oauth.yandex.ru/authorize');
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('client_id', clientId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('state', state);
      url.searchParams.set('force_confirm', 'yes');

      const cookieOpts = { maxAge: 60 * 10, signed: true };
      ctx.setCookie('yandex_oauth_state', state, cookieOpts);
      ctx.setCookie('yandex_project_id', input.projectId, cookieOpts);

      return { url: url.toString() };
    }),

  getHosts: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      const access = await getProjectAccess({
        projectId: input.projectId,
        userId: ctx.session.userId,
      });
      if (!access) {
        throw new TRPCForbiddenError('You do not have access to this project');
      }
      return listYandexHosts(input.projectId);
    }),

  selectHost: protectedProcedure
    .input(z.object({ projectId: z.string(), hostId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await requireProjectAccess({
        userId: ctx.session.userId,
        projectId: input.projectId,
        level: 'write',
      });

      const conn = await db.yandexWebmasterConnection.findUnique({
        where: { projectId: input.projectId },
      });
      if (!conn) {
        throw new TRPCNotFoundError('Yandex Webmaster connection not found');
      }

      await db.yandexWebmasterConnection.update({
        where: { projectId: input.projectId },
        data: {
          hostId: input.hostId,
          backfillStatus: 'pending',
        },
      });

      await yandexQueue.add('yandexProjectBackfill', {
        type: 'yandexProjectBackfill',
        payload: { projectId: input.projectId },
      });

      return { ok: true };
    }),

  disconnect: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await requireProjectAccess({
        userId: ctx.session.userId,
        projectId: input.projectId,
        level: 'write',
      });

      await db.yandexWebmasterConnection.deleteMany({
        where: { projectId: input.projectId },
      });

      return { ok: true };
    }),

  getOverview: protectedProcedure
    .input(zYandexDateInput)
    .query(async ({ input, ctx }) => {
      const access = await getProjectAccess({
        projectId: input.projectId,
        userId: ctx.session.userId,
      });
      if (!access) {
        throw new TRPCForbiddenError('You do not have access to this project');
      }
      const { startDate, endDate } = await resolveDates(input.projectId, input);
      const interval = ['day', 'week', 'month'].includes(input.interval)
        ? (input.interval as 'day' | 'week' | 'month')
        : 'day';
      return getYandexOverview(input.projectId, startDate, endDate, interval);
    }),

  getPreviousOverview: protectedProcedure
    .input(zYandexDateInput)
    .query(async ({ input, ctx }) => {
      const access = await getProjectAccess({
        projectId: input.projectId,
        userId: ctx.session.userId,
      });
      if (!access) {
        throw new TRPCForbiddenError('You do not have access to this project');
      }
      const { startDate, endDate } = await resolveDates(input.projectId, input);

      const startMs = new Date(startDate).getTime();
      const duration = new Date(endDate).getTime() - startMs;
      const prevEnd = new Date(startMs - 1);
      const prevStart = new Date(prevEnd.getTime() - duration);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);

      const interval = (['day', 'week', 'month'] as const).includes(
        input.interval as 'day' | 'week' | 'month'
      )
        ? (input.interval as 'day' | 'week' | 'month')
        : 'day';

      return getYandexOverview(
        input.projectId,
        fmt(prevStart),
        fmt(prevEnd),
        interval
      );
    }),

  getQueries: protectedProcedure
    .input(
      zYandexDateInput.extend({
        limit: z.number().min(1).max(1000).optional().default(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const access = await getProjectAccess({
        projectId: input.projectId,
        userId: ctx.session.userId,
      });
      if (!access) {
        throw new TRPCForbiddenError('You do not have access to this project');
      }
      const { startDate, endDate } = await resolveDates(input.projectId, input);
      return getYandexQueries(input.projectId, startDate, endDate, input.limit);
    }),
});
