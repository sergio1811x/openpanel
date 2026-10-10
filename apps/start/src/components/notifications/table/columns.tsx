import { formatDateTime, formatTime } from '@/utils/date';
import type { ColumnDef } from '@tanstack/react-table';
import { isToday } from 'date-fns';

import { ColumnCreatedAt } from '@/components/column-created-at';
import { ProjectLink } from '@/components/links';
import { SerieIcon } from '@/components/report-chart/common/serie-icon';
import { createHeaderColumn } from '@/components/ui/data-table/data-table-helpers';
import type { RouterOutputs } from '@/trpc/client';
import type { INotificationPayload } from '@openpanel/db';

function getEventFromPayload(payload: INotificationPayload | null) {
  if (payload?.type === 'event') {
    return payload.event;
  }
  if (payload?.type === 'funnel') {
    return payload.funnel[0] || null;
  }
  return null;
}

export function useColumns() {
  const columns: ColumnDef<RouterOutputs['notification']['list'][number]>[] = [
    {
      accessorKey: 'title',
      header: 'Заголовок',
      cell({ row }) {
        const { title } = row.original;
        return (
          <div className="row gap-2 items-center">
            {/* {isReadAt === null && <PingBadge>Unread</PingBadge>} */}
            <span className="max-w-md truncate font-medium">{title}</span>
          </div>
        );
      },
      meta: {
        variant: 'text',
        placeholder: 'Поиск',
        label: 'Заголовок',
      },
    },
    {
      accessorKey: 'message',
      header: 'Сообщение',
      cell({ row }) {
        const { message } = row.original;
        return (
          <div className="inline-flex min-w-full flex-none items-center gap-2">
            {message}
          </div>
        );
      },
      meta: {
        label: 'Сообщение',
        hidden: true,
      },
    },
    {
      accessorKey: 'integration',
      header: 'Интеграция',
      cell({ row }) {
        const integration = row.original.integration;
        return <div>{integration?.name}</div>;
      },
      meta: {
        label: 'Интеграция',
      },
    },
    {
      accessorKey: 'notificationRule',
      header: 'Правило',
      cell({ row }) {
        const rule = row.original.notificationRule;
        return <div>{rule?.name}</div>;
      },
      meta: {
        label: 'Правило',
        hidden: true,
      },
    },
    {
      accessorKey: 'country',
      header: 'Страна',
      cell({ row }) {
        const { payload } = row.original;
        const event = getEventFromPayload(payload);
        if (!event) {
          return null;
        }
        return (
          <div className="inline-flex min-w-full flex-none items-center gap-2">
            <SerieIcon name={event.country} />
            <span>{event.city}</span>
          </div>
        );
      },
      meta: {
        label: 'Страна',
      },
    },
    {
      accessorKey: 'os',
      header: 'ОС',
      cell({ row }) {
        const { payload } = row.original;
        const event = getEventFromPayload(payload);
        if (!event) {
          return null;
        }
        return (
          <div className="flex min-w-full items-center gap-2">
            <SerieIcon name={event.os} />
            <span>{event.os}</span>
          </div>
        );
      },
      meta: {
        label: 'ОС',
      },
    },
    {
      accessorKey: 'browser',
      header: 'Браузер',
      cell({ row }) {
        const { payload } = row.original;
        const event = getEventFromPayload(payload);
        if (!event) {
          return null;
        }
        return (
          <div className="inline-flex min-w-full flex-none items-center gap-2">
            <SerieIcon name={event.browser} />
            <span>{event.browser}</span>
          </div>
        );
      },
      meta: {
        label: 'Браузер',
      },
    },
    {
      accessorKey: 'profile',
      header: createHeaderColumn('Профиль'),
      cell({ row }) {
        const { payload } = row.original;
        const event = getEventFromPayload(payload);
        if (!event) {
          return null;
        }
        return (
          <ProjectLink
            to="/profiles/$profileId"
            params={{ profileId: event.profileId }}
            className="inline-flex min-w-full flex-none items-center gap-2"
          >
            {event.profileId}
          </ProjectLink>
        );
      },
      meta: {
        label: 'Профиль',
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Создано',
      size: ColumnCreatedAt.size,
      cell: ({ row }) => {
        const item = row.original;
        return <ColumnCreatedAt>{item.createdAt}</ColumnCreatedAt>;
      },
      filterFn: 'isWithinRange',
      meta: {
        variant: 'dateRange',
        placeholder: 'Дата создания',
        label: 'Создано',
      },
    },
  ];

  return columns;
}
