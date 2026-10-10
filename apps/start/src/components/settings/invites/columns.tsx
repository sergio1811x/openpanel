import { TooltipComplete } from '@/components/tooltip-complete';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useTRPC } from '@/integrations/trpc/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { toast } from 'sonner';

import { ColumnCreatedAt } from '@/components/column-created-at';
import { createActionColumn } from '@/components/ui/data-table/data-table-helpers';
import type { RouterOutputs } from '@/trpc/client';
import { clipboard } from '@/utils/clipboard';

export function useColumns(): ColumnDef<
  RouterOutputs['organization']['invitations'][number]
>[] {
  return [
    {
      accessorKey: 'id',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.email}</div>
      ),
      meta: {
        label: 'Email',
        placeholder: 'Поиск по email',
        variant: 'text',
      },
    },
    {
      accessorKey: 'role',
      header: 'Роль',
      meta: {
        label: 'Роль',
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Создан',
      size: ColumnCreatedAt.size,
      cell: ({ row }) => {
        const item = row.original;
        return <ColumnCreatedAt>{item.createdAt}</ColumnCreatedAt>;
      },
      meta: {
        label: 'Создан',
      },
    },
    {
      accessorKey: 'projectAccess',
      header: 'Доступ',
      cell: ({ row }) => {
        return <AccessCell row={row} />;
      },
      meta: {
        label: 'Доступ',
      },
    },
    createActionColumn(({ row }) => {
      const trpc = useTRPC();
      const queryClient = useQueryClient();
      const revoke = useMutation(
        trpc.organization.revokeInvite.mutationOptions({
          onSuccess() {
            toast.success(`Приглашение для ${row.original.email} отозвано`);
            queryClient.invalidateQueries(
              trpc.organization.invitations.queryFilter({
                organizationId: row.original.organizationId,
              }),
            );
          },
          onError() {
            toast.error(`Не удалось отозвать приглашение для ${row.original.email}`);
          },
        }),
      );

      return (
        <>
          <DropdownMenuItem
            onClick={() => {
              clipboard(
                `${window.location.origin}/onboarding?inviteId=${row.original.id}`,
              );
            }}
          >
            Копировать ссылку-приглашение
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              revoke.mutate({ inviteId: row.original.id });
            }}
          >
            Отозвать приглашение
          </DropdownMenuItem>
        </>
      );
    }),
  ];
}

function AccessCell({
  row,
}: {
  row: Row<RouterOutputs['organization']['invitations'][number]>;
}) {
  const trpc = useTRPC();
  const projectsQuery = useQuery(
    trpc.project.list.queryOptions({
      organizationId: row.original.organizationId,
    }),
  );
  const projects = projectsQuery.data ?? [];
  const access = row.original.projectAccess ?? [];

  return (
    <>
      {access.map((grant) => {
        const project = projects.find((p) => p.id === grant.projectId);
        if (!project) {
          return (
            <Badge key={grant.projectId} className="mr-1">
              Неизвестно
            </Badge>
          );
        }
        return (
          <Badge key={grant.projectId} color="blue" className="mr-1">
            {project.name}
            {grant.level === 'read' ? ' (только чтение)' : ''}
          </Badge>
        );
      })}
      {access.length === 0 && <Badge variant={'secondary'}>Все проекты</Badge>}
    </>
  );
}
