import type { IProfileMetrics } from '@openpanel/db';
import { OverviewMetricCard } from '@/components/overview/overview-metric-card';

type Props = {
  data: IProfileMetrics;
};

const PROFILE_METRICS = [
  {
    title: 'Всего событий',
    key: 'totalEvents',
    unit: '',
    inverted: false,
    hideOnZero: false,
  },
  {
    title: 'Сессии',
    key: 'sessions',
    unit: '',
    inverted: false,
    hideOnZero: false,
  },
  {
    title: 'Просмотры страниц',
    key: 'screenViews',
    unit: '',
    inverted: false,
    hideOnZero: false,
  },
  {
    title: 'Событий за сессию (среднее)',
    key: 'avgEventsPerSession',
    unit: '',
    inverted: false,
    hideOnZero: false,
  },
  {
    title: 'Показатель отказов',
    key: 'bounceRate',
    unit: '%',
    inverted: true,
    hideOnZero: false,
  },
  {
    title: 'Длительность сессии (средняя)',
    key: 'durationAvg',
    unit: 'min',
    inverted: false,
    hideOnZero: false,
  },
  {
    title: 'Длительность сессии (P90)',
    key: 'durationP90',
    unit: 'min',
    inverted: false,
    hideOnZero: false,
  },
  {
    title: 'Первое появление',
    key: 'firstSeen',
    unit: 'timeAgo',
    inverted: false,
    hideOnZero: false,
  },
  {
    title: 'Последнее появление',
    key: 'lastSeen',
    unit: 'timeAgo',
    inverted: false,
    hideOnZero: false,
  },
  {
    title: 'Активных дней',
    key: 'uniqueDaysActive',
    unit: '',
    inverted: false,
    hideOnZero: false,
  },
  {
    title: 'События-конверсии',
    key: 'conversionEvents',
    unit: '',
    inverted: false,
    hideOnZero: false,
  },
  {
    title: 'Средний интервал между сессиями (ч)',
    key: 'avgTimeBetweenSessions',
    unit: 'min',
    inverted: false,
    hideOnZero: false,
  },
  {
    title: 'Выручка',
    key: 'revenue',
    unit: 'currency',
    inverted: false,
    hideOnZero: true,
  },
] as const;

export const ProfileMetrics = ({ data }: Props) => {
  return (
    <div className="relative col-span-6 -m-4 mt-0 mb-0 md:m-0">
      <div className="card grid grid-cols-2 overflow-hidden rounded-md md:grid-cols-4 lg:grid-cols-6">
        {PROFILE_METRICS.filter((metric) => {
          if (metric.hideOnZero && data[metric.key] === 0) {
            return false;
          }
          return true;
        }).map((metric) => (
          <OverviewMetricCard
            data={[]}
            id={metric.key}
            inverted={metric.inverted}
            isLoading={false}
            key={metric.key}
            label={metric.title}
            metric={{
              current:
                metric.unit === 'timeAgo' && data[metric.key]
                  ? new Date(data[metric.key]!).getTime()
                  : (data[metric.key] as number) || 0,
              previous: null,
            }}
            unit={metric.unit}
          />
        ))}
      </div>
    </div>
  );
};
