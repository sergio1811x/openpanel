import { Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Button } from '../components/button';
import { Layout } from '../components/layout';
import { withUtm } from '../utm';

export const zUsageLimitExceeded = z.object({
  firstName: z.string().optional(),
  organizationName: z.string(),
  billingUrl: z.string(),
  eventsLimit: z.number(),
});

const formatNumber = (count: number) =>
  new Intl.NumberFormat('ru-RU').format(count);

export type Props = z.infer<typeof zUsageLimitExceeded>;
export default UsageLimitExceeded;
export function UsageLimitExceeded({
  firstName,
  organizationName,
  billingUrl = 'https://dashboard.openpanel.dev',
  eventsLimit,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Здравствуйте{firstName ? `, ${firstName}` : ''}!</Text>
      <Text>
        Организация {organizationName} достигла месячного лимита в{' '}
        {formatNumber(eventsLimit)} событий.
      </Text>
      <Text>
        Важно: мы по-прежнему собираем все входящие события, ничего не
        теряется. Но графики остановлены в момент достижения лимита — новые
        данные не будут отображаться, пока Вы не перейдёте на другой тариф или
        не начнётся следующий расчётный период.
      </Text>
      <Text>
        Переход на другой тариф занимает минуту и открывает доступ ко всем
        данным, собранным за это время.
      </Text>
      <Text>
        <Button href={withUtm(billingUrl, 'usage-limit-exceeded')}>
          Сменить тариф
        </Button>
      </Text>
      <Text>
        Если этот месяц был исключением, можно просто дождаться сброса лимита.
        А если сомневаетесь между тарифами, ответьте на письмо — помогу
        разобраться.
      </Text>
      <Text>Carl</Text>
    </Layout>
  );
}

UsageLimitExceeded.PreviewProps = {
  firstName: 'Alex',
  organizationName: 'Acme',
  billingUrl: 'https://dashboard.openpanel.dev/org-id/billing',
  eventsLimit: 5000,
};
