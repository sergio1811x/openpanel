import { FeatureCard } from '@/components/feature-card';
import { GetStartedButton } from '@/components/get-started-button';
import { Section, SectionHeader } from '@/components/section';
import { Button } from '@/components/ui/button';
import {
  ChartBarIcon,
  ChevronRightIcon,
  DollarSignIcon,
  LayoutDashboardIcon,
  RocketIcon,
  WorkflowIcon,
} from 'lucide-react';
import Link from 'next/link';
import { CollaborationChart } from './collaboration-chart';

const features = [
  {
    title: 'Гибкая визуализация данных',
    description:
      'Стройте линейные и столбчатые диаграммы, sankey-потоки и кастомные дашборды. Объединяйте метрики любых событий в одном виде.',
    icon: ChartBarIcon,
    slug: 'data-visualization',
  },
  {
    title: 'Шеринг и совместная работа',
    description:
      'Приглашайте неограниченное число участников команды с доступом на уровне организации или проекта. Публикуйте дашборды или защищайте их паролем.',
    icon: LayoutDashboardIcon,
    slug: 'share-and-collaborate',
  },
  {
    title: 'Интеграции и вебхуки',
    description:
      'Пересылайте события в свои системы или сторонние сервисы. Подключите OpenPanel к Slack, вашему хранилищу данных или любому вебхуку.',
    icon: WorkflowIcon,
    slug: 'integrations',
  },
];

export function Collaboration() {
  return (
    <Section className="container">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <CollaborationChart />
        <div>
          <SectionHeader
            title="Превратите данные в конкретные действия"
            description="Стройте интерактивные дашборды, делитесь инсайтами с командой и быстрее принимайте решения на основе данных. OpenPanel помогает понять не только что происходит, но и почему."
          />

          <GetStartedButton className="mt-6" />

          <div className="col gap-6 mt-16">
            {features.map((feature) => (
              <Link
                href={`/features/${feature.slug}`}
                className="group relative col gap-2 pr-10 overflow-hidden"
                key={feature.title}
              >
                <h3 className="font-semibold">
                  <feature.icon className="size-6 inline-block mr-2 relative -top-0.5" />
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
                <ChevronRightIcon
                  className="absolute right-0 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-transform duration-200 translate-x-full group-hover:translate-x-0"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
