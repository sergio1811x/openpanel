import type { IServiceProjectWithClients } from '@openpanel/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GlobeIcon, KeyIcon, UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import CopyInput from '../forms/copy-input';
import { WithLabel } from '../forms/input-with-label';
import TagInput from '../forms/tag-input';
import Syntax from '../syntax';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useAppContext } from '@/hooks/use-app-context';
import { useClientSecret } from '@/hooks/use-client-secret';
import { handleError, useTRPC } from '@/integrations/trpc/react';

export function VerifyFaq({
  project,
}: {
  project: IServiceProjectWithClients;
}) {
  const context = useAppContext();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [secret] = useClientSecret();

  const updateProject = useMutation(
    trpc.project.update.mutationOptions({
      onError: handleError,
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.project.getProjectWithClients.queryFilter({
            projectId: project.id,
          })
        );
        toast.success('Разрешённые домены обновлены');
      },
    })
  );

  const client = project.clients[0];
  if (!client) {
    return null;
  }

  const handleCorsChange = (newValue: string[]) => {
    const normalized = newValue
      .map((item: string) => {
        const trimmed = item.trim();
        if (
          trimmed.startsWith('http://') ||
          trimmed.startsWith('https://') ||
          trimmed === '*'
        ) {
          return trimmed;
        }
        return trimmed ? `https://${trimmed}` : trimmed;
      })
      .filter(Boolean);
    updateProject.mutate({ id: project.id, cors: normalized });
  };

  const showSecret = secret && secret !== '[CLIENT_SECRET]';

  const payload: Record<string, any> = {
    type: 'track',
    payload: {
      name: 'screen_view',
      properties: {
        __title: `Testing Openpanel RU - ${project.name}`,
        __path: `${project.domain}`,
        __referrer: `${context.dashboardUrl}`,
      },
    },
  };

  if (project.types.includes('app')) {
    payload.payload.properties.__path = '/';
    delete payload.payload.properties.__referrer;
  }

  if (project.types.includes('backend')) {
    payload.payload.name = 'test_event';
    payload.payload.properties = {};
  }

  const code = `curl -X POST ${context.apiUrl}/track \\
-H "Content-Type: application/json" \\
-H "openpanel-client-id: ${client.id}" \\
-H "openpanel-client-secret: ${secret}" \\
-H "User-Agent: ${typeof window !== 'undefined' ? window.navigator.userAgent : ''}" \\
-d '${JSON.stringify(payload)}'`;

  return (
    <div className="card">
      <Accordion collapsible type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger className="px-6">
            События не приходят?
          </AccordionTrigger>
          <AccordionContent className="col gap-4 p-6 pt-2">
            <p>
              Не волнуйтесь, это случается со всеми. Вот что можно проверить:
            </p>
            <div className="col gap-2">
              <Alert>
                <UserIcon size={16} />
                <AlertTitle>Убедитесь, что Client ID верный</AlertTitle>
                <AlertDescription className="col gap-2">
                  <span>
                    Для веб-отслеживания <code>clientId</code> в Вашем сниппете
                    должен соответствовать этому проекту. При необходимости
                    скопируйте его здесь:
                  </span>
                  <CopyInput
                    className="[&_.font-mono]:text-sm"
                    label="Client ID"
                    value={client.id}
                  />
                </AlertDescription>
              </Alert>
              <Alert>
                <GlobeIcon size={16} />
                <AlertTitle>Правильно настроен домен</AlertTitle>
                <AlertDescription className="col gap-2">
                  <span>
                    Для сайтов важно, чтобы домен был настроен правильно. Мы
                    аутентифицируем запросы по домену. Обновите разрешённые
                    домены ниже:
                  </span>
                  <WithLabel label="Разрешённые домены">
                    <TagInput
                      onChange={handleCorsChange}
                      placeholder="Принимать события с этих доменов"
                      renderTag={(tag: string) =>
                        tag === '*' ? 'Принимать события с любых доменов' : tag
                      }
                      value={project.cors ?? []}
                    />
                  </WithLabel>
                </AlertDescription>
              </Alert>
              <Alert>
                <KeyIcon size={16} />
                <AlertTitle>Неверный client secret</AlertTitle>
                <AlertDescription className="col gap-2">
                  <span>
                    Для событий из приложений и бэкенда нужен правильный{' '}
                    <code>clientSecret</code>. При необходимости скопируйте его
                    здесь. Никогда не используйте client secret в веб- или
                    клиентском коде — это раскроет Ваши учётные данные.
                  </span>
                  {showSecret && (
                    <CopyInput
                      className="[&_.font-mono]:text-sm"
                      label="Client secret"
                      value={secret}
                    />
                  )}
                </AlertDescription>
              </Alert>
            </div>
            <p>
              Остались проблемы? Заходите в наш{' '}
              <a className="underline" href="#">
                Discord-канал
              </a>{' '}
              или напишите на{' '}
              <a className="underline" href="mailto:hello@openpanel.dev">
                hello@openpanel.dev
              </a>{' '}
              — мы поможем.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger className="px-6">
            Персональный пример curl
          </AccordionTrigger>
          <AccordionContent className="p-0">
            <Syntax code={code} language="bash" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
