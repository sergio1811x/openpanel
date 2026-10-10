import { db, syncYandexData } from '@openpanel/db';
import type { YandexQueuePayload } from '@openpanel/queue';
import { yandexQueue } from '@openpanel/queue';
import type { Job } from 'bullmq';
import { logger } from '../utils/logger';

const BACKFILL_MONTHS = 6;
const CHUNK_DAYS = 7;

export function yandexJob(job: Job<YandexQueuePayload>) {
  switch (job.data.type) {
    case 'yandexProjectSync':
      return yandexProjectSyncJob(job.data.payload.projectId);
    case 'yandexProjectBackfill':
      return yandexProjectBackfillJob(job.data.payload.projectId);
    default:
      throw new Error('Unknown Yandex job type');
  }
}

async function yandexProjectSyncJob(projectId: string) {
  const conn = await db.yandexWebmasterConnection.findUnique({
    where: { projectId },
  });
  if (!conn?.hostId) {
    logger.warn({ projectId }, 'Yandex sync skipped: no connection or hostId');
    return;
  }

  try {
    // Sync rolling 3-day window (Yandex also refines recent numbers)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // yesterday
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 2); // 3 days total

    await syncYandexData(projectId, startDate, endDate);

    await db.yandexWebmasterConnection.update({
      where: { projectId },
      data: {
        lastSyncedAt: new Date(),
        lastSyncStatus: 'success',
        lastSyncError: null,
      },
    });
    logger.info({ projectId }, 'Yandex sync completed');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.yandexWebmasterConnection.update({
      where: { projectId },
      data: {
        lastSyncedAt: new Date(),
        lastSyncStatus: 'error',
        lastSyncError: message,
      },
    });
    logger.error({ err: error, projectId }, 'Yandex sync failed');
    throw error;
  }
}

async function yandexProjectBackfillJob(projectId: string) {
  const conn = await db.yandexWebmasterConnection.findUnique({
    where: { projectId },
  });
  if (!conn?.hostId) {
    logger.warn(
      { projectId },
      'Yandex backfill skipped: no connection or hostId',
    );
    return;
  }

  await db.yandexWebmasterConnection.update({
    where: { projectId },
    data: { backfillStatus: 'running' },
  });

  try {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // yesterday

    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - BACKFILL_MONTHS);

    // Process in chunks to avoid timeouts and respect API limits
    let chunkEnd = new Date(endDate);
    while (chunkEnd > startDate) {
      const chunkStart = new Date(chunkEnd);
      chunkStart.setDate(chunkStart.getDate() - CHUNK_DAYS + 1);
      if (chunkStart < startDate) {
        chunkStart.setTime(startDate.getTime());
      }

      logger.info(
        {
          projectId,
          from: chunkStart.toISOString().slice(0, 10),
          to: chunkEnd.toISOString().slice(0, 10),
        },
        'Yandex backfill chunk',
      );

      await syncYandexData(projectId, chunkStart, chunkEnd);

      chunkEnd = new Date(chunkStart);
      chunkEnd.setDate(chunkEnd.getDate() - 1);
    }

    await db.yandexWebmasterConnection.update({
      where: { projectId },
      data: {
        backfillStatus: 'completed',
        lastSyncedAt: new Date(),
        lastSyncStatus: 'success',
        lastSyncError: null,
      },
    });
    logger.info({ projectId }, 'Yandex backfill completed');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.yandexWebmasterConnection.update({
      where: { projectId },
      data: {
        backfillStatus: 'failed',
        lastSyncStatus: 'error',
        lastSyncError: message,
      },
    });
    logger.error({ err: error, projectId }, 'Yandex backfill failed');
    throw error;
  }
}

export async function yandexSyncAllJob() {
  const connections = await db.yandexWebmasterConnection.findMany({
    where: {
      hostId: { not: '' },
    },
    select: { projectId: true },
  });

  logger.info(
    { count: connections.length },
    'Yandex nightly sync: enqueuing projects',
  );

  for (const conn of connections) {
    await yandexQueue.add('yandexProjectSync', {
      type: 'yandexProjectSync',
      payload: { projectId: conn.projectId },
    });
  }
}
