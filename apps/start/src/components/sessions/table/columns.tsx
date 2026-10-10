import { round } from '@openpanel/common';
import type { IServiceSession } from '@openpanel/db';
import type { ColumnDef } from '@tanstack/react-table';
import { Video } from 'lucide-react';
import { ColumnCreatedAt } from '@/components/column-created-at';
import { ProjectLink } from '@/components/links';
import { ProfileAvatar } from '@/components/profiles/profile-avatar';
import { SerieIcon } from '@/components/report-chart/common/serie-icon';
import { useNumber } from '@/hooks/use-numer-formatter';
import { getProfileName } from '@/utils/getters';

function formatDuration(milliseconds: number): string {
  const seconds = milliseconds / 1000;
  if (seconds < 60) {
    return `${round(seconds, 1)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${round(remainingSeconds, 0)}s`
      : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${round(remainingMinutes, 0)}m`;
}

export function useColumns() {
  const number = useNumber();
  const columns: ColumnDef<IServiceSession>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Начало',
      size: ColumnCreatedAt.size,
      cell: ({ row }) => {
        const item = row.original;
        return <ColumnCreatedAt>{item.createdAt}</ColumnCreatedAt>;
      },
    },
    {
      accessorKey: 'id',
      header: 'ID сессии',
      size: 120,
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="row items-center gap-2">
            <ProjectLink
              className="font-medium"
              to="/sessions/$sessionId"
              params={{ sessionId: session.id }}
              title={session.id}
            >
              {session.id.slice(0, 8)}...
            </ProjectLink>
            {session.hasReplay && (
              <ProjectLink
                aria-label="Смотреть запись"
                className="text-muted-foreground hover:text-foreground"
                to="/sessions/$sessionId"
                params={{ sessionId: session.id }}
                hash="replay"
                title="Смотреть запись"
              >
                <Video className="size-4" />
              </ProjectLink>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'profileId',
      header: 'Профиль',
      size: 150,
      cell: ({ row }) => {
        const session = row.original;
        if (session.profile) {
          return (
            <ProjectLink
              className="row items-center gap-2 font-medium hover:underline"
              to="/profiles/$profileId"
              params={{ profileId: session.profile.id }}
            >
              <ProfileAvatar size="sm" {...session.profile} />
              {getProfileName(session.profile)}
            </ProjectLink>
          );
        }
        return (
          <ProjectLink
            className="font-medium font-mono"
            to="/profiles/$profileId"
            params={{ profileId: session.profileId }}
          >
            {session.profileId}
          </ProjectLink>
        );
      },
    },
    {
      accessorKey: 'entryPath',
      header: 'Страница входа',
      size: 200,
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="min-w-0">
            <span className="font-mono">{session.entryPath || '/'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'exitPath',
      header: 'Страница выхода',
      size: 200,
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="min-w-0">
            <span className="font-mono">
              {session.exitPath || session.entryPath || '/'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'duration',
      header: 'Длительность',
      size: 100,
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="font-medium">{formatDuration(session.duration)}</div>
        );
      },
    },
    {
      accessorKey: 'isBounce',
      header: 'Отказ',
      size: 80,
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="text-center">
            {session.isBounce ? (
              <span className="text-orange-600">Да</span>
            ) : (
              <span className="text-green-600">Нет</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'referrerName',
      header: 'Реферер',
      size: 150,
      cell: ({ row }) => {
        const session = row.original;
        const ref = session.referrerName || session.referrer || 'Прямой';
        return (
          <div className="flex min-w-0 items-center gap-2">
            <SerieIcon name={ref} />
            <span className="truncate">{ref}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'country',
      header: 'Местоположение',
      size: 150,
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="flex min-w-0 items-center gap-2">
            <SerieIcon name={session.country} />
            <span className="truncate">{session.city || session.country}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'os',
      header: 'ОС',
      size: 120,
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="flex min-w-0 items-center gap-2">
            <SerieIcon name={session.os} />
            <span className="truncate">{session.os}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'browser',
      header: 'Браузер',
      size: 120,
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="flex min-w-0 items-center gap-2">
            <SerieIcon name={session.browser} />
            <span className="truncate">{session.browser}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'device',
      header: 'Устройство',
      size: 150,
      cell: ({ row }) => {
        const session = row.original;
        let deviceInfo =
          session.brand || session.model
            ? [session.brand, session.model].filter(Boolean).join(' / ')
            : session.device;
        if (deviceInfo === 'K') {
          deviceInfo = session.device;
        }
        return (
          <div className="flex min-w-0 items-center gap-2">
            <SerieIcon name={session.device} />
            <span className="truncate">{deviceInfo}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'screenViewCount',
      header: 'Просмотры страниц',
      size: 100,
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="text-center font-medium">
            {session.screenViewCount}
          </div>
        );
      },
    },
    {
      accessorKey: 'eventCount',
      header: 'События',
      size: 90,
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="text-center font-medium">{session.eventCount}</div>
        );
      },
    },
    {
      accessorKey: 'revenue',
      header: 'Выручка',
      size: 100,
      cell: ({ row }) => {
        const session = row.original;
        return session.revenue > 0 ? (
          <div className="font-medium text-green-600">
            {number.currency(session.revenue / 100)}
          </div>
        ) : (
          <div className="text-muted-foreground">-</div>
        );
      },
    },
    {
      accessorKey: 'deviceId',
      header: 'ID устройства',
      size: 120,
    },
    {
      accessorKey: 'groups',
      header: 'Группы',
      size: 200,
      cell: ({ row }) => {
        const { groups } = row.original;
        if (!groups?.length) return null;
        return (
          <div className="flex flex-wrap gap-1">
            {groups.map((g) => (
              <span
                key={g}
                className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono"
              >
                {g}
              </span>
            ))}
          </div>
        );
      },
    },
  ];

  return columns;
}
