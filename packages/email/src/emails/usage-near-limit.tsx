import { Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Button } from '../components/button';
import { Layout } from '../components/layout';
import { withUtm } from '../utm';

export const zUsageNearLimit = z.object({
  firstName: z.string().optional(),
  organizationName: z.string(),
  billingUrl: z.string(),
  eventsCount: z.number(),
  eventsLimit: z.number(),
});

const formatNumber = (count: number) =>
  new Intl.NumberFormat('ru-RU').format(count);

export type Props = z.infer<typeof zUsageNearLimit>;
export default UsageNearLimit;
export function UsageNearLimit({
  firstName,
  organizationName,
  billingUrl = 'http://localhost:3000',
  eventsCount,
  eventsLimit,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  const percent = Math.round((eventsCount / eventsLimit) * 100);
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Здравствуйте{firstName ? `, ${firstName}` : ''}!</Text>
      <Text>
        Обратите внимание: организация {organizationName} уже использовала{' '}
        {formatNumber(eventsCount)} из {formatNumber(eventsLimit)} событий
        месячного лимита ({percent}%).
      </Text>
      <Text>
        Если лимит будет превышен, мы продолжим собирать все события — ничего
        не потеряется, — но графики перестанут показывать новые данные, пока
        Вы не перейдёте на другой тариф или не начнётся следующий расчётный
        период.
      </Text>
      <Text>
        <Button href={withUtm(billingUrl, 'usage-near-limit')}>
          Использование и тарифы
        </Button>
      </Text>
      <Text>
        Не уверены, какой тариф подойдёт? Ответьте на это письмо — помогу
        выбрать.
      </Text>
      <Text>Carl</Text>
    </Layout>
  );
}

UsageNearLimit.PreviewProps = {
  firstName: 'Alex',
  organizationName: 'Acme',
  billingUrl: 'http://localhost:3000/org-id/billing',
  eventsCount: 4200,
  eventsLimit: 5000,
};
