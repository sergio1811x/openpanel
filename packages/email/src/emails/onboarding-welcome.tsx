import { Link, Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Layout } from '../components/layout';
import { List } from '../components/list';
import { withUtm } from '../utm';

export const zOnboardingWelcome = z.object({
  firstName: z.string().optional(),
  dashboardUrl: z.string(),
  hasData: z.boolean().default(false),
});

export type Props = z.infer<typeof zOnboardingWelcome>;
export default OnboardingWelcome;
export function OnboardingWelcome({
  firstName,
  dashboardUrl = 'https://dashboard.openpanel.dev',
  hasData = false,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Здравствуйте{firstName ? `, ${firstName}` : ''}!</Text>
      <Text>Меня зовут Carl, я создаю OpenPanel. Спасибо за регистрацию.</Text>
      <Text>
        Ваш пробный период длится 30 дней и включает все возможности. Карта
        понадобится только тогда, когда Вы решите остаться.
      </Text>
      {hasData ? (
        <>
          <Text>
            События уже поступают — самое сложное позади. Осмотритесь в своём
            дашборде и ответьте на это письмо, если что-то выглядит странно.
          </Text>
          <Text>
            <Link href={withUtm(dashboardUrl, 'onboarding-welcome')}>
              Открыть дашборд
            </Link>
          </Text>
        </>
      ) : (
        <>
          <Text>
            Первый шаг — начать собирать данные. Установка обычно занимает
            несколько минут:
          </Text>
          <List
            items={[
              <Link
                key="install"
                href={withUtm(
                  'https://openpanel.dev/docs/get-started/install-openpanel',
                  'onboarding-welcome',
                )}
              >
                Установить скрипт отслеживания
              </Link>,
              <Link
                key="track"
                href={withUtm(
                  'https://openpanel.dev/docs/get-started/track-events',
                  'onboarding-welcome',
                )}
              >
                Отслеживать пользовательские события
              </Link>,
            ]}
          />
          <Text>Если возникнут сложности, просто ответьте на это письмо.</Text>
        </>
      )}
      <Text>Carl</Text>
    </Layout>
  );
}

OnboardingWelcome.PreviewProps = {
  firstName: 'Alex',
  dashboardUrl: 'https://dashboard.openpanel.dev/org-id',
  hasData: false,
};
