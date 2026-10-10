import { useAppParams } from '@/hooks/use-app-params';
import { useTRPC } from '@/integrations/trpc/react';
import { pushModal, showConfirm } from '@/modals';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AnimatePresence, motion } from 'framer-motion';
import { BoxSelectIcon } from 'lucide-react';
import { useMemo } from 'react';
import { PingBadge } from '../ping';
import { Button } from '../ui/button';
import {
  IntegrationCard,
  IntegrationCardFooter,
  IntegrationCardLogo,
  IntegrationCardSkeleton,
} from './integration-card';
import { INTEGRATIONS } from './integrations';

export function ActiveIntegrations() {
  const { projectId } = useAppParams();
  const trpc = useTRPC();
  const query = useQuery(
    trpc.integration.list.queryOptions({
      projectId: projectId!,
    }),
  );
  const client = useQueryClient();
  const deletion = useMutation(
    trpc.integration.delete.mutationOptions({
      onSuccess() {
        client.refetchQueries(
          trpc.integration.list.queryFilter({
            projectId,
          }),
        );
      },
    }),
  );

  const data = useMemo(() => {
    return (query.data || [])
      .map((item) => {
        const integration = INTEGRATIONS.find(
          (integration) => integration.type === item.config.type,
        )!;
        return {
          ...item,
          integration,
        };
      })
      .filter((item) => item.integration);
  }, [query.data]);

  const isLoading = query.isLoading;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 auto-rows-auto">
      {isLoading && (
        <>
          <IntegrationCardSkeleton />
          <IntegrationCardSkeleton />
          <IntegrationCardSkeleton />
        </>
      )}
      {!isLoading && data.length === 0 && (
        <IntegrationCard
          icon={
            <IntegrationCardLogo className="bg-def-200 text-foreground">
              <BoxSelectIcon className="size-10" strokeWidth={1} />
            </IntegrationCardLogo>
          }
          name="Интеграций пока нет"
          description="Интеграции позволяют подключить Ваши системы к OpenPanel. Добавить их можно в разделе доступных интеграций."
        />
      )}
      <AnimatePresence mode="popLayout">
        {data.map((item) => {
          return (
            <motion.div key={item.id} layout="position">
              <IntegrationCard {...item.integration} name={item.name}>
                <IntegrationCardFooter className="row justify-between items-center">
                  <PingBadge>Подключено</PingBadge>
                  <div className="row gap-2">
                    <Button
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        showConfirm({
                          title: `Удалить ${item.name}?`,
                          text: 'Это действие нельзя отменить.',
                          onConfirm: () => {
                            deletion.mutate({
                              id: item.id,
                            });
                          },
                        });
                      }}
                    >
                      Удалить
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        pushModal('AddIntegration', {
                          id: item.id,
                          type: item.config.type,
                        });
                      }}
                    >
                      Изменить
                    </Button>
                  </div>
                </IntegrationCardFooter>
              </IntegrationCard>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
