# AGENTS.md — гид по сервису Openpanel RU для ИИ-агентов

> Документ для ИИ-агентов и новых разработчиков: как устроен и работает этот сервис,
> где что лежит, как проверить изменения. Читай перед любой правкой кода.

**Что это.** Openpanel RU — русский форк open-source веб-аналитики OpenPanel
(аналог Mixpanel / Plausible / GA4): приём событий с сайтов и приложений,
хранение в ClickHouse, дашборды, отчёты, сессии-реплеи, кохорты, уведомления,
AI-чат и публичный маркетинговый сайт.

**Бренд и нейминг.** Видимое имя продукта — **Openpanel RU** (константы в
`apps/public/src/lib/openpanel-brand.ts`). Внутренние идентификаторы НЕ менялись:
npm-скоуп `@openpanel/*`, env-переменные (`OPENPANEL_*`), API-заголовки
(`openpanel-client-id` / `openpanel-sdk-*`), MCP-ключи — не переименовывать,
иначе сломается совместимость с апстримом. Ссылки на openpanel.dev в UI и
маркетинге убраны (заменены на `#` или локальные роуты); атрибуция апстрима
(`github.com/Openpanel-dev/openpanel`, LICENSE.md, TRADEMARK.md) сохранена.

**Особенности этого форка** (всё уже реализовано и запушено в `main`):
1. **Полная русификация интерфейса** (~471 файл, хардкодом, без i18n).
2. **Интеграция Яндекс Вебмастера** в разделе SEO — зеркально
   Google Search Console: OAuth, выбор сайта, бэкфилл 6 месяцев, ежедневный синк.
3. **Ребрендинг в Openpanel RU** — видимый слой (UI, лендинг, письма, title/meta).

---

## 1. Карта монорепозитория

Менеджер пакетов: **pnpm 11.23.0** (`packageManager` в package.json), Node **24.19.0** (`.nvmrc`),
TypeScript 5.9.3, zod 4, React 19. Turbo НЕ используется — оркестрация через `pnpm -r`.

### apps/

| Путь | Назначение |
|---|---|
| `apps/api` | Event-API и публичный REST на **Fastify**. `/track` (приём событий), `/event` (легаси), `/profile` (identify), `/import`, `/export`, `/insights/*` (REST-зеркало аналитики), Swagger UI на `/documentation`, Prometheus `/metrics`, tRPC на `/trpc`, WebSocket `/live`, OAuth-колбэки (`/oauth/github/callback`, `/oauth/google/callback`, `/gsc/callback`, `/yandex-webmaster/callback`), MCP на `/mcp`, AI-агенты на `/ai/agents/*`. Порт `API_PORT=3333`. |
| `apps/start` | Основной дашборд — **TanStack Start** (Vite, TanStack Router/Query, tRPC client, Tailwind, shadcn, recharts/visx, redux-toolkit). ~87 роутов в `src/routes`, компоненты в `src/components`, модалки в `src/modals`, AI-чат, деплой на Cloudflare (wrangler). Порт 3000. |
| `apps/worker` | BullMQ/GroupMQ воркеры + cron-планировщик. Bull Board на `WORKER_PORT=9999`. |
| `apps/public` | Маркетинг + docs — **Next.js** (App Router, fumadocs-mdx). Контент в `content/` (features/for/compare — JSON, docs/guides/articles — MDX). Деплой Cloudflare (opennextjs). |
| `apps/testbed` | Демо-магазин для ручной проверки трекинга. |
| `apps/justfuckinguseopenpanel` | Мини-лендинг (Cloudflare Worker). |
| `admin/` | Внутренняя админка (`@openpanel/admin`). |

### packages/ (все `@openpanel/*`, TS-source, `main: index.ts` или `src/index.ts`)

| Пакет | Назначение |
|---|---|
| `validation` | zod-схемы всего (события, фильтры, интеграции, `INTEGRATION_DESCRIPTORS`) |
| `db` | Prisma-клиент + ClickHouse-клиент (`src/clickhouse/client.ts`), буферы батчинга, сервисы запросов (`chart.service.ts`, `sql-builder.ts`, `gsc.ts`, `yandex.ts`), code-migrations |
| `queue` | Очереди: kafkajs + BullMQ + GroupMQ (`src/queues.ts`) |
| `redis` | Redis-клиент, cachable-кэш, pub/sub |
| `auth` | Сессии, argon2-пароли, TOTP, OAuth через arctic |
| `trpc` | tRPC-роутеры (`src/routers/*.ts`, корень `src/root.ts`) |
| `common` | Общие утилиты, парсеры UA/referrer, шифрование (`encrypt/decrypt`) |
| `constants` | Константы и label-словари (timeWindows, operators, chartTypes, страны) |
| `logger` | pino-логгер |
| `email` | react-email шаблоны (17 шт.), Resend/SMTP |
| `integrations` | Slack/Discord/webhook-адаптеры, S3/GCS export |
| `payments` | Polar (`@polar-sh/sdk`), подписки, лимиты |
| `importer` | Импорт CSV |
| `geo` | MaxMind GeoIP/ASN |
| `ai` | AI-генераторы (narrative/insights) |
| `mcp` | MCP-сервер (tools: analytics/*, gsc/*, dashboard-management) |
| `js-runtime` | Песочница JS для webhook-шаблонов |
| `sdks/*` | Клиентские SDK: web, astro, express, nextjs, nuxt, react-native, `@openpanel/sdk-info` |

### Прочее в корне

`tooling/typescript` (базовые tsconfig), `tooling/publish`, `scripts/` (seed-events.mjs),
`sh/` (docker-build), `docker/` (clickhouse-config, init-db, redpanda bootstrap),
`self-hosting/` (coolify.yml, docker-compose.template, caddy), `test/` (vitest fixtures),
`patches/`, `biome.json`, `vitest.workspace.ts`, `.env.example`, `.github/workflows/docker-build.yml`.

---

## 2. Команды разработки

```bash
pnpm install                # установка
cp .env.example .env        # конфиг
echo "API_URL=http://localhost:3333" > apps/start/.env
pnpm dock:up                # docker-compose: postgres+redis+clickhouse+redpanda
pnpm codegen                # prisma generate + geo
pnpm migrate:deploy         # SQL-миграции Prisma + ClickHouse code-migrations
pnpm dev                    # все приложения в parallel (api :3333, dashboard :3000, worker :9999)
pnpm typecheck              # tsc по монорепо
pnpm test                   # vitest (требует поднятой docker-инфры)
pnpm check / pnpm fix       # biome (через ultracite)
pnpm dock:ch / dock:redis   # CLI внутрь ClickHouse/Redis
```

Pre-push hook (`simple-git-hooks`): `typecheck && test`.
CI (`.github/workflows/docker-build.yml`): юнит-тесты и сборка образов идут параллельно;
публикация `ghcr.io/sergio1811x/openpanel-{api,dashboard,worker}` (теги `main-<sha>` и `latest`)
— только после smoke-теста полного стека. Локальная сборка — `./sh/build-local <app>`.

### docker-compose (dev-инфра)

| Сервис | Образ | Порты |
|---|---|---|
| op-db | postgres:14-alpine | 5432 |
| op-kv | redis:7.2.5-alpine | 6379 |
| op-ch | clickhouse-server:26.1 | 8123 HTTP / 9000 TCP |
| op-rp | redpanda v25.1 (Kafka API) | 19092, консоль 8091 |

Self-hosting: `self-hosting/coolify.yml` (postgres:16, redis:7.4, clickhouse:24.3,
образы `ghcr.io/sergio1811x/openpanel-{api,dashboard,worker}:latest`).

---

## 3. Поток данных (ingestion pipeline)

```
SDK/сайт
  → POST /track (apps/api)          дедуп duplicateHook, клиент clientHook,
                                    бот-фильтр isBotHook, лимиты subscriptionHook
  → track.controller.ts             контекст: IP, UA-парсинг, geo/ASN (@openpanel/geo),
                                    salts, deviceId/sessionId; диспетчер по типу:
                                    track | identify | increment | decrement | replay |
                                    group | assign_group
  → очередь                         если задан KAFKA_BROKERS — Kafka topic `events`,
                                    иначе GroupMQ шарды sha1(projectId) % EVENTS_GROUP_QUEUES_SHARDS
  → apps/worker incomingEvent       exclude-фильтры проекта, глобальные свойства,
                                    createEvent → EventBuffer; параллельно
                                    checkNotificationRulesForEvent, sessionsQueue
  → packages/db EventBuffer         микро-батч 10мс/100 событий, флаш по 4000
                                    (EVENT_BUFFER_BATCH_SIZE), cron каждые 10с →
                                    INSERT JSONEachRow в ClickHouse `events`
  → Redis pub/sub events:batch      realtime-обновления в UI
  → чтение                          tRPC (chart/report/overview/...) →
                                    chart.service.ts + sql-builder.ts → ClickHouse
```

Аналогичные буферы: `profile-buffer`, `session-buffer`, `group-buffer`, `replay-buffer`,
`bot-buffer` (таблица `events_bots`), у каждого свой flush-cron.

---

## 4. Базы данных

### Postgres (Prisma — `packages/db/prisma/schema.prisma`)

Основные модели: `Organization`, `User` (+`UserTotp`, `TwoFactorChallenge`, `Account`,
`Session`, `ResetPassword`, `EmailUnsubscribe`), `Member`, `Invite`, `Project`,
`ProjectAccess` (grants read/write), `Cohort`, `Client` (API-ключи read|write|root),
`Dashboard`, `Report` + `ReportLayout`, `ShareOverview/Dashboard/Report/Widget`,
`EventMeta`, `Reference`, `NotificationRule`, `Notification`, `Integration`
(Slack/Discord/webhook/S3/GCS), `ExportWatermark`, `Import`, `ProjectInsight` +
`InsightEvent`, **`GscConnection`**, **`YandexWebmasterConnection`**, `Salt`,
`Conversation`/`ChatMessage` (AI-чат), `CodeMigration`.

### ClickHouse

Регистр таблиц — `packages/db/src/clickhouse/client.ts` (`TABLE_NAMES`):
`events`, `profiles`, `profile_aliases`, `self_hosting`, `events_bots`, `sessions`,
`events_imports`, `session_replay_chunks`, `groups`, `cohort_members`, `cohort_metadata`,
MV-проекции (`dau_mv`, `distinct_event_names_mv`, `event_property_values_mv`,
`cohort_events_mv`, `event_profile_summary_mv`, ...), SEO-таблицы
`gsc_daily`, `gsc_pages_daily`, `gsc_queries_daily`, **`yandex_daily`**,
**`yandex_queries_daily`**.

Схема `events` (код-миграция `3-init-ch.ts`): `id UUID`, `name`, `project_id`,
`profile_id`, `session_id`, `device_id`, `path`, `origin`, `referrer(+_name/_type)`,
`duration UInt64`, `properties Map(String,String)`, `created_at DateTime64(3)`,
гео (`country/city/region/longitude/latitude`), ОС/браузер/устройство;
`ORDER BY (project_id, toDate(created_at), profile_id, name)`,
`PARTITION BY toYYYYMM(created_at)`, bloom-индексы по name/origin/path.

Кликхаус-миграции — **code-migrations** `packages/db/code-migrations/1..24-*.ts`
(24 = `24-add-yandex.ts`), прогоняются `pnpm migrate` вместе с Prisma.
Кластер/селф-хостед переключаются `CLICKHOUSE_CLUSTER` / `SELF_HOSTED`
(replicated-таблицы).

### Redis

Кэш (cachable), pub/sub (realtime), BullMQ-очереди, подписанные куки OAuth-стейтов — нет,
те в Fastify; Redis — очереди и кэш.

---

## 5. Аутентификация и доступ

- Кастомная auth (`packages/auth`, НЕ better-auth): argon2 (`@node-rs/argon2`),
  сессии TTL 30 дней, кука `session`, TOTP-2FA + recovery-коды.
- OAuth-провайдеры через **arctic**: GitHub, Google (логин), отдельный `googleGsc`
  (PKCE) для Search Console.
- Роли: организация — `org:admin | org:member`; проекты — grants `read | write`
  (`ProjectAccess`); проверка в `packages/trpc/src/access.ts`
  (`getProjectAccess` / `requireProjectAccess`).
- API-ключи — модель `Client` (`type: read|write|root`), заголовки clientId/clientSecret,
  резолвятся `clientHook` на `/track`.
- Сессия в API: onRequest декодирует куку, `validateSessionToken`,
  AsyncLocalStorage `runWithAlsSession`; `DEMO_USER_ID` — демо-режим.

## 6. tRPC

29 роутеров (`packages/trpc/src/root.ts`): `chart, report, dashboard, organization,
user, project, client, event, profile, session, share, onboarding, reference,
notification, integration, import, auth, subscription, overview, realtime, chat,
conversation, insight, widget, email, gsc, yandex, group, cohort`.
Каждый — `src/routers/<name>.ts`. Контекст — `src/trpc.ts` (сессия из Fastify-куки,
setCookie, superjson, zod errorFormatter), `protectedProcedure`, rate-limit.
Монтируется в `apps/api` на `/trpc`.

**Как добавить роутер:** создать `src/routers/<name>.ts` с `createTRPCRouter`,
добавить в `src/root.ts`, на фронтенде вызывать `trpc.<name>.<proc>.queryOptions(...)`.

## 7. Worker: очереди и cron

Очереди (`packages/queue/src/queues.ts`): GroupMQ `events` (шарды по projectId,
`orderingDelayMs=100`) + BullMQ: `sessions`, `cron`, `notification`, `import`,
`insights`, `gsc`, `yandex`, `cohortCompute`. Если задан `KAFKA_BROKERS` —
consumer `events_kafka` заменяет GroupMQ-воркеры.

- `ENABLED_QUEUES` — список очередей (по умолчанию все, включая `yandex`).
- Concurrency: env `{QUEUE}_CONCURRENCY`; дефолты — events 10
  (`EVENT_JOB_CONCURRENCY`), insights 5, gsc 5, **yandex 3**, cohortCompute 2, остальное 1.
- Graceful shutdown: drain cron + force-exit 20s (`SHUTDOWN_FORCE_EXIT_MS`).

Cron (`apps/worker/src/boot-cron.ts`, диспетчер `jobs/cron.ts`):

| Job | Расписание | Что делает |
|---|---|---|
| salt | 0 0 * * * | ротация солей |
| delete | 0 * * * * | удаление по политике |
| flushEvents/Profiles/Sessions/Replay/Groups | каждые 10с | флаш буферов в ClickHouse |
| flushProfileBackfill | 30с | — |
| insightsDaily | 02:00 | генерация инсайтов |
| onboarding | hourly | онбординг-письма |
| gscSync | 03:00 UTC | синк всех GSC-подключений |
| yandexSync | 04:00 UTC | синк всех Яндекс-подключений |
| cohortRefresh | */30 мин | пересчёт кохорт |
| sessionReaper | 5 мин | закрытие зависших сессий |
| sessionVacuum | 04:00 | чистка сессий |
| insightCleanup | 04:30 | — |
| weeklyDigest | Пн 08:00 | недельный дайджест |
| dataHealth | 07:30 | no-data / data-stopped письма |
| windDown | hourly | lifecycle писем триала |
| flushExports | 60с | выгрузка S3/GCS |
| ping | daily | self-hosted пинг |

---

## 8. Раздел SEO: GSC (эталон) и Яндекс Вебмастер

Обе интеграции устроены одинаково. Раздел: роут
`apps/start/src/routes/_app.$organizationId.$projectId.seo.tsx` (вкладка «SEO»),
подключение — вкладки настроек `settings._tabs.gsc.tsx` / `settings._tabs.yandex.tsx`.

### Флоу (GSC — эталон, Яндекс — зеркально)

1. **UI** → `trpc.gsc.initiateOAuth` / `trpc.yandex.initiateOAuth` (проверка env,
   подписанные куки состояния TTL 10 мин, редирект на consent-экран).
   GSC: arctic + PKCE (`googleGsc`). Яндекс: `oauth.yandex.ru/authorize?response_type=code`
   + `state` (без PKCE — confidential server-app), `force_confirm=yes`.
2. **Колбэк** (Fastify-контроллер в `apps/api/src/controllers/`):
   unsign кук, сверка state, обмен кода на токены
   (`validateAuthorizationCode` / `exchangeYandexCodeForToken` → `oauth.yandex.ru/token`),
   GSC — сразу upsert `GscConnection`; Яндекс — дополнительно `GET /v4/user`
   (`getYandexUserId`) и upsert `YandexWebmasterConnection` c `hostId: ''`.
   Токены шифруются `encrypt` (ключ `ENCRYPTION_KEY`).
3. **Выбор ресурса**: GSC `getSites` → `selectSite(siteUrl)`; Яндекс `getHosts`
   (`GET /v4/user/{uid}/hosts`, только `verified`) → `selectHost(hostId)`.
   После выбора — джоба бэкфилла в очередь (`gscProjectBackfill` / `yandexProjectBackfill`).
4. **Синк** (`apps/worker/src/jobs/gsc.ts` / `yandex.ts`):
   rolling 3 дня ежедневным cron + бэкфилл 6 месяцев чанками (GSC — 14 дней,
   Яндекс — 7 дней с паузами из-за лимитов API).
   - GSC → `searchconsole.searchanalytics.query` → `gsc_daily`, `gsc_pages_daily`,
     `gsc_queries_daily`.
   - Яндекс → Webmaster API v4: `search-queries/all/history` (агрегат
     TOTAL_SHOWS/TOTAL_CLICKS/AVG_SHOW_POSITION) → `yandex_daily`;
     `search-queries/popular` (топ-500 запросов, день-за-днём, delay 150мс) →
     `yandex_queries_daily`. Обе таблицы `ReplacingMergeTree(synced_at)`, чтение с `FINAL`.
5. **Чтение**: tRPC `gsc.*` / `yandex.*` (проверка `getProjectAccess`), UI-секция в
   `seo.tsx` (карточки метрик, график, таблица топ-запросов).
   У Яндекса НЕТ данных по страницам и нет деталей запросов — таблицы pages не существует.
6. **Токены**: рефреш в `getYandexAccessToken` (ротация refresh-токена, при фейле
   `lastSyncStatus='token_expired'` — UI показывает кнопку переподключения).

Статусы синка (`lastSyncedAt/lastSyncStatus/lastSyncError/backfillStatus`) хранятся
в Prisma-модели подключения и показываются в настройках.

### Env для SEO-интеграций

| Переменная | Где используется |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | логин + GSC |
| `GSC_GOOGLE_REDIRECT_URI` | колбэк GSC (по умолчанию переиспользует GOOGLE_*) |
| `YANDEX_CLIENT_ID` / `YANDEX_CLIENT_SECRET` / `YANDEX_REDIRECT_URI` | Яндекс Вебмастер (OAuth-приложение oauth.yandex.ru с доступом к API Вебмастера; redirect → `<API_URL>/yandex-webmaster/callback`) |
| `YANDEX_CONCURRENCY` | concurrency воркера yandex-очереди (дефолт 3) |

### Как добавить новую поисковую интеграцию (чек-лист по образцу Яндекса)

1. Prisma-модель подключения + SQL-миграция (`packages/db/prisma/migrations/`).
2. ClickHouse-таблицы: code-migration `packages/db/code-migrations/NN-*.ts` +
   регистрация в `TABLE_NAMES` (`packages/db/src/clickhouse/client.ts`).
3. `packages/db/src/<provider>.ts`: exchange-токена, рефреш, список ресурсов,
   `sync<Data>` (запись в ClickHouse), `get<Provider>Overview/Queries`; экспорт в `packages/db/index.ts`.
4. Fastify-колбэк: `apps/api/src/routes/<provider>-callback.router.ts` + контроллер
   (подписанные куки state/project_id, паттерн — копия yandex/gsc), монтирование в `app.ts`.
5. Очередь + payload-типы в `packages/queue/src/queues.ts`; джоба в
   `apps/worker/src/jobs/<provider>.ts`; воркер и cron в `boot-workers.ts` / `boot-cron.ts`
   (+ case в `jobs/cron.ts`).
6. tRPC-роутер `packages/trpc/src/routers/<provider>.ts` (+ `root.ts`, флаг провайдера в `auth.ts`).
7. Фронт: вкладка настроек (зеркало `settings._tabs.yandex.tsx`), регистрация роута в
   `routeTree.gen.ts`, секция в `seo.tsx` (пустое состояние должно предлагать все провайдеры).
8. env в `self-hosting/coolify.yml` (api + worker) и `.env.example`.

---

## 9. Прочие интеграции

- **Уведомления**: `NotificationRule` → worker проверяет каждое событие
  (`checkNotificationRulesForEvent`); доставка: email + плагины из
  `packages/integrations/src/registry.ts` (Slack `@slack/bolt`, Discord, Webhook —
  JS-шаблон через `@openpanel/js-runtime`, SSRF-защита safe-fetcher, шифрование секретов).
- **Экспорт S3/GCS**: адаптеры в `packages/integrations/src/object-store/`,
  cron `flushExports` каждую минуту, watermark `ExportWatermark`, env `EXPORT_*`.
- **Email** (`packages/email`, react-email): категории onboarding / account_lifecycle
  (wind-down ×4) / weekly_digest / product_alerts + invite, reset-password,
  notification-rule. Отправка: Resend (`RESEND_API_KEY`) или SMTP (`SMTP_HOST`
  приоритетнее). Отписки — `EmailUnsubscribe` (категории в `@openpanel/constants`).
- **Платежи**: Polar (`packages/payments`), вебхук `/webhook/polar` (svix),
  лимиты подписки применяются `subscriptionHook` на ingestion.
- **MCP**: `packages/mcp` на `/mcp` (tools analytics/gsc/dashboard/projects).
- **AI-чат**: `apps/api/src/agents/*` на `/ai/agents/*`, инструменты поверх tRPC;
  инсайты — `packages/ai`.

## 10. Публичный сайт (apps/public)

Next.js App Router: лендинг (`_sections/`), контент-разделы — `features` / `for` /
`compare` (JSON в `content/`), `guides` / `articles` / `pages` (MDX), docs — fumadocs
(`content/docs/*`, meta.json), `tools/{ip-lookup,url-checker}`, OG-картинки, sitemap.
Рендер MDX — `source.config.ts` + fumadocs-mdx.

---

## 11. Переменные окружения (ключевые)

Ядро: `REDIS_URL`, `DATABASE_URL`, `DATABASE_URL_DIRECT`, `CLICKHOUSE_URL`
(http://localhost:8123/openpanel), `ENCRYPTION_KEY` (hex 32 — TOTP, токены GSC/Яндекс,
S3/GCS-креды), `COOKIE_SECRET`, `API_PORT=3333`, `WORKER_PORT=9999`,
`DASHBOARD_URL` / `API_URL` (+ `NEXT_PUBLIC_*`), `API_CORS_ORIGINS`, `SELF_HOSTED`,
`DEMO_USER_ID`, `MAINTENANCE`.

Очереди/ClickHouse: `KAFKA_BROKERS` (+ `KAFKA_EVENTS_TOPIC`, `KAFKA_CONSUMER_GROUP`,
`KAFKA_PARTITIONS_CONCURRENT`, `KAFKA_SSL`, `KAFKA_SASL_*`), `ENABLED_QUEUES`,
`EVENTS_GROUP_QUEUES_SHARDS`, `EVENT_JOB_CONCURRENCY`, `{QUEUE}_CONCURRENCY`,
`EVENT_BUFFER_MICRO_BATCH_MS/SIZE`, `EVENT_BUFFER_BATCH_SIZE`, `EVENT_BUFFER_CHUNK_SIZE`,
`ORDERING_DELAY_MS`, `AUTO_BATCH_*`, `CLICKHOUSE_CLUSTER`, `CLICKHOUSE_SETTINGS`,
`CLICKHOUSE_MAX_OPEN_CONNECTIONS`, `CLICKHOUSE_REQUEST_TIMEOUT_MS`.

OAuth: `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI`, `GITHUB_CLIENT_ID/SECRET/REDIRECT_URI`,
`GSC_GOOGLE_REDIRECT_URI`, `YANDEX_CLIENT_ID/SECRET/REDIRECT_URI`.

Email: `RESEND_API_KEY`, `EMAIL_SENDER`, `SMTP_HOST/PORT/SECURE/USER/PASS`.
Экспорт: `EXPORT_LAG_SECONDS`, `EXPORT_BATCH_SIZE`, `EXPORT_MAX_BATCHES_PER_RUN`,
`EXPORT_CONCURRENCY`. Платежи: `POLAR_*`.

> ⚠️ Гочарса: `.env.example` документирует брокер как `REDPANDA_*`, но код читает
> только `KAFKA_BROKERS` (`packages/queue/src/kafka.ts`). Для локального Redpanda
> из docker-compose: `KAFKA_BROKERS="localhost:19092"`.

---

## 12. Русская локализация (правила для агентов)

Приложение переведено хардкодом (i18n-инфраструктуры НЕТ; только словари
`translations/properties.ts`, `translations/countries.ts` и label-словари в
`packages/constants`). Коммит `74614ec0`, 471 файл.

**Что переведено**: apps/start (все роуты, компоненты, модалки, чат, тултипы, тосты,
aria-label, 404, тосты буфера обмена, локаль дат ru-RU), apps/public (UI, метаданные,
content/pages, features|for JSON; docs/guides/articles/compare MDX — намеренно EN),
packages/email (16 шаблонов + subjects), packages/integrations (Discord),
packages/constants (timeWindows, операторы, интервалы, страны, emailCategories),
packages/payments (badge/banner подписок), packages/validation (дескрипторы и ошибки форм),
packages/db (инсайт-карточки), apps/api (error.html, oauth-callback тексты).

**Правила при правках:**
- НЕ переводить: идентификаторы и enum-значения (`NOT_SET_VALUE` — только label через
  константу), ключи объектов/табов/роутов (`'overview'|'seo'`, id табов), имена событий,
  `className`, href, op.track-события, React-ключи, `e.key` ('Enter'/'Escape'),
  env-имена, сниппеты кода для копирования.
- Сохранять интерполяцию `{x}` / `${x}` 1:1; бренды не переводить
  (OpenPanel, GitHub, Google, Яндекс, Slack, Discord, Polar, MCP, 2FA, S3, GCS).
- Числа с существительными — нейтральные формы («Событий: N», «N дн.»), либо
  helper plural() как в widget/realtime.tsx.
- Даты: `getLocale()` в `apps/start/src/utils/date.ts` → `ru-RU`; date-fns v3
  с `{ locale: ru }` там, где формат задаётся явно.
- `'(not set)'` → `'(не задано)'` через `NOT_SET_VALUE` из `@openpanel/constants`
  (все сравнения уже через константу — не вводи литералы).

## 13. Как проверять изменения (без поднятой инфры)

Полный `pnpm typecheck` требует `pnpm install` (node_modules отсутствуют в рабочей
копии) — если недоступно, минимальный набор:

```bash
# 1. Синтаксис всех изменённых TS/TSX (esbuild transform)
esbuild --loader:.tsx=tsx --jsx=automatic apps/start/src/routes/seo.tsx --outfile=/dev/null
# (для .ts --loader:.ts=ts; пакет esbuild можно взять: npm i -g esbuild)

# 2. JSON-контент
python3 -c "import json;json.load(open('apps/public/content/for/saas.json'))"

# 3. Структурные сверки контрактов (очередь↔джоба↔cron↔tRPC↔UI, DDL↔TABLE_NAMES↔INSERT,
#    Prisma-модель↔миграция) — см. подход в scripts контейнера: regex-сверка токенов
#    между файлами, булевы проверки, без полагания на рендер.
```

Чек-лист перед коммитом:
- [ ] `git diff` не трогает идентификаторы/ключи (см. раздел 12)
- [ ] все новые импорты резолвятся (для `@openpanel/*` пакет лежит в `packages/<name>`,
      исключение `@openpanel/sdk-info` → `packages/sdks/_info`)
- [ ] новый роут TanStack зарегистрирован в `routeTree.gen.ts` (или запусти codegen)
- [ ] новые env добавлены в `.env.example` и `self-hosting/coolify.yml`
- [ ] Prisma-изменения сопровождаются миграцией, ClickHouse — code-migration

## 14. Известные нюансы

- `apps/start/src/routeTree.gen.ts` — генерируемый файл TanStack Router, но в этом
  форке Yandex-роут добавлен ВРУЧНУЮ (окружение без codegen). При запуске codegen
  не потеряй ручные записи — они идентичны по структуре Gsc-записям.
- `packages/payments` использует импорты с `.js`-расширением
  (`./subscription-state.js` → `subscription-state.ts`) — это нормально (NodeNext).
- Directory-импорты пакетов резолвятся через `package.json` `main`
  (у большинства `src/index.ts` или `index.ts`).
- `apps/start/ROUTING.md` местами устарел (упоминает `_auth.*`; фактически
  `_login.*` / `_steps.*` / `_public.*`).
- Тесты Vitest требуют поднятой dev-инфры (`pnpm dock:up`, фикстуры в
  `test/global-setup.ts`, `TEST_PROJECT_ID='integration-test'`).
- AI-суммари инсайтов (packages/ai) генерируются моделью и могут приходить
  на английском — это вне хардкод-перевода.
- MDX-доки `apps/public/content/{docs,guides,articles,compare}` намеренно оставлены
  английскими (SEO-контент с код-семплами).
