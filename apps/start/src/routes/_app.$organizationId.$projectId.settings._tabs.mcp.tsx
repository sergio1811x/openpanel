import { createFileRoute } from '@tanstack/react-router';
import { ExternalLinkIcon, PlusIcon } from 'lucide-react';
import CopyInput from '@/components/forms/copy-input';
import Syntax from '@/components/syntax';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAppContext } from '@/hooks/use-app-context';
import { pushModal } from '@/modals';
import { cn } from '@/utils/cn';

export const Route = createFileRoute(
  '/_app/$organizationId/$projectId/settings/_tabs/mcp',
)({
  component: Component,
});

const TOKEN_PLACEHOLDER = 'BASE64_TOKEN';
const DOCS_URL = '#';

type AiClient = {
  id: string;
  name: string;
  description: React.ReactNode;
  configFile?: string;
  language: 'json' | 'bash';
  snippet: (mcpUrl: string) => string;
};

const buildClients = (mcpEndpoint: string): AiClient[] => {
  const url = mcpEndpoint;
  const headers = { Authorization: `Bearer ${TOKEN_PLACEHOLDER}` };
  // Fallback for clients that can't send headers.
  const urlWithToken = `${mcpEndpoint}?token=${TOKEN_PLACEHOLDER}`;

  return [
    {
      id: 'claude-desktop',
      name: 'Claude Desktop',
      description: (
        <>
          Добавьте следующий блок в <code>claude_desktop_config.json</code>. Его
          можно открыть через <strong>Settings → Developer → Edit Config</strong>.
        </>
      ),
      configFile:
        'macOS: ~/Library/Application Support/Claude/claude_desktop_config.json',
      language: 'json',
      snippet: () =>
        JSON.stringify(
          {
            mcpServers: {
              openpanel: {
                type: 'streamable-http',
                url,
                headers,
              },
            },
          },
          null,
          2,
        ),
    },
    {
      id: 'claude-code',
      name: 'Claude Code (CLI)',
      description: (
        <>
          Выполните это один раз в терминале. Если Ваша конфигурация не может
          передавать заголовки, используйте <code>"{urlWithToken}"</code> как
          URL вместо этого и уберите флаг <code>--header</code>.
        </>
      ),
      language: 'bash',
      snippet: () =>
        `claude mcp add --transport http openpanel ${url} \\\n  --header "Authorization: Bearer ${TOKEN_PLACEHOLDER}"`,
    },
    {
      id: 'cursor',
      name: 'Cursor',
      description: (
        <>
          Добавьте сервер в глобальную конфигурацию <code>~/.cursor/mcp.json</code>{' '}
          или в конфигурацию проекта <code>.cursor/mcp.json</code>.
        </>
      ),
      configFile: '~/.cursor/mcp.json',
      language: 'json',
      snippet: () =>
        JSON.stringify(
          {
            mcpServers: {
              openpanel: {
                url,
                transport: 'streamable-http',
                headers,
              },
            },
          },
          null,
          2,
        ),
    },
    {
      id: 'windsurf',
      name: 'Windsurf',
      description: (
        <>
          Добавьте сервер в <code>~/.codeium/windsurf/mcp_config.json</code>.
          Windsurf принимает как <code>serverUrl</code>, так и <code>url</code>.
        </>
      ),
      configFile: '~/.codeium/windsurf/mcp_config.json',
      language: 'json',
      snippet: () =>
        JSON.stringify(
          {
            mcpServers: {
              openpanel: {
                serverUrl: url,
                headers,
              },
            },
          },
          null,
          2,
        ),
    },
    {
      id: 'vscode',
      name: 'VS Code (Copilot)',
      description: (
        <>
          Добавьте сервер в <code>.vscode/mcp.json</code> в Вашем рабочем
          пространстве или в MCP-конфигурацию уровня пользователя.
        </>
      ),
      configFile: '.vscode/mcp.json',
      language: 'json',
      snippet: () =>
        JSON.stringify(
          {
            servers: {
              openpanel: {
                type: 'http',
                url,
                headers,
              },
            },
          },
          null,
          2,
        ),
    },
    {
      id: 'raycast',
      name: 'Raycast',
      description: (
        <>
          Скопируйте JSON ниже, затем выполните команду <strong>Install
          Server</strong> в Raycast — она автоматически заполнит форму из буфера
          обмена. Форма установки принимает только URL, поэтому токен передаётся
          в строке запроса.
        </>
      ),
      language: 'json',
      snippet: () =>
        JSON.stringify(
          {
            name: 'openpanel',
            transport: 'streamable-http',
            url: urlWithToken,
          },
          null,
          2,
        ),
    },
  ];
};

function Component() {
  const { apiUrl } = useAppContext();
  const mcpEndpoint = `${apiUrl}/mcp`;
  const clients = buildClients(mcpEndpoint);

  return (
    <div className="col gap-6">
      <div className="col gap-2">
        <h2 className="font-semibold text-lg">MCP-сервер</h2>
        <p className="text-muted-foreground text-sm">
          Подключите любой MCP-совместимый AI-клиент (Claude, Cursor,
          Windsurf, …) к Вашим данным Openpanel RU. Сервер работает только в
          режиме чтения и предоставляет 38 инструментов для запросов событий,
          сессий, профилей, воронок, удержания и многого другого.
        </p>
      </div>

      <div className="col gap-2">
        <CopyInput label="Эндпоинт" value={mcpEndpoint} />
        <p className="text-muted-foreground text-xs">
          Отправляйте свой токен в заголовке <code>Authorization: Bearer</code>,
          подставив <code>base64(clientId:clientSecret)</code> вместо{' '}
          <code>{TOKEN_PLACEHOLDER}</code>. Клиенты, которые не могут задавать
          заголовки, могут передавать его как query-параметр{' '}
          <code>?token=</code>.
        </p>
      </div>

      <div className="col gap-3 rounded-lg border bg-def-200 p-4">
        <div className="col gap-1">
          <div className="font-medium">Нужен токен?</div>
          <p className="text-muted-foreground text-sm">
            Аутентификацию в MCP проходят только клиенты с типом{' '}
            <code>read</code> и <code>root</code>. Создайте такой клиент и
            скопируйте MCP-токен с экрана успешного создания — он показывается
            только один раз.
          </p>
        </div>
        <div>
          <Button icon={PlusIcon} onClick={() => pushModal('AddClient')}>
            Создать MCP-клиента
          </Button>
        </div>
      </div>

      <div className="col gap-2">
        <div className="font-medium">Настройте свой AI-клиент</div>
        <Accordion className="rounded-lg border" collapsible type="single">
          {clients.map((client) => (
            <AccordionItem
              className="px-4"
              key={client.id}
              value={client.id}
            >
              <AccordionTrigger>{client.name}</AccordionTrigger>
              <AccordionContent className="col gap-3">
                <p className="text-muted-foreground text-sm">
                  {client.description}
                </p>
                {client.configFile && (
                  <p className="text-muted-foreground text-xs">
                    <span className="font-medium">Файл конфигурации:</span>{' '}
                    <code>{client.configFile}</code>
                  </p>
                )}
                <Syntax
                  className="border"
                  code={client.snippet(mcpEndpoint)}
                  language={client.language}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <a
        className={cn(buttonVariants({ variant: 'outline' }), 'self-start')}
        href={DOCS_URL}
        rel="noreferrer"
        target="_blank"
      >
        <ExternalLinkIcon className="h-4 w-4" />
        Прочитать полную документацию по MCP
      </a>
    </div>
  );
}
