import { CopyIcon, DownloadIcon, RocketIcon } from 'lucide-react';
import CopyInput from '../forms/copy-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { isRealClientSecret } from '@/hooks/use-client-secret';
import { clipboard } from '@/utils/clipboard';

type Props = { id: string; secret: string; type?: 'read' | 'write' | 'root' };

export function CreateClientSuccess({ id, secret, type }: Props) {
  // Only derive credentials from a real secret — the '[CLIENT_SECRET]'
  // placeholder is truthy and would render a valid-looking but broken token.
  const hasSecret = isRealClientSecret(secret);
  const mcpToken = hasSecret ? btoa(`${id}:${secret}`) : null;
  const showMcpToken = !!mcpToken && (type === 'root' || type === 'read');

  const credentials = [
    `CLIENT_ID=${id}`,
    hasSecret && `CLIENT_SECRET=${secret}`,
    showMcpToken && `MCP_TOKEN=${mcpToken}`,
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
    <div className="grid min-w-0 gap-4 [&>*]:min-w-0">
      <CopyInput label="Client ID" value={id} />
      {hasSecret && (
        <div className="w-full min-w-0">
          <CopyInput label="Секрет" value={secret} />
          <p className="mt-1 text-muted-foreground text-sm">
            Секрет понадобится только если Вы хотите отправлять серверные
            события.
          </p>
        </div>
      )}
      {showMcpToken && (
        <div className="w-full min-w-0">
          <CopyInput label="MCP-токен" value={mcpToken} />
          <p className="mt-1 text-muted-foreground text-sm">
            Используйте этот токен для аутентификации на MCP-сервере (client ID
            и секрет в кодировке base64).
          </p>
        </div>
      )}
      <div className="row gap-2 [&>*]:flex-1">
        <Button
          icon={CopyIcon}
          onClick={() => clipboard(credentials)}
          variant="outline"
        >
          Копировать всё
        </Button>
        <Button icon={DownloadIcon} onClick={download} variant="outline">
          Сохранить учётные данные
        </Button>
      </div>
      <Alert>
        <RocketIcon className="h-4 w-4" />
        <AlertTitle>Начните работу!</AlertTitle>
        <AlertDescription>
          Прочитайте нашу{' '}
          <a
            className="underline"
            href="#"
            rel="noreferrer"
            target="_blank"
          >
            документацию
          </a>{' '}
          чтобы начать. Всё просто!
        </AlertDescription>
      </Alert>
    </div>
  );
}
