import { Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Button } from '../components/button';
import { Layout } from '../components/layout';
import { withUtm } from '../utm';

export const zWindDownBlocked = z.object({
  firstName: z.string().optional(),
  billingUrl: z.string(),
  deleteDate: z.string(),
  hasData: z.boolean().default(true),
  stillTracking: z.boolean().default(false),
  eventsCount: z.number().optional(),
  recentEventsCount: z.number().optional(),
});

const formatEvents = (count: number) =>
  new Intl.NumberFormat('ru-RU').format(count);

export type Props = z.infer<typeof zWindDownBlocked>;
export default WindDownBlocked;
export function WindDownBlocked({
  firstName,
  billingUrl = 'https://dashboard.openpanel.dev',
  deleteDate,
  hasData = true,
  stillTracking = false,
  eventsCount,
  recentEventsCount,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  const greeting = <Text>Здравствуйте{firstName ? `, ${firstName}` : ''}!</Text>;
  const cta = (
    <Text>
      <Button href={withUtm(billingUrl, 'wind-down-blocked')}>
        Возобновить отслеживание
      </Button>
    </Text>
  );

  if (stillTracking) {
    return (
      <Layout unsubscribeUrl={unsubscribeUrl}>
        {greeting}
        <Text>
          С сегодняшнего дня мы прекратили запись событий из Ваших проектов.
          {recentEventsCount
            ? ` Ваши SDK по-прежнему отправляют данные — около ${formatEvents(recentEventsCount)} событий за последний месяц, — и с этого момента эти запросы отклоняются.`
            : ' Ваши SDK продолжат отправлять данные; эти запросы теперь отклоняются.'}
        </Text>
        <Text>
          Ничего не удалено.
          {eventsCount
            ? ` События, собранные до сегодняшнего дня (${formatEvents(eventsCount)}), в целости и ждут Вас.`
            : ' Всё, что собрано до сегодняшнего дня, в целости и никуда не денется.'}{' '}
          Оформите подписку — запись возобновится в течение
          нескольких минут, вся история останется там, где Вы её остановили, —
          но пробел, начиная с сегодняшнего дня, задним числом не заполнить.
        </Text>
        {cta}
        <Text>
          Скажу прямо, что будет дальше: если рабочее пространство всё ещё
          будет неактивно {deleteDate}, оно и его данные будут удалены. Я
          отправлю ещё одно письмо задолго до этого момента.
        </Text>
        <Text>
          Если проблема в цене, ответьте на письмо — я лучше найду подходящий
          вариант, чем потеряю Ваши данные.
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
          С сегодняшнего дня Ваши проекты больше не принимают новые события.
          Ничего не удалено —
          {eventsCount
            ? ` собранные события (${formatEvents(eventsCount)}) в целости`
            : ' всё собранное в целости'}, и оформление тарифа мгновенно всё
          вернёт.
        </Text>
        {cta}
        <Text>
          Если рабочее пространство всё ещё будет неактивно {deleteDate}, оно и
          его данные будут удалены. Перед этим я отправлю ещё одно письмо.
        </Text>
        <Text>Carl</Text>
      </Layout>
    );
  }

  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      {greeting}
      <Text>
        Ваше рабочее пространство теперь закрыто для новых событий. События в
        нём никогда не отслеживались, так что это по большей части уборка с
        моей стороны.
      </Text>
      <Text>
        Его можно восстановить до {deleteDate}. Оформите тариф до этого
        момента, и оно вернётся в исходное состояние.
      </Text>
      {cta}
      <Text>Carl</Text>
    </Layout>
  );
}

WindDownBlocked.PreviewProps = {
  firstName: 'Alex',
  billingUrl: 'https://dashboard.openpanel.dev/org-id/billing',
  deleteDate: '10 апреля',
  hasData: true,
  stillTracking: true,
  eventsCount: 842_110,
  recentEventsCount: 128_400,
};
