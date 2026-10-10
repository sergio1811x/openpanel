import { Link, Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Button } from '../components/button';
import { Layout } from '../components/layout';
import { withUtm } from '../utm';

export const zTrackingNoData = z.object({
  firstName: z.string().optional(),
  projectNames: z.array(z.string()).min(1),
  dashboardUrl: z.string(),
});

export type Props = z.infer<typeof zTrackingNoData>;
export default TrackingNoData;
export function TrackingNoData({
  firstName,
  projectNames,
  dashboardUrl = 'https://dashboard.openpanel.dev',
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  const single = projectNames.length === 1;
  const names = projectNames.join(', ');
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Здравствуйте{firstName ? `, ${firstName}` : ''}!</Text>
      <Text>
        {single
          ? `Проект ${names} пока не получил`
          : `Проекты (${names}) пока не получили`}{' '}
        ни одного события — обычно это значит, что скрипт отслеживания не
        установлен или что-то блокирует его.
      </Text>
      <Text>
        Самые частые причины: скрипта нет на странице (или он ещё не задеплоен),
        client ID не совпадает или домен не добавлен в список разрешённых
        источников.
      </Text>
      <Text>
        <Button href={withUtm(dashboardUrl, 'tracking-no-data')}>
          Проверить установку
        </Button>
      </Text>
      <Text>
        Инструкции для конкретных фреймворков есть в{' '}
        <Link
          href={withUtm(
            'https://openpanel.dev/docs/get-started/install-openpanel',
            'tracking-no-data'
          )}
        >
          руководстве по установке
        </Link>
        . А если Вы уже пробовали и не заработало — ответьте на это письмо, я
        лично помогу всё запустить.
      </Text>
      <Text>Carl</Text>
    </Layout>
  );
}

TrackingNoData.PreviewProps = {
  firstName: 'Alex',
  projectNames: ['Мой сайт'],
  dashboardUrl: 'https://dashboard.openpanel.dev/org-id',
};
