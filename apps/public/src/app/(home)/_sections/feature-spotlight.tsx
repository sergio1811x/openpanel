import { FeatureCard } from '@/components/feature-card';
import { ConversionsIllustration } from '@/components/illustrations/conversions';
import { GoogleSearchConsoleIllustration } from '@/components/illustrations/google-search-console';
import { RevenueIllustration } from '@/components/illustrations/revenue';
import { Section, SectionHeader } from '@/components/section';

function wrap(child: React.ReactNode) {
  return <div className="h-48 overflow-hidden">{child}</div>;
}

const features = [
  {
    title: 'Отслеживание выручки',
    description:
      'Подключите платёжные события, чтобы отслеживать MRR и видеть, какие источники приносят больше всего выручки.',
    illustration: wrap(<RevenueIllustration />),
    link: {
      href: '/features/revenue-tracking',
      children: 'Отслеживать выручку',
    },
  },
  {
    title: 'Отслеживание конверсий',
    description:
      'Следите за конверсией во времени и разбивайте её по A/B-варианту, стране или устройству. Замечайте просадки до того, как они дорого обойдутся.',
    illustration: wrap(<ConversionsIllustration />),
    link: {
      href: '/features/conversion',
      children: 'Отслеживать конверсии',
    },
  },
  {
    title: 'Google Search Console',
    description:
      'Смотрите, какие поисковые запросы приводят органический трафик и как посетители конвертируются после перехода. SEO- и продуктовые данные — в одном месте.',
    illustration: wrap(<GoogleSearchConsoleIllustration />),
    link: {
      href: '/features/integrations',
      children: 'Все интеграции',
    },
  },
];

export function FeatureSpotlight() {
  return (
    <Section className="container">
      <SectionHeader
        className="mb-16"
        description="Openpanel RU — это больше, чем просмотры страниц. Отслеживайте выручку, следите за конверсиями и подключайте SEO-данные — без смены инструментов."
        label="ИНСТРУМЕНТЫ РОСТА"
        title="Создано для команд, которые делают продукт и измеряют результат"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature) => (
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
    </Section>
  );
}
