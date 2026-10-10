import { Heading, Hr, Link, Section, Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Layout } from '../components/layout';
import { List } from '../components/list';
import { withUtm } from '../utm';

export const zWeeklyDigest = z.object({
  projectName: z.string(),
  dashboardUrl: z.string(),
  dateRange: z.string(),
  narrative: z.string().optional(),
  stats: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      delta: z.string().optional(),
      direction: z.enum(['up', 'down', 'flat']).optional(),
    }),
  ),
  insights: z.array(
    z.object({
      title: z.string(),
      summary: z.string().optional(),
    }),
  ),
});

export type Props = z.infer<typeof zWeeklyDigest>;
export default WeeklyDigest;

function deltaColor(direction?: 'up' | 'down' | 'flat'): string {
  if (direction === 'up') return '#16a34a';
  if (direction === 'down') return '#dc2626';
  return '#6b7280';
}

export function WeeklyDigest({
  projectName,
  dashboardUrl = 'http://localhost:3000',
  dateRange,
  narrative,
  stats,
  insights,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Heading as="h2" className="text-xl font-semibold">
        Ваша неделя в {projectName}
      </Heading>
      <Text className="text-sm text-gray-500">{dateRange}</Text>

      {narrative && <Text>{narrative}</Text>}

      {stats.length > 0 && (
        <Section className="my-4">
          {stats.map((s) => (
            <Text key={s.label} className="my-1">
              <strong>{s.value}</strong> {s.label}
              {s.delta && (
                <span style={{ color: deltaColor(s.direction) }}>
                  {' '}
                  ({s.delta})
                </span>
              )}
            </Text>
          ))}
        </Section>
      )}

      {insights.length > 0 && (
        <>
          <Hr />
          <Heading as="h3" className="text-base font-semibold">
            Главное за неделю
          </Heading>
          <List
            items={insights.map((i) => (
              <span key={i.title}>
                <strong>{i.title}</strong>
                {i.summary ? ` — ${i.summary}` : ''}
              </span>
            ))}
          />
        </>
      )}

      <Section className="mt-6">
        <Link href={withUtm(dashboardUrl, 'weekly-digest')}>
          Открыть дашборд →
        </Link>
      </Section>
    </Layout>
  );
}

WeeklyDigest.PreviewProps = {
  projectName: 'Public Web 2',
  dashboardUrl: 'http://localhost:3000/my-project/my-site',
  dateRange: '8 июня – 15 июня 2026 г.',
  narrative:
    'На этой неделе на Public Web 2 общее число посетителей оставалось стабильным с небольшим снижением с 3 898 до 3 889, а количество сессий умеренно выросло до 4 777. Примечательно, что переходы из Twitter за последний месяц почти утроились, заметно повысив вовлечённость в социальных сетях. Кроме того, интерес пользователей к инструменту проверки IP более чем удвоился, а активность на странице настроек дашборда выросла более чем на 200%, что говорит о более активном взаимодействии с возможностями сайта. Однако трафик из Украины резко упал более чем на 80% — это снижение, вероятно, повлияло на общий трафик и может требовать дополнительного внимания.',
  stats: [
    { label: 'посетители', value: '3 889', delta: '-0%', direction: 'flat' },
    { label: 'сессии', value: '4 777', delta: '+2%', direction: 'up' },
    { label: 'просмотры страниц', value: '25 254', delta: '-2%', direction: 'down' },
    { label: 'показатель отказов', value: '49%', delta: '+0п.п.', direction: 'flat' },
  ],
  insights: [
    {
      title:
        'Переходы из Twitter за последние 30 дней почти утроились — сильный всплеск, говорящий о росте вовлечённости в социальных сетях.',
      summary: 'Последние 30 дней. Сессии: 277 против 99.',
    },
    {
      title:
        'Переходы к инструменту проверки IP на Openpanel RU более чем удвоились за последние 30 дней — явный признак растущего интереса пользователей к этой возможности.',
      summary: 'Последние 30 дней. Сессии: 1168 против 520.',
    },
    {
      title:
        'Страница настроек дашборда показала сильный рост — на 211,5% больше сессий, что говорит о повышенной активности или интересе пользователей.',
      summary: 'Последние 30 дней. Сессии: 81 против 26.',
    },
    {
      title:
        'Переходы из Украины за последнюю неделю резко упали более чем на 80% — серьёзное снижение, которое, вероятно, влияет на общий трафик сайта и стоит изучить.',
      summary: 'Последние 7 дней. Изменение трафика из Украины.',
    },
    {
      title:
        'Трафик из Новой Зеландии вырос на 170% за последние 30 дней — большой скачок, указывающий на значительный новый интерес из этого рынка.',
      summary: 'Последние 30 дней. Изменение трафика из Новой Зеландии.',
    },
  ],
} satisfies Props;
