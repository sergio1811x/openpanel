import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircleIcon, Loader2Icon, XCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button, LinkButton } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppParams } from '@/hooks/use-app-params';
import { useTRPC } from '@/integrations/trpc/react';

export const Route = createFileRoute(
  '/_app/$organizationId/$projectId/settings/_tabs/yandex'
)({
  component: YandexSettings,
});

const YANDEX_OAUTH_DOCS_URL =
  'https://yandex.ru/dev/webmaster/doc/dg/concepts/authorize';

function YandexSettings() {
  const { projectId } = useAppParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedHost, setSelectedHost] = useState('');

  const providersQuery = useQuery(trpc.auth.providers.queryOptions());

  const connectionQuery = useQuery(
    trpc.yandex.getConnection.queryOptions(
      { projectId },
      { refetchInterval: 5000 }
    )
  );

  const hostsQuery = useQuery(
    trpc.yandex.getHosts.queryOptions(
      { projectId },
      { enabled: !!connectionQuery.data && !connectionQuery.data.hostId }
    )
  );

  const initiateOAuth = useMutation(
    trpc.yandex.initiateOAuth.mutationOptions({
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      onError: () => {
        toast.error('Не удалось начать подключение Яндекс Вебмастера');
      },
    })
  );

  const selectHost = useMutation(
    trpc.yandex.selectHost.mutationOptions({
      onSuccess: () => {
        toast.success('Сайт подключён', {
          description: 'Заполнение данными за последние месяцы запущено.',
        });
        queryClient.invalidateQueries(trpc.yandex.getConnection.pathFilter());
      },
      onError: () => {
        toast.error('Не удалось выбрать сайт');
      },
    })
  );

  const disconnect = useMutation(
    trpc.yandex.disconnect.mutationOptions({
      onSuccess: () => {
        toast.success('Отключено от Яндекс Вебмастера');
        queryClient.invalidateQueries(trpc.yandex.getConnection.pathFilter());
      },
      onError: () => {
        toast.error('Не удалось отключиться');
      },
    })
  );

  const connection = connectionQuery.data;
  const isYandexConfigured = providersQuery.data?.yandex ?? false;

  if (connectionQuery.isLoading || providersQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // The API has no Yandex OAuth client / Webmaster redirect URI configured.
  // Existing connections are still shown below so data keeps working even if
  // an operator removes the env vars later.
  if (!(connection || isYandexConfigured)) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-lg">Яндекс Вебмастер</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Подключите сайт в Яндекс Вебмастере, чтобы импортировать данные об
            эффективности поиска.
          </p>
        </div>
        <div className="flex flex-col gap-4 rounded-lg border p-6">
          <p className="text-muted-foreground text-sm">
            Яндекс Вебмастер не настроен на этом экземпляре. Нужно создать
            OAuth-приложение в Яндекс ID (oauth.yandex.ru) с доступом к API
            Вебмастера и добавить YANDEX_CLIENT_ID, YANDEX_CLIENT_SECRET и
            YANDEX_REDIRECT_URI в окружение API и воркера. Подробности — в
            руководстве по настройке.
          </p>
          <LinkButton
            className="w-fit"
            href={YANDEX_OAUTH_DOCS_URL}
            rel="noopener"
            target="_blank"
            variant="outline"
          >
            Прочитать руководство по настройке
          </LinkButton>
        </div>
      </div>
    );
  }

  // Not connected at all
  if (!connection) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-lg">Яндекс Вебмастер</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Подключите сайт в Яндекс Вебмастере, чтобы импортировать данные об
            эффективности поиска.
          </p>
        </div>
        <div className="flex flex-col gap-4 rounded-lg border p-6">
          <p className="text-muted-foreground text-sm">
            Вы будете перенаправлены на Яндекс для авторизации доступа.
            Запрашивается доступ к данным Яндекс Вебмастера только в режиме
            чтения.
          </p>
          <Button
            className="w-fit"
            disabled={initiateOAuth.isPending}
            onClick={() => initiateOAuth.mutate({ projectId })}
          >
            {initiateOAuth.isPending && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Подключить Яндекс Вебмастер
          </Button>
        </div>
      </div>
    );
  }

  // Connected but no site selected yet
  if (!connection.hostId) {
    const hosts = hostsQuery.data ?? [];
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-lg">Выберите сайт</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Выберите, какой сайт Яндекс Вебмастера подключить к этому проекту.
          </p>
        </div>
        <div className="space-y-4 rounded-lg border p-6">
          {hostsQuery.isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : hosts.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Для этого аккаунта не найдено сайтов в Яндекс Вебмастере.
            </p>
          ) : (
            <>
              <Select onValueChange={setSelectedHost} value={selectedHost}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите сайт..." />
                </SelectTrigger>
                <SelectContent>
                  {hosts.map((host) => (
                    <SelectItem key={host.hostId} value={host.hostId}>
                      {host.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                disabled={!selectedHost || selectHost.isPending}
                onClick={() =>
                  selectHost.mutate({ projectId, hostId: selectedHost })
                }
              >
                {selectHost.isPending && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Подключить сайт
              </Button>
            </>
          )}
        </div>
        <Button
          onClick={() => disconnect.mutate({ projectId })}
          size="sm"
          variant="ghost"
        >
          Отмена
        </Button>
      </div>
    );
  }

  // Token expired — show reconnect prompt
  if (connection.lastSyncStatus === 'token_expired') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-lg">Яндекс Вебмастер</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Подключено к Яндекс Вебмастеру.
          </p>
        </div>
        <div className="flex flex-col gap-4 rounded-lg border border-destructive/50 bg-destructive/5 p-6">
          <div className="flex items-center gap-2 text-destructive">
            <XCircleIcon className="h-4 w-4" />
            <span className="font-medium text-sm">Авторизация истекла</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Авторизация Яндекс Вебмастера истекла или была отозвана. Выполните
            повторное подключение, чтобы продолжить синхронизацию данных.
          </p>
          {connection.lastSyncError && (
            <p className="break-words font-mono text-muted-foreground text-xs">
              {connection.lastSyncError}
            </p>
          )}
          <Button
            className="w-fit"
            disabled={initiateOAuth.isPending}
            onClick={() => initiateOAuth.mutate({ projectId })}
          >
            {initiateOAuth.isPending && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Повторно подключить Яндекс Вебмастер
          </Button>
        </div>
        <Button
          disabled={disconnect.isPending}
          onClick={() => disconnect.mutate({ projectId })}
          size="sm"
          variant="ghost"
        >
          {disconnect.isPending && (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          )}
          Отключить
        </Button>
      </div>
    );
  }

  // Fully connected
  const syncStatusIcon =
    connection.lastSyncStatus === 'success' ? (
      <CheckCircleIcon className="h-4 w-4" />
    ) : connection.lastSyncStatus === 'error' ? (
      <XCircleIcon className="h-4 w-4" />
    ) : null;

  const syncStatusVariant =
    connection.lastSyncStatus === 'success'
      ? 'success'
      : connection.lastSyncStatus === 'error'
        ? 'destructive'
        : 'secondary';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-lg">Яндекс Вебмастер</h3>
        <p className="mt-1 text-muted-foreground text-sm">
          Подключено к Яндекс Вебмастеру.
        </p>
      </div>

      <div className="divide-y rounded-lg border">
        <div className="flex items-center justify-between p-4">
          <div className="font-medium text-sm">Сайт</div>
          <div className="font-mono text-muted-foreground text-sm">
            {connection.hostId}
          </div>
        </div>

        {connection.backfillStatus && (
          <div className="flex items-center justify-between p-4">
            <div className="font-medium text-sm">Заполнение данными</div>
            <Badge
              className="capitalize"
              variant={
                connection.backfillStatus === 'completed'
                  ? 'success'
                  : connection.backfillStatus === 'failed'
                    ? 'destructive'
                    : connection.backfillStatus === 'running'
                      ? 'default'
                      : 'secondary'
              }
            >
              {connection.backfillStatus === 'running' && (
                <Loader2Icon className="mr-1 h-3 w-3 animate-spin" />
              )}
              {connection.backfillStatus}
            </Badge>
          </div>
        )}

        {connection.lastSyncedAt && (
          <div className="flex items-center justify-between p-4">
            <div className="font-medium text-sm">Последняя синхронизация</div>
            <div className="flex items-center gap-2">
              {connection.lastSyncStatus && (
                <Badge
                  className="capitalize"
                  variant={syncStatusVariant as any}
                >
                  {syncStatusIcon}
                  {connection.lastSyncStatus}
                </Badge>
              )}
              <span className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(connection.lastSyncedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        )}

        {connection.lastSyncError && (
          <div className="p-4">
            <div className="font-medium text-destructive text-sm">
              Последняя ошибка
            </div>
            <div className="mt-1 break-words font-mono text-muted-foreground text-sm">
              {connection.lastSyncError}
            </div>
          </div>
        )}
      </div>

      <Button
        disabled={disconnect.isPending}
        onClick={() => disconnect.mutate({ projectId })}
        size="sm"
        variant="destructive"
      >
        {disconnect.isPending && (
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
        )}
        Отключить
      </Button>
    </div>
  );
}
