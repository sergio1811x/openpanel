import { Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Button } from '../components/button';
import { Layout } from '../components/layout';
import { withUtm } from '../utm';

export const zNotificationRule = z.object({
  title: z.string(),
  message: z.string(),
  projectName: z.string().optional(),
  dashboardUrl: z.string().optional(),
});

export type Props = z.infer<typeof zNotificationRule>;
export default NotificationRule;
export function NotificationRule({
  title,
  message,
  projectName,
  dashboardUrl,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>
        🔔 <strong>{title}</strong>
        {projectName ? ` — ${projectName}` : ''}
      </Text>
      <Text>{message}</Text>
      {dashboardUrl && (
        <Text>
          <Button href={withUtm(dashboardUrl, 'notification-rule')}>
            Открыть дашборд
          </Button>
        </Text>
      )}
      <Text>
        Вы получили это письмо, потому что сработало созданное Вами правило
        уведомлений. Управлять правилами можно в разделе «Уведомления» Вашего
        проекта.
      </Text>
    </Layout>
  );
}

NotificationRule.PreviewProps = {
  title: 'Конверсия: регистрация завершена',
  message: 'Пользователь прошёл воронку регистрации.',
  projectName: 'Мой сайт',
  dashboardUrl: 'http://localhost:3000/org-id/project-id',
};
