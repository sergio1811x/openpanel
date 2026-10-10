import { Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Button } from '../components/button';
import { Layout } from '../components/layout';
import { withUtm } from '../utm';

export const zWindDownStoppingSoon = z.object({
  firstName: z.string().optional(),
  billingUrl: z.string(),
  blockDate: z.string(),
  recommendedPlan: z.string().optional(),
  hasData: z.boolean().default(true),
  stillTracking: z.boolean().default(false),
  eventsCount: z.number().optional(),
  recentEventsCount: z.number().optional(),
  projectNames: z.array(z.string()).default([]),
  highlight: z.string().optional(),
});

const formatEvents = (count: number) =>
  new Intl.NumberFormat('ru-RU').format(count);

export type Props = z.infer<typeof zWindDownStoppingSoon>;
export default WindDownStoppingSoon;
export function WindDownStoppingSoon({
  firstName,
  billingUrl = 'https://dashboard.openpanel.dev',
  blockDate,
  recommendedPlan,
  hasData = true,
  stillTracking = false,
  eventsCount,
  recentEventsCount,
  highlight,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  const greeting = <Text>Здравствуйте{firstName ? `, ${firstName}` : ''}!</Text>;
  const cta = (
    <Text>
      <Button href={withUtm(billingUrl, 'wind-down-stopping-soon')}>
        Продолжить отслеживание
      </Button>
    </Text>
  );

  if (stillTracking) {
    return (
      <Layout unsubscribeUrl={unsubscribeUrl}>
        {greeting}
        <Text>
          Осталась неделя: {blockDate} мы прекратим запись событий из Ваших
          проектов.
        </Text>
        <Text>
          {recentEventsCount
            ? `Сейчас Вы отправляете около ${formatEvents(recentEventsCount)} событий в месяц. `
            : 'Вы всё ещё отправляете события. '}
          Всё это перестанет записываться {blockDate} — запросы будут уходить,
          но не попадут никуда. Всё, что Вы захотите посмотреть потом, с этой
          даты будет отсутствовать.
        </Text>
        {highlight ? <Text>{highlight}</Text> : null}
        <Text>
          {recommendedPlan
            ? `Продолжение работы стоит ${recommendedPlan}.`
            : 'Тарифы начинаются с $2.50 в месяц.'}{' '}
          В Вашей настройке ничего не меняется — ни передеплой, ни новые ключи.
        </Text>
        {cta}
        <Text>
          Нужно больше времени или хотите обсудить, какой тариф подойдёт?
          Ответьте на письмо — всё устрою.
        </Text>
        <Text>Carl</Text>
      </Layout>
    );
  }

  if (hasData) {
    return (
      <Layout unsubscribeUrl={unsubscribeUrl}>
        {greeting}
        <Text>
          Напоминание с конкретной датой: {blockDate} мы перестанем принимать
          события из Ваших проектов, и рабочее пространство начнёт
          сворачиваться.
        </Text>
        <Text>
          Всё, что уже собрано, пока остаётся на месте
          {eventsCount ? ` — событий всего: ${formatEvents(eventsCount)}` : ''}
          . Если хотите сохранить данные, тариф до {blockDate} оставит всё в
          точности как есть.
        </Text>
        {cta}
        <Text>Carl</Text>
      </Layout>
    );
  }

  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      {greeting}
      <Text>
        Короткое напоминание: пробный период закончился пару недель назад, а
        рабочее пространство всё ещё пустое, поэтому {blockDate} я его закрою.
      </Text>
      <Text>
        Если хотите его сохранить, оформление тарифа остановит процесс. Иначе
        можете просто проигнорировать это письмо — перед удалением я напишу
        ещё раз.
      </Text>
      {cta}
      <Text>Carl</Text>
    </Layout>
  );
}

WindDownStoppingSoon.PreviewProps = {
  firstName: 'Alex',
  billingUrl: 'https://dashboard.openpanel.dev/org-id/billing',
  blockDate: '14 марта',
  recommendedPlan: '100 000 событий в месяц за $20.00',
  hasData: true,
  stillTracking: true,
  eventsCount: 842_110,
  recentEventsCount: 128_400,
  projectNames: ['acme-web'],
  highlight:
    'acme-web получил 12 400 посетителей за последние 30 дней с пиком 840 12 ноября — а /pricing стала самой посещаемой страницей.',
};
