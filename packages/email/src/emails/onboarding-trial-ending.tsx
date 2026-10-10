import { Link, Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Button } from '../components/button';
import { Layout } from '../components/layout';
import { withUtm } from '../utm';

export const zOnboardingTrialEnding = z.object({
  firstName: z.string().optional(),
  billingUrl: z.string(),
  recommendedPlan: z.string().optional(),
  trialEndDate: z.string().optional(),
  hasData: z.boolean().default(true),
  eventsCount: z.number().optional(),
});

const formatEvents = (count: number) =>
  new Intl.NumberFormat('ru-RU').format(count);

export type Props = z.infer<typeof zOnboardingTrialEnding>;
export default OnboardingTrialEnding;
export function OnboardingTrialEnding({
  firstName,
  billingUrl = 'http://localhost:3000',
  recommendedPlan,
  trialEndDate,
  hasData = true,
  eventsCount,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  const endsOn = trialEndDate ? `${trialEndDate}` : 'в ближайшие дни';

  if (!hasData) {
    return (
      <Layout unsubscribeUrl={unsubscribeUrl}>
        <Text>Здравствуйте{firstName ? `, ${firstName}` : ''}!</Text>
        <Text>
          Ваш пробный период заканчивается {endsOn}. Поскольку Ваш проект так и
          не получил событий, терять Вам нечего.
        </Text>
        <Text>
          Если время просто не подошло, можно установить скрипт сейчас и за
          оставшиеся дни проверить, полезен ли Openpanel RU:{' '}
          <Link href="#">
            руководство по установке
          </Link>
          .
        </Text>
        <Text>
          Если Вы уже пробовали и что-то не заработало, ответьте на письмо —
          помогу разобраться до конца пробного периода.
        </Text>
        <Text>Carl</Text>
      </Layout>
    );
  }

  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Здравствуйте{firstName ? `, ${firstName}` : ''}!</Text>
      <Text>
        Ваш пробный период заканчивается {endsOn}.
        {eventsCount
          ? ` Итоги на сегодня: событий за пробный период — ${formatEvents(eventsCount)}.`
          : ''}
      </Text>
      <Text>
        {recommendedPlan
          ? `При таком объёме Вам подходит тариф ${recommendedPlan}.`
          : 'Тарифы начинаются с $2.50 в месяц.'}{' '}
        При переходе ничего не меняется: те же дашборды, те же данные. Если не
        перейти, дашборд будет заблокирован по окончании пробного периода, а со
        временем рабочее пространство будет удалено.
      </Text>
      <Text>
        <Button href={withUtm(billingUrl, 'onboarding-trial-ending')}>
          Перейти на платный тариф
        </Button>
      </Text>
      <Text>
        Если что-то Вас останавливает, ответьте и расскажите. Я предпочту
        устранить причину, чем отправлять Вам ещё одно напоминание.
      </Text>
      <Text>Carl</Text>
    </Layout>
  );
}

OnboardingTrialEnding.PreviewProps = {
  firstName: 'Alex',
  billingUrl: 'http://localhost:3000/org-id/billing',
  recommendedPlan: '100 000 событий в месяц за $20.00',
  trialEndDate: '16 июня',
  hasData: true,
  eventsCount: 84211,
};
