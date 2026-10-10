import { Link, Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Button } from '../components/button';
import { Layout } from '../components/layout';
import { withUtm } from '../utm';

export const zTrackingDataStopped = z.object({
  firstName: z.string().optional(),
  projectNames: z.array(z.string()).min(1),
  lastEventDate: z.string().optional(),
  dashboardUrl: z.string(),
});

export type Props = z.infer<typeof zTrackingDataStopped>;
export default TrackingDataStopped;
export function TrackingDataStopped({
  firstName,
  projectNames,
  lastEventDate,
  dashboardUrl = 'http://localhost:3000',
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  const single = projectNames.length === 1;
  const names = projectNames.join(', ');
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Здравствуйте{firstName ? `, ${firstName}` : ''}!</Text>
      <Text>
        {single
          ? `Проект ${names} перестал`
          : `Проекты (${names}) перестали`}{' '}
        отправлять события
        {lastEventDate
          ? ` — последнее событие пришло ${lastEventDate}`
          : ' около недели назад'}
        .
      </Text>
      <Text>
        Обычно это происходит не специально: при деплое потерялся скрипт
        отслеживания, изменился client ID или появился новый домен, которого
        нет в списке разрешённых источников. Стоит быстро проверить, чтобы не
        образовался пробел в данных.
      </Text>
      <Text>
        <Button href={withUtm(dashboardUrl, 'tracking-data-stopped')}>
          Проверить проект
        </Button>
      </Text>
      <Text>
        В{' '}
        <Link href="#">
          руководстве по установке
        </Link>{' '}
        есть инструкции по переустановке для каждого фреймворка. Если события
        остановлены намеренно — ничего делать не нужно, извините за лишнее
        письмо. Если нет — ответьте на письмо, помогу разобраться.
      </Text>
      <Text>Carl</Text>
    </Layout>
  );
}

TrackingDataStopped.PreviewProps = {
  firstName: 'Alex',
  projectNames: ['Мой сайт'],
  lastEventDate: '14 августа',
  dashboardUrl: 'http://localhost:3000/org-id',
};
