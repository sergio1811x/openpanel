import { Link, Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Layout } from '../components/layout';
import { withUtm } from '../utm';

export const zOnboardingFeatureRequest = z.object({
  firstName: z.string().optional(),
  hasData: z.boolean().default(true),
});

export type Props = z.infer<typeof zOnboardingFeatureRequest>;
export default OnboardingFeatureRequest;
export function OnboardingFeatureRequest({
  firstName,
  hasData = true,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Здравствуйте{firstName ? `, ${firstName}` : ''}!</Text>
      <Text>
        Пробный период уже наполовину пройден, поэтому короткий вопрос: есть
        ли что-то, что Вы ожидали от Openpanel RU, но не нашли?
      </Text>
      <Text>
        Просто ответьте на это письмо. Если предпочитаете публично, доска
        обратной связи находится здесь:{' '}
        <Link href="#">
          Openpanel RU
        </Link>
        .
      </Text>
      {!hasData && (
        <Text>
          А если Вы так и не успели настроить отслеживание — ничего страшного,
          но мне интересно, что помешало.
        </Text>
      )}
      <Text>Carl</Text>
    </Layout>
  );
}

OnboardingFeatureRequest.PreviewProps = {
  firstName: 'Alex',
  hasData: true,
};
