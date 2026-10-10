import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { ColumnCreatedAt } from '@/components/column-created-at';
import CopyInput from '@/components/forms/copy-input';
import { createActionColumn } from '@/components/ui/data-table/data-table-helpers';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { handleError, useTRPC } from '@/integrations/trpc/react';
import { pushModal, showConfirm } from '@/modals';
import type { RouterOutputs } from '@/trpc/client';
import { clipboard } from '@/utils/clipboard';

export function useColumns() {
  const columns: ColumnDef<RouterOutputs['client']['list'][number]>[] = [
    {
      accessorKey: 'name',
      header: 'Название',
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.name}</div>;
      },
    },
    {
      accessorKey: 'id',
      header: 'Client ID',
      cell: ({ row }) => <CopyInput label={null} value={row.original.id} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Создан',
      size: ColumnCreatedAt.size,
      cell: ({ row }) => {
        const item = row.original;
        return <ColumnCreatedAt>{item.createdAt}</ColumnCreatedAt>;
      },
    },
    createActionColumn(({ row }) => {
      const client = row.original;
      const trpc = useTRPC();
      const queryClient = useQueryClient();
      const deletion = useMutation(
        trpc.client.remove.mutationOptions({
          onSuccess() {
            toast('Успешно', {
              description:
                'Клиент отозван, входящие запросы будут отклоняться.',
            });
            queryClient.invalidateQueries(trpc.client.list.pathFilter());
          },
          onError: handleError,
        })
      );
      return (
        <>
          <DropdownMenuItem onClick={() => clipboard(client.id)}>
            Копировать Client ID
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              pushModal('EditClient', client);
            }}
          >
            Изменить
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              showConfirm({
                title: 'Отзыв клиента',
                text: 'Вы уверены, что хотите отозвать этого клиента? Это действие нельзя отменить.',
                onConfirm() {
                  deletion.mutate({
                    id: client.id,
                  });
                },
              });
            }}
            variant="destructive"
          >
            Отозвать
          </DropdownMenuItem>
        </>
      );
    }),
  ];

  return columns;
}
