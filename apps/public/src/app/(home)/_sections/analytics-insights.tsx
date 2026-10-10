import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { FeatureCard } from '@/components/feature-card';
import { NotificationsIllustration } from '@/components/illustrations/notifications';
import { ProductAnalyticsIllustration } from '@/components/illustrations/product-analytics';
import { RetentionIllustration } from '@/components/illustrations/retention';
import { SessionReplayIllustration } from '@/components/illustrations/session-replay';
import { WebAnalyticsIllustration } from '@/components/illustrations/web-analytics';
import { Section, SectionHeader } from '@/components/section';

function wrap(child: React.ReactNode) {
  return <div className="h-48 overflow-hidden">{child}</div>;
}

const mediumFeatures = [
  {
    title: 'Удержание пользователей',
    description:
      'Узнайте, сколько пользователей возвращается на 1-й, 7-й и 30-й день. Определите, какое поведение предсказывает долгосрочное удержание.',
    illustration: wrap(<RetentionIllustration />),
    link: { href: '/features/retention', children: 'Посмотреть удержание' },
  },
  {
    title: 'Session Replay',
    description:
      'Смотрите реальные сессии пользователей и видите, что именно происходило: клики, скроллы, бешеные клики. Встроенные настройки приватности.',
    illustration: wrap(<SessionReplayIllustration />),
    link: { href: '/features/session-replay', children: 'Смотреть session replay' },
  },
  {
    title: 'Уведомления',
    description:
      'Получайте уведомления о завершении воронки. Будьте в курсе ключевых событий в продукте, не глядя в дашборды весь день.',
    illustration: wrap(<NotificationsIllustration />),
    link: { href: '/features/notifications', children: 'Настроить уведомления' },
  },
];

export function AnalyticsInsights() {
  return (
    <Section className="container">
      <SectionHeader
        className="mb-16"
        description="От первого просмотра страницы до долгосрочного удержания — все точки контакта на одной платформе. Без сэмплирования, без лимитов на данные, без догадок."
        label="АНАЛИТИКА И ИНСАЙТЫ"
        title="Всё, что нужно, чтобы понять своих пользователей"
      />

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <FeatureCard
          className="px-0 **:data-content:px-6"
          description="Оцените работу сайта с аналитикой с приоритетом приватности. Отслеживайте посетителей, источники и просмотры страниц, не трогая cookies пользователей."
          illustration={<WebAnalyticsIllustration />}
          title="Веб-аналитика"
        />
        <FeatureCard
          className="px-0 **:data-content:px-6"
          description="Больше, чем просмотры страниц. Отслеживайте кастомные события, изучайте пользовательские сценарии и смотрите, как именно люди пользуются вашим продуктом."
          illustration={<ProductAnalyticsIllustration />}
          title="Продуктовая аналитика"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {mediumFeatures.map((feature) => (
          <FeatureCard
            className="px-0 pt-0 **:data-content:px-6"
            description={feature.description}
            illustration={feature.illustration}
            key={feature.title}
            link={feature.link}
            title={feature.title}
          />
        ))}
      </div>

      <p className="mt-8 text-center">
        <Link
          className="inline-flex items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
          href="/features"
        >
          Посмотреть все возможности
          <ChevronRightIcon className="size-3.5" />
        </Link>
      </p>
    </Section>
  );
}
