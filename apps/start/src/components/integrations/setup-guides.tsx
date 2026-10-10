import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/**
 * FORK (Openpanel RU): пошаговые руководства по настройке OAuth-интеграций,
 * показываются прямо в панели (настройки проекта), без внешней документации.
 */

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="break-all rounded bg-def-100 px-1.5 py-0.5 font-mono text-xs">
      {children}
    </code>
  );
}

function EnvVar({ name, value }: { name: string; value: string }) {
  return (
    <li className="break-all font-mono text-xs">
      {name}=<span className="text-muted-foreground">{value}</span>
    </li>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="col list-decimal gap-4 pl-5 text-sm">{children}</ol>;
}

const API_URL_HINT = (
  <p className="text-muted-foreground text-xs">
    <code className="font-mono">&lt;API_URL&gt;</code> — публичный адрес API
    этого экземпляра (значение переменной <Code>API_URL</Code> в .env,
    например <Code>https://analytics.example.com/api</Code>).
  </p>
);

export function GscSetupGuide() {
  return (
    <Accordion collapsible type="single" className="rounded-lg border">
      <AccordionItem value="guide" className="border-b-0">
        <AccordionTrigger className="px-4 text-sm">
          Руководство по настройке (5 шагов)
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-6">
          <Steps>
            <li className="col gap-1">
              <span className="font-medium">
                Включите Google Search Console API
              </span>
              <span className="text-muted-foreground">
                Откройте{' '}
                <a
                  className="underline"
                  href="https://console.cloud.google.com/apis/library"
                  rel="noreferrer"
                  target="_blank"
                >
                  console.cloud.google.com
                </a>{' '}
                → «APIs &amp; Services» → «Library» → найдите «Google Search
                Console API» → «Enable».
              </span>
            </li>
            <li className="col gap-1">
              <span className="font-medium">Настройте экран согласия</span>
              <span className="text-muted-foreground">
                «APIs &amp; Services» → «OAuth consent screen»: тип External,
                добавьте scope <Code>webmasters.readonly</Code>. Важно: пока
                приложение в статусе Testing, Google отзывает refresh-токены
                каждые 7 дней — для стабильной работы нажмите «Publish App».
                Если все пользователи в вашем Google Workspace — выберите тип
                Internal, проверка Google не потребуется.
              </span>
            </li>
            <li className="col gap-1">
              <span className="font-medium">
                Добавьте redirect URI в OAuth-клиент
              </span>
              <span className="text-muted-foreground">
                «Credentials» → ваш OAuth 2.0 Client (тип Web application) →
                «Authorized redirect URIs» → добавьте:
              </span>
              <Code>
                {'https://<API_URL>'}/gsc/callback
              </Code>
              {API_URL_HINT}
            </li>
            <li className="col gap-1">
              <span className="font-medium">
                Задайте переменные окружения сервисам op-api и op-worker
              </span>
              <span className="text-muted-foreground">
                Файл .env в каталоге self-hosting:
              </span>
              <ul className="col gap-1">
                <EnvVar
                  name="GOOGLE_CLIENT_ID"
                  value="123456789012-xxxx.apps.googleusercontent.com"
                />
                <EnvVar name="GOOGLE_CLIENT_SECRET" value="GOCSPX-..." />
                <EnvVar
                  name="GSC_GOOGLE_REDIRECT_URI"
                  value="https://<API_URL>/gsc/callback"
                />
              </ul>
              <span className="text-muted-foreground text-xs">
                <Code>ENCRYPTION_KEY</Code> (64 hex-символа) уже задаётся
                установщиком; если нет — <Code>openssl rand -hex 32</Code>.
              </span>
            </li>
            <li className="col gap-1">
              <span className="font-medium">Перезапустите сервисы</span>
              <span className="text-muted-foreground">
                Выполните <Code>./restart</Code> в каталоге self-hosting (или
                <Code> docker compose up -d --force-recreate op-api op-worker</Code>
                ), затем вернитесь на эту страницу и нажмите «Подключить».
              </span>
            </li>
          </Steps>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function YandexSetupGuide() {
  return (
    <Accordion collapsible type="single" className="rounded-lg border">
      <AccordionItem value="guide" className="border-b-0">
        <AccordionTrigger className="px-4 text-sm">
          Руководство по настройке (6 шагов)
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-6">
          <Steps>
            <li className="col gap-1">
              <span className="font-medium">
                Добавьте сайт в Яндекс Вебмастер
              </span>
              <span className="text-muted-foreground">
                <a
                  className="underline"
                  href="https://webmaster.yandex.ru/"
                  rel="noreferrer"
                  target="_blank"
                >
                  webmaster.yandex.ru
                </a>{' '}
                → «Добавить сайт» → подтвердите права. Без подтверждённого
                сайта данным неоткуда браться.
              </span>
            </li>
            <li className="col gap-1">
              <span className="font-medium">Создайте OAuth-приложение</span>
              <span className="text-muted-foreground">
                <a
                  className="underline"
                  href="https://oauth.yandex.ru/client/new"
                  rel="noreferrer"
                  target="_blank"
                >
                  oauth.yandex.ru
                </a>{' '}
                → «Создать приложение» → название любое, например «Openpanel
                RU».
              </span>
            </li>
            <li className="col gap-1">
              <span className="font-medium">
                Добавьте платформу «Веб-сервисы»
              </span>
              <span className="text-muted-foreground">
                В настройках приложения → «Платформы» → «Веб-сервисы» →
                Redirect URI:
              </span>
              <Code>
                {'https://<API_URL>'}/yandex-webmaster/callback
              </Code>
              {API_URL_HINT}
            </li>
            <li className="col gap-1">
              <span className="font-medium">Выдайте доступы</span>
              <span className="text-muted-foreground">
                Раздел «Доступы» → «Яндекс Вебмастер» → отметьте «Получение
                данных о сайте» (<Code>webmaster:read</Code>). Достаточно
                доступа только на чтение.
              </span>
            </li>
            <li className="col gap-1">
              <span className="font-medium">
                Задайте переменные окружения сервисам op-api и op-worker
              </span>
              <span className="text-muted-foreground">
                Скопируйте ClientID и Client secret из настроек приложения, в
                .env каталога self-hosting добавьте:
              </span>
              <ul className="col gap-1">
                <EnvVar name="YANDEX_CLIENT_ID" value="<ClientID>" />
                <EnvVar name="YANDEX_CLIENT_SECRET" value="<Client secret>" />
                <EnvVar
                  name="YANDEX_REDIRECT_URI"
                  value="https://<API_URL>/yandex-webmaster/callback"
                />
              </ul>
            </li>
            <li className="col gap-1">
              <span className="font-medium">Перезапустите сервисы</span>
              <span className="text-muted-foreground">
                Выполните <Code>./restart</Code> в каталоге self-hosting, затем
                вернитесь на эту страницу и нажмите «Подключить Яндекс
                Вебмастер» — после авторизации выберите сайт из списка.
              </span>
            </li>
          </Steps>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
