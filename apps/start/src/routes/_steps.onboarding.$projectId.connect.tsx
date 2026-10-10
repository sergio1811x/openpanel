import { useQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { CopyIcon, DownloadIcon, LockIcon, XIcon } from 'lucide-react';
import { ButtonContainer } from '@/components/button-container';
import CopyInput from '@/components/forms/copy-input';
import { FullPageEmptyState } from '@/components/full-page-empty-state';
import FullPageLoadingState from '@/components/full-page-loading-state';
import ConnectWeb from '@/components/onboarding/connect-web';
import { Button, LinkButton } from '@/components/ui/button';
import { isRealClientSecret, useClientSecret } from '@/hooks/use-client-secret';
import { useTRPC } from '@/integrations/trpc/react';
import { clipboard } from '@/utils/clipboard';
import { createEntityTitle, PAGE_TITLES } from '@/utils/title';

export const Route = createFileRoute('/_steps/onboarding/$projectId/connect')({
  head: () => ({
    meta: [
      { title: createEntityTitle('Подключение данных', PAGE_TITLES.ONBOARDING) },
    ],
  }),
  beforeLoad: ({ context }) => {
    if (!context.session?.session) {
      throw redirect({ to: '/login' });
    }
  },
  component: Component,
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.project.getProjectWithClients.queryOptions({
        projectId: params.projectId,
      })
    );
  },
  pendingComponent: FullPageLoadingState,
});

function Component() {
  const { projectId } = Route.useParams();
  const trpc = useTRPC();
  const { data: project } = useQuery(
    trpc.project.getProjectWithClients.queryOptions({ projectId })
  );
  const client = project?.clients[0];
  const [secret] = useClientSecret();

  if (!client) {
    return (
      <FullPageEmptyState
        description="Проект, который вы ищете, не существует. Пожалуйста, перезагрузите страницу."
        icon={XIcon}
        title="Проект не найден"
      />
    );
  }

  // The secret only exists in this browser session right after creation (we
  // store a hash server-side). Never derive the MCP token — or print secret
  // lines — from the placeholder: that produces valid-looking broken values.
  const hasSecret = isRealClientSecret(secret);
  const mcpToken = hasSecret ? btoa(`${client.id}:${secret}`) : null;
  const credentials = [
    `CLIENT_ID=${client.id}`,
    hasSecret && `CLIENT_SECRET=${secret}`,
    mcpToken && `MCP_TOKEN=${mcpToken}`,
  ]
    .filter(Boolean)
    .join('\n');
  const download = () => {
    const blob = new Blob([credentials], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'credentials.txt';
    a.click();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        <div className="col gap-4 p-4">
          <div className="col gap-2">
            <div className="row items-center justify-between gap-4">
              <div className="flex items-center gap-2 font-bold text-xl capitalize">
                <LockIcon className="size-4" />
                Учётные данные клиента
              </div>
              <div className="row gap-2">
                <Button
                  icon={CopyIcon}
                  onClick={() => clipboard(credentials)}
                  variant="outline"
                >
                  Копировать всё
                </Button>
                <Button
                  icon={DownloadIcon}
                  onClick={() => download()}
                  variant="outline"
                >
                  Сохранить
                </Button>
              </div>
            </div>
            <div className="col gap-3">
              <CopyInput label="ID клиента" value={client.id} />
              {hasSecret && <CopyInput label="Секрет клиента" value={secret} />}
              {mcpToken && (
                <div className="w-full min-w-0">
                  <CopyInput label="MCP-токен" value={mcpToken} />
                  <p className="mt-1 text-muted-foreground text-sm">
                    Используется для аутентификации MCP-сервера (ID клиента и
                    секрет в кодировке base64).
                  </p>
                </div>
              )}
              {!hasSecret && (
                <p className="text-muted-foreground text-sm">
                  Секрет клиента (и MCP-токен, созданный на его основе)
                  показывается только один раз — сразу после создания клиента.
                  Если он понадобится снова, создайте новый клиент в разделе
                  Настройки → Клиенты.
                </p>
              )}
            </div>
          </div>
          <div className="-mx-4 h-px bg-muted" />
          <ConnectWeb client={{ ...client, secret }} />
        </div>
      </div>
      <ButtonContainer className="mt-0 flex-shrink-0 border-t bg-background p-4">
        <div />
        <LinkButton
          className="min-w-28 self-start"
          href={'/onboarding/$projectId/verify'}
          params={{ projectId }}
          size="lg"
        >
          Далее
        </LinkButton>
      </ButtonContainer>
    </div>
  );
}
