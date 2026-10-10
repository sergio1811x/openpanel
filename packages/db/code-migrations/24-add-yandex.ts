import fs from 'node:fs';
import path from 'node:path';
import { createTable, runClickhouseMigrationCommands } from '../src/clickhouse/migration';
import { getIsCluster } from './helpers';

export async function up() {
  const isClustered = getIsCluster();

  const commonMetricColumns = [
    '`clicks` UInt32 CODEC(Delta(4), LZ4)',
    '`impressions` UInt32 CODEC(Delta(4), LZ4)',
    '`ctr` Float32 CODEC(Gorilla, LZ4)',
    '`position` Float32 CODEC(Gorilla, LZ4)',
    '`synced_at` DateTime DEFAULT now() CODEC(Delta(4), LZ4)',
  ];

  const sqls: string[] = [
    // Daily totals from search-queries/all/history — overview numbers
    ...createTable({
      name: 'yandex_daily',
      columns: [
        '`project_id` String CODEC(ZSTD(3))',
        '`date` Date CODEC(Delta(2), LZ4)',
        ...commonMetricColumns,
      ],
      orderBy: ['project_id', 'date'],
      partitionBy: 'toYYYYMM(date)',
      engine: 'ReplacingMergeTree(synced_at)',
      distributionHash: 'cityHash64(project_id)',
      replicatedVersion: '1',
      isClustered,
    }),

    // Per-query breakdown from search-queries/popular (top-500 per day)
    ...createTable({
      name: 'yandex_queries_daily',
      columns: [
        '`project_id` String CODEC(ZSTD(3))',
        '`date` Date CODEC(Delta(2), LZ4)',
        '`query` String CODEC(ZSTD(3))',
        ...commonMetricColumns,
      ],
      orderBy: ['project_id', 'date', 'query'],
      partitionBy: 'toYYYYMM(date)',
      engine: 'ReplacingMergeTree(synced_at)',
      distributionHash: 'cityHash64(project_id)',
      replicatedVersion: '1',
      isClustered,
    }),
  ];

  fs.writeFileSync(
    path.join(__filename.replace('.ts', '.sql')),
    sqls
      .map((sql) =>
        sql
          .trim()
          .replace(/;$/, '')
          .replace(/\n{2,}/g, '\n')
          .concat(';'),
      )
      .join('\n\n---\n\n'),
  );

  await runClickhouseMigrationCommands(sqls);
}
