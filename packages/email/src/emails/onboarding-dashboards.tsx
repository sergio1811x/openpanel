import { Link, Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Layout } from '../components/layout';
import { List } from '../components/list';
import { withUtm } from '../utm';

export const zOnboardingDashboards = z.object({
  firstName: z.string().optional(),
  dashboardUrl: z.string(),
  hasData: z.boolean().default(false),
  eventsCount: z.number().optional(),
});

const formatEvents = (count: number) =>
  new Intl.NumberFormat('ru-RU').format(count);

export type Props = z.infer<typeof zOnboardingDashboards>;
export default OnboardingDashboards;
export function OnboardingDashboards({
  firstName,
  dashboardUrl = 'https://dashboard.openpanel.dev',
  hasData = false,
  eventsCount,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  if (!hasData) {
    return (
      <Layout unsubscribeUrl={unsubscribeUrl}>
        <Text>Здравствуйте{firstName ? `, ${firstName}` : ''}!</Text>
        <Text>
          Прошла неделя, но Ваш проект так и не получил ни одного события,
          поэтому советы по дашбордам, которые я обычно отправляю, Вам пока не
          пригодятся.
        </Text>
        <Text>
          Если Вы всё ещё хотите попробовать OpenPanel, остаётся только
          установка:{' '}
          <Link
            href={withUtm(
              'https://openpanel.dev/docs/get-started/install-openpanel',
              'onboarding-dashboards',
            )}
          >
            руководство по установке
          </Link>
          .
        </Text>
        <Text>
          Если Вас что-то оттолкнуло в продукте, мне важно понять, что именно.
          Достаточно одной строки.
        </Text>
        <Text>Carl</Text>
      </Layout>
    );
  }

  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Здравствуйте{firstName ? `, ${firstName}` : ''}!</Text>
      <Text>
        {eventsCount
          ? `Вы уже отследили события: ${formatEvents(eventsCount)}. Следующий шаг — сделать их полезными.`
          : 'Ваши события уже поступают. Следующий шаг — сделать их полезными.'}
      </Text>
      <Text>
        Сами по себе сырые события мало что говорят. А вот дашборд с двумя-тремя
        отчётами — совсем другое:
      </Text>
      <List
        items={[
          'воронка для основного сценария',
          'динамика конверсии во времени',
          'откуда приходят Ваши посетители',
        ]}
      />
      <Text>
        Это займёт около десяти минут:{' '}
        <Link href={withUtm(dashboardUrl, 'onboarding-dashboards')}>
          создать дашборд
        </Link>
        .
      </Text>
      <Text>
        Когда он появится, Вы действительно будете его открывать. В этом
        разница между наличием аналитики и её использованием.
      </Text>
      <Text>Carl</Text>
      <span style={{ margin: '0 -20px', display: 'block' }}>
        <img
          src="https://openpanel.dev/_next/image?url=%2Fscreenshots%2Fdashboard-dark.webp&w=3840&q=75"
          alt="Дашборд"
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '5px',
          }}
        />
      </span>
    </Layout>
  );
}

OnboardingDashboards.PreviewProps = {
  firstName: 'Alex',
  dashboardUrl: 'https://dashboard.openpanel.dev/org-id',
  hasData: true,
  eventsCount: 48211,
};
