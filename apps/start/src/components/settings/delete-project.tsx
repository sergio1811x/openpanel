import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Widget, WidgetBody, WidgetHead } from '@/components/widget';
import { handleError, useTRPC } from '@/integrations/trpc/react';
import { showConfirm } from '@/modals';
import type { IServiceProjectWithClients } from '@openpanel/db';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { addHours, format, startOfHour } from 'date-fns';
import { TrashIcon } from 'lucide-react';
import { toast } from 'sonner';

type Props = { project: IServiceProjectWithClients };

export default function DeleteProject({ project }: Props) {
  const router = useRouter();
  const trpc = useTRPC();

  const queryClient = useQueryClient();
  const { data: organization } = useQuery(
    trpc.organization.get.queryOptions({
      organizationId: project.organizationId,
    }),
  );
  // When the whole organization is scheduled for deletion, this project's
  // deletion is part of it and can only be cancelled at the organization level.
  const isOrgScheduledForDeletion = !!organization?.deleteAt;
  const mutation = useMutation(
    trpc.project.delete.mutationOptions({
      onError: handleError,
      onSuccess: () => {
        toast.success('Проект запланирован к удалению');
        queryClient.invalidateQueries(
          trpc.project.getProjectWithClients.queryFilter({
            projectId: project.id,
          }),
        );
      },
    }),
  );

  const cancelDeletionMutation = useMutation(
    trpc.project.cancelDeletion.mutationOptions({
      onError: handleError,
      onSuccess: () => {
        toast.success('Удаление проекта отменено');
        queryClient.invalidateQueries(
          trpc.project.getProjectWithClients.queryFilter({
            projectId: project.id,
          }),
        );
      },
    }),
  );

  return (
    <Widget className="max-w-screen-md w-full">
      <WidgetHead>
        <span className="title">Удаление проекта</span>
      </WidgetHead>
      <WidgetBody className="space-y-4">
        <p>
          Удаление проекта уберёт его из Вашей организации вместе со всеми его
          данными. Он будет безвозвратно удалён через 24 часа.
        </p>
        {project?.deleteAt && (
          <Alert variant="destructive">
            <AlertTitle>Проект запланирован к удалению</AlertTitle>
            <AlertDescription>
              Этот проект будет удалён{' '}
              <span className="font-medium">
                {
                  // add 1 hour and round to the nearest hour
                  // Since we run cron once an hour
                  format(
                    startOfHour(addHours(project.deleteAt, 1)),
                    'yyyy-MM-dd HH:mm:ss',
                  )
                }
              </span>
              . Все события, связанные с этим проектом, будут удалены.
              {isOrgScheduledForDeletion && (
                <>
                  {' '}
                  Вся организация запланирована к удалению. Чтобы сохранить этот
                  проект, отмените удаление в настройках организации.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}
        <div className="flex gap-4 justify-start">
          {project?.deleteAt && (
            <Button
              variant="outline"
              disabled={isOrgScheduledForDeletion}
              onClick={() => {
                cancelDeletionMutation.mutate({ projectId: project.id });
              }}
              loading={cancelDeletionMutation.isPending}
            >
              Отменить удаление
            </Button>
          )}
          <Button
            disabled={!!project?.deleteAt}
            variant="destructive"
            icon={TrashIcon}
            loading={mutation.isPending}
            onClick={() => {
              showConfirm({
                title: 'Удаление проекта',
                text: 'Вы уверены, что хотите удалить этот проект?',
                onConfirm: () => {
                  mutation.mutate({ projectId: project.id });
                },
              });
            }}
          >
            Удалить проект
          </Button>
        </div>
      </WidgetBody>
    </Widget>
  );
}
