import type { LucideIcon } from 'lucide-react';
import {
  BellIcon,
  ConeIcon,
  DollarSignIcon,
  FilterIcon,
  GlobeIcon,
  MonitorIcon,
  MousePointerClickIcon,
  PieChartIcon,
  RefreshCwIcon,
  ShareIcon,
  UserIcon,
  WorkflowIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import { FeatureCardLink } from './_components/feature-card';
import { FeatureHero } from '@/app/(content)/features/[slug]/_components/feature-hero';
import { CtaBanner } from '@/app/(home)/_sections/cta-banner';
import { Section, SectionHeader } from '@/components/section';
import { WindowImage } from '@/components/window-image';
import { url } from '@/lib/layout.shared';
import { getOgImageUrl, getPageMetadata } from '@/lib/metadata';
import { featureSource } from '@/lib/source';

const featureIcons: Record<string, LucideIcon> = {
  conversion: FilterIcon,
  'data-visualization': PieChartIcon,
  'event-tracking': MousePointerClickIcon,
  funnels: ConeIcon,
  'identify-users': UserIcon,
  integrations: WorkflowIcon,
  notifications: BellIcon,
  retention: RefreshCwIcon,
  'revenue-tracking': DollarSignIcon,
  'session-tracking': MonitorIcon,
  'share-and-collaborate': ShareIcon,
  'web-analytics': GlobeIcon,
};

export const metadata: Metadata = getPageMetadata({
  title: 'Возможности продуктовой аналитики',
  description:
    'Обзор возможностей OpenPanel: отслеживание событий, воронки, удержание, профили пользователей и многое другое. Продуктовая аналитика с приоритетом приватности, которая просто работает.',
  url: url('/features'),
  image: getOgImageUrl('/features'),
});

const heroData = {
  heading: 'Возможности продуктовой аналитики',
  subheading:
    'Всё, что нужно, чтобы понять поведение пользователей, конверсию и удержание. Простая событийная аналитика без лишней сложности.',
  badges: ['Приватность прежде всего', 'Без cookies', 'Данные в реальном времени'],
};

export default async function FeaturesIndexPage() {
  const features = featureSource;

  return (
    <div>
      <FeatureHero hero={heroData} />

      <div className="container my-16">
        <WindowImage
          alt="Обзор дашборда OpenPanel"
          caption="Наглядная картина продуктовой аналитики с инсайтами в реальном времени и настраиваемыми дашбордами."
          srcDark="/screenshots/overview-dark.webp"
          srcLight="/screenshots/overview-light.webp"
        />
      </div>

      <Section className="container">
        <SectionHeader
          description="Просмотрите наши возможности. Каждая функция создана, чтобы отвечать на конкретные вопросы о вашем продукте и пользователях."
          title="Все возможности"
          variant="sm"
        />
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {features.map((feature) => (
            <FeatureCardLink
              description={feature.hero.subheading}
              icon={featureIcons[feature.slug]}
              key={feature.slug}
              title={feature.hero.heading}
              url={feature.url}
            />
          ))}
        </div>
      </Section>

      <CtaBanner
        ctaLink="https://dashboard.openpanel.dev/onboarding"
        ctaText="Начать бесплатно"
        description="Присоединяйтесь к тысячам команд, которые используют OpenPanel для своей аналитики."
        title="Готовы начать?"
      />
    </div>
  );
}
