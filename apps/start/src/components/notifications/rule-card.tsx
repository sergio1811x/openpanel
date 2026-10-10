import { useTRPC } from '@/integrations/trpc/react';
import { pushModal, showConfirm } from '@/modals';
import type { RouterOutputs } from '@/trpc/client';
import type { NotificationRule } from '@openpanel/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FilterIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ColorSquare } from '../color-square';
import {
  IntegrationCardFooter,
  IntegrationCardHeader,
} from '../integrations/integration-card';
import { PingBadge } from '../ping';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tooltiper } from '../ui/tooltip';

function EventBadge({
  event,
}: { event: NotificationRule['config']['events'][number] }) {
  return (
    <Tooltiper
      disabled={!event.filters.length}
      content={
        <div className="col gap-2 font-mono">
          {event.filters.map((filter) => (
            <div key={filter.id}>
              {filter.name} {filter.operator} {JSON.stringify(filter.value)}
            </div>
          ))}
        </div>
      }
    >
      <Badge variant="outline" className="inline-flex">
        {event.name === '*' ? 'Любое событие' : event.name}
        {Boolean(event.filters.length) && (
          <FilterIcon className="size-2 ml-1" />
        )}
      </Badge>
    </Tooltiper>
  );
}

export function RuleCard({
  rule,
}: { rule: RouterOutputs['notification']['rules'][number] }) {
  const trpc = useTRPC();
  const client = useQueryClient();
  const deletion = useMutation(
    trpc.notification.deleteRule.mutationOptions({
      onSuccess() {
        toast.success('Правило удалено');
        client.refetchQueries(
          trpc.notification.rules.queryOptions({
            projectId: rule.projectId,
          }),
        );
      },
    }),
  );
  const renderConfig = () => {
    switch (rule.config.type) {
      case 'events':
        return (
          <div className="row gap-2 items-baseline flex-wrap">
            <div>Получать уведомление, когда</div>
            {rule.config.events.map((event) => (
              <EventBadge key={event.id} event={event} />
            ))}
            <div>происходит событие</div>
          </div>
        );
      case 'funnel':
        return (
          <div className="col gap-4">
            <div>Получать уведомление, когда сессия завершила эту воронку</div>
            <div className="col gap-2">
              {rule.config.events.map((event, index) => (
                <div
                  key={event.id}
                  className="row gap-2 items-center font-mono"
                >
                  <ColorSquare>{index + 1}</ColorSquare>
                  <EventBadge key={event.id} event={event} />
                </div>
              ))}
            </div>
          </div>
        );
    }
  };
  return (
    <div className="card">
      <IntegrationCardHeader>
        <div className="title">{rule.name}</div>
      </IntegrationCardHeader>
      <div className="p-4 col gap-2">{renderConfig()}</div>
      <IntegrationCardFooter className="row gap-2 justify-between items-center">
        <div className="row gap-2 flex-wrap">
          {rule.integrations.map((integration) => (
            <PingBadge key={integration.id}>{integration.name}</PingBadge>
          ))}
        </div>
        <div className="row gap-2">
          <Button
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              showConfirm({
                title: `Удалить ${rule.name}?`,
                text: 'Это действие нельзя отменить.',
                onConfirm: () => {
                  deletion.mutate({
                    id: rule.id,
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
              pushModal('AddNotificationRule', {
                rule,
              });
            }}
          >
            Изменить
          </Button>
        </div>
      </IntegrationCardFooter>
    </div>
  );
}
