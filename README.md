![hero](apps/public/public/ogimage.png)

<p align="center">
        <h1 align="center"><b>Openpanel RU</b></h1>
<p align="center">
    Русский форк Openpanel — веб- и продуктовая аналитика на русском языке
    <br />
    <br />
    <a href="https://github.com/sergio1811x/openpanel">GitHub</a>
    ·
    <a href="AGENTS.md">Для агентов</a>
    ·
  </p>
  <br />
  <br />
</p>

> [!NOTE]
> **🇷🇺 Русский форк Openpanel** под именем **Openpanel RU** от [@sergio1811x](https://github.com/sergio1811x)
>
> - **Весь интерфейс переведён на русский язык** — дашборды, отчёты, события, профили, сессии, настройки, письма и лендинг
> - **Добавлена интеграция Яндекс Вебмастер** — подключается в настройках проекта рядом с Google Search Console и работает в разделе SEO: клики, показы, CTR, средняя позиция и топ запросов из поиска Яндекса
> - Руководство для агентов и контрибьюторов — см. [AGENTS.md](AGENTS.md)

## 🐳 Docker-образы

Собирать образы локально не нужно: GitHub Actions собирает и публикует их автоматически
(с кэшем слоёв и smoke-тестом полного стека перед публикацией).

| Компонент | Образ |
|---|---|
| Дашборд | `ghcr.io/sergio1811x/openpanel-dashboard:latest` |
| API | `ghcr.io/sergio1811x/openpanel-api:latest` |
| Воркер | `ghcr.io/sergio1811x/openpanel-worker:latest` |

- **Деплой без сборки**: `self-hosting/setup` использует эти образы — обновление через `./update` или `docker compose pull && ./restart`
- **Быстрая локальная сборка** (amd64-only, с кэшем слоёв): `./sh/build-local <dashboard|api|worker|all>`
- Теги: `latest` и `main-<sha>` для каждого пуша в `main`
- После первого запуска CI сделайте пакеты публичными (Packages → пакет → Package settings → Change visibility → Public), чтобы тянуть образы без `docker login`

## 👤 Пользователи и вход

Регистрация в форке **полностью отключена** — это одноклиентский self-hosted режим:

- Экран входа — только логин (email) и пароль, без OAuth-кнопок и ссылок на регистрацию
- Учётные записи задаёт администратор напрямую в БД:

```bash
# создать пользователя (или сменить пароль существующему) — из каталога self-hosting:
docker compose exec op-api node /app/apps/api/scripts/create-user.mjs <email> '<пароль>' [Имя] [Фамилия]
```

- Настройка интеграций Google Search Console и Яндекс Вебмастера — пошаговое руководство прямо в панели: **Настройки проекта → Google Search / Яндекс Вебмастер** → «Руководство по настройке»

Openpanel is an open-source web and product analytics platform that combines the power of Mixpanel with the ease of Plausible and one of the best Google Analytics replacements.

## ✨ Features

- **🔍 Advanced Analytics**: Funnels, cohorts, user profiles, and session history
- **🎬 Session Replay**: Record and replay user sessions with privacy controls built in
- **📊 Real-time Dashboards**: Live data updates and interactive charts
- **🎯 A/B Testing**: Built-in variant testing with detailed breakdowns
- **🔔 Smart Notifications**: Event and funnel-based alerts
- **🌍 Privacy-First**: Cookieless tracking and GDPR compliance
- **🚀 Developer-Friendly**: Comprehensive SDKs and API access
- **📦 Self-Hosted**: Full control over your data and infrastructure
- **💸 Transparent Pricing**: No hidden costs or usage limits
- **🛠️ Custom Dashboards**: Flexible chart creation and data visualization
- **📱 Multi-Platform**: Web, mobile (iOS/Android), and server-side tracking
- **🤖 MCP Server**: Ask Claude, Cursor, or any MCP client about your users — 38 tools, hosted, no install
- **💰 Revenue Tracking**: Monitor purchases, subscriptions, and LTV alongside product events
- **🔌 Integrations**: Connect Google Search Console, Yandex Webmaster, and more to enrich your data

## 📊 Analytics Platform Comparison

| Feature                                | OpenPanel | Mixpanel | GA4       | Plausible |
|----------------------------------------|-----------|----------|-----------|-----------|
| ✅ Open-source                         | ✅         | ❌        | ❌        | ✅         |
| 🧩 Self-hosting supported              | ✅         | ❌        | ❌        | ✅         |
| 🔒 Cookieless by default               | ✅         | ❌        | ❌        | ✅         |
| 🔁 Real-time dashboards                | ✅         | ✅        | ❌        | ✅         |
| 🔍 Funnels & cohort analysis           | ✅         | ✅        | ✅*       | ✅***         |
| 👤 User profiles & session history     | ✅         | ✅        | ❌        | ❌         |
| 🎬 Session replay                      | ✅         | ✅****    | ❌        | ❌         |
| 📈 Custom dashboards & charts          | ✅         | ✅        | ✅        | ❌         |
| 💬 Event & funnel notifications        | ✅         | ✅        | ❌        | ❌         |
| 🌍 GDPR-compliant tracking             | ✅         | ✅        | ❌**      | ✅         |
| 📦 SDKs (Web, Swift, Kotlin, ReactNative) | ✅      | ✅        | ✅        | ❌         |
| 💸 Transparent pricing                 | ✅         | ❌        | ✅*       | ✅         |
| 🚀 Built for developers                | ✅         | ✅        | ❌        | ✅         |
| 🔧 A/B testing & variant breakdowns    | ✅         | ✅        | ❌        | ❌         |

> ✅* GA4 has a free tier but often requires BigQuery (paid) for raw data access.
> ❌** GA4 has faced GDPR bans in several EU countries due to data transfers to US-based servers.
> ✅*** Plausible has simple goals
> ✅**** Mixpanel session replay is limited to 5k sessions/month on free and 20k on paid. Openpanel RU has no limit.

## Stack

- **Nextjs** - the dashboard
- **Fastify** - event api
- **Postgres** - storing basic information
- **Clickhouse** - storing events
- **Redis** - cache layer, pub/sub and queue
- **BullMQ** - queue
- **GroupMQ** - for grouped queue
- **Resend** - email
- **Arctic** - oauth
- **Oslo** - auth
- **tRPC** - api
- **Tailwind** - styling
- **Shadcn** - ui

## Self-hosting

Openpanel RU can be self-hosted and we have tried to make it as simple as possible.

You can find the how to [here](https://openpanel.dev/docs/self-hosting/self-hosting) (docs of the upstream project, fully applicable to this fork)

**Give us a star if you like it!**

[![Star History Chart](https://api.star-history.com/svg?repos=Openpanel-dev/openpanel&type=Date)](https://star-history.com/#Openpanel-dev/openpanel&Date)

## Development

### Prerequisites

- Docker
- Docker Compose
- Node
- pnpm

### Start

```bash
pnpm install
cp .env.example .env
echo "API_URL=http://localhost:3333" > apps/start/.env

pnpm dock:up
pnpm codegen
pnpm migrate:deploy # once to setup the db
pnpm dev
```

You can now access the following:

- Dashboard: https://localhost:3000
- API: https://api.localhost:3333
- Bullboard (queue): http://localhost:9999
- `pnpm dock:ch` to access clickhouse terminal
- `pnpm dock:redis` to access redis terminal
