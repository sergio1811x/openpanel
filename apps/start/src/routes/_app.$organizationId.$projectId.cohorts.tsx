import { Card, CardActions, CardActionsItem } from '@/components/card';
import { FullPageEmptyState } from '@/components/full-page-empty-state';
import FullPageLoadingState from '@/components/full-page-loading-state';
import { ProjectLink } from '@/components/links';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { handleError, useTRPC } from '@/integrations/trpc/react';
import { pushModal, showConfirm } from '@/modals';
import { cn } from '@/utils/cn';
import { cohortMembersToCSV, downloadCSV } from '@/utils/csv-download';
import { PAGE_TITLES, createProjectTitle } from '@/utils/title';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { format } from 'date-fns';
import {
  DownloadIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
  UsersIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute(
  '/_app/$organizationId/$projectId/cohorts',
)({
  component: Component,
  head: () => ({
    meta: [{ title: createProjectTitle(PAGE_TITLES.COHORTS) }],
  }),
  async loader({ context, params }) {
    await context.queryClient.prefetchQuery(
      context.trpc.cohort.list.queryOptions({
        projectId: params.projectId,
        includeCount: true,
      }),
    );
  },
  pendingComponent: FullPageLoadingState,
});

function Component() {
  const { projectId } = Route.useParams();
  const trpc = useTRPC();
  const query = useQuery(
    trpc.cohort.list.queryOptions({
      projectId,
      includeCount: true,
    }),
  );
  const cohorts = query.data ?? [];

  const deletion = useMutation(
    trpc.cohort.delete.mutationOptions({
      onError: handleError,
      onSuccess() {
        query.refetch();
        toast('Успешно', { description: 'Кохорта удалена.' });
      },
    }),
  );

  const refresh = useMutation(
    trpc.cohort.refresh.mutationOptions({
      onError: handleError,
      onSuccess() {
        query.refetch();
        toast('Успешно', { description: 'Обновление кохорты запланировано.' });
      },
    }),
  );

  const queryClient = useQueryClient();

  async function handleDownload(cohortId: string, cohortName: string) {
    try {
      const result = await queryClient.fetchQuery(
        trpc.cohort.exportProfiles.queryOptions({ cohortId }),
      );
      const csv = cohortMembersToCSV(result.profileIds);
      downloadCSV(csv, `${cohortName}-members.csv`);
    } catch {
      toast.error('Не удалось скачать участников кохорты');
    }
  }

  if (cohorts.length === 0) {
    return (
      <FullPageEmptyState title="Нет кохорт" icon={UsersIcon}>
        <p>Вы ещё не создали ни одной кохорты для этого проекта</p>
        <Button
          onClick={() => pushModal('AddCohort')}
          className="mt-14"
          icon={PlusIcon}
        >
          Создать кохорту
        </Button>
      </FullPageEmptyState>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Кохорты"
        description="Создавайте и управляйте сегментами пользователей на основе событий и свойств"
        className="mb-8"
        actions={
          <Button icon={PlusIcon} onClick={() => pushModal('AddCohort')}>
            <span className="max-sm:hidden">Создать кохорту</span>
            <span className="sm:hidden">Кохорта</span>
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {cohorts.map((cohort) => {
          const count =
            'currentCount' in cohort ? cohort.currentCount : cohort.profileCount;
          const displayCount = count ?? 0;
          return (
            <Card key={cohort.id} hover>
              <ProjectLink
                to="/cohorts/$cohortId"
                params={{ cohortId: cohort.id }}
                className="flex flex-col p-4 outline-none"
              >
                <div className="col gap-2">
                  <div className="font-medium">{cohort.name}</div>
                  {cohort.description && (
                    <div className="line-clamp-2 text-sm text-muted-foreground">
                      {cohort.description}
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <UsersIcon size={14} />
                      <span>
                        Участников: {displayCount.toLocaleString()}
                      </span>
                    </div>
                    {cohort.lastComputedAt && (
                      <div className={cn('text-xs')}>
                        Обновлено{' '}
                        {format(cohort.lastComputedAt, 'd MMM, HH:mm')}
                      </div>
                    )}
                  </div>
                  {cohort.isStatic && (
                    <div className="mt-1 inline-flex w-fit rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                      Статическая
                    </div>
                  )}
                </div>
              </ProjectLink>

              <CardActions>
                <CardActionsItem className="w-full" asChild>
                  <button
                    type="button"
                    onClick={() => handleDownload(cohort.id, cohort.name)}
                  >
                    <DownloadIcon size={16} />
                    Скачать
                  </button>
                </CardActionsItem>
                {!cohort.isStatic && (
                  <CardActionsItem className="w-full" asChild>
                    <button
                      type="button"
                      onClick={() => {
                        refresh.mutate({ cohortId: cohort.id });
                      }}
                    >
                      <RefreshCwIcon size={16} />
                      Обновить
                    </button>
                  </CardActionsItem>
                )}
                <CardActionsItem className="w-full" asChild>
                  <button
                    type="button"
                    onClick={() => {
                      pushModal('EditCohort', {
                        id: cohort.id,
                        name: cohort.name,
                        description: cohort.description,
                        definition: cohort.definition as never,
                        isStatic: cohort.isStatic,
                      });
                    }}
                  >
                    <PencilIcon size={16} />
                    Изменить
                  </button>
                </CardActionsItem>
                <CardActionsItem className="w-full text-destructive" asChild>
                  <button
                    type="button"
                    onClick={() => {
                      showConfirm({
                        title: 'Удаление кохорты',
                        text: 'Вы уверены, что хотите удалить эту кохорту? Это действие нельзя отменить.',
                        onConfirm: () => deletion.mutate({ id: cohort.id }),
                      });
                    }}
                  >
                    <TrashIcon size={16} />
                    Удалить
                  </button>
                </CardActionsItem>
              </CardActions>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
