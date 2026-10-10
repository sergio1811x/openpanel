import { Link, Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Layout } from '../components/layout';
import { withUtm } from '../utm';

export const zOnboardingWhatToTrack = z.object({
  firstName: z.string().optional(),
  hasData: z.boolean().default(false),
  eventsCount: z.number().optional(),
});

const formatEvents = (count: number) =>
  new Intl.NumberFormat('ru-RU').format(count);

export type Props = z.infer<typeof zOnboardingWhatToTrack>;
export default OnboardingWhatToTrack;
export function OnboardingWhatToTrack({
  firstName,
  hasData = false,
  eventsCount,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Здравствуйте{firstName ? `, ${firstName}` : ''}!</Text>
      {hasData ? (
        <>
          <Text>
            Отслеживание уже работает
            {eventsCount ? ` (событий поступило: ${formatEvents(eventsCount)})` : ''}
            , поэтому делюсь советом, который даю всем на этом этапе.
          </Text>
          <Text>
            Не пытайтесь отслеживать всё подряд. Выберите один сценарий,
            который решает, работает ли Ваш продукт (регистрация, оформление
            заказа — что угодно), и настройте для него воронку. Двух-трёх
            пользовательских событий достаточно.
          </Text>
          <Text>
            Просмотры страниц говорят лишь о том, что люди пришли. Воронка
            говорит о том, сделали ли они то, ради чего Вы создавали продукт.
          </Text>
          <Text>
            Не уверены, что стоит отслеживать в Вашем продукте? Ответьте на
            это письмо и расскажите, что Вы создаёте, — я предложу конкретный
            вариант.
          </Text>
        </>
      ) : (
        <>
          <Text>
            Вы создали аккаунт Openpanel RU два дня назад, но события пока не
            поступали.
          </Text>
          <Text>
            Обычно это значит, что установка не выполнена или что-то блокирует
            скрипт. И то и другое быстро исправить:{' '}
            <Link href="#">
              руководство по установке
            </Link>
            .
          </Text>
          <Text>
            Если что-то в документации было непонятно, ответьте и напишите, где
            Вы застряли. В любом случае это мне поможет.
          </Text>
        </>
      )}
      <Text>Carl</Text>
    </Layout>
  );
}

OnboardingWhatToTrack.PreviewProps = {
  firstName: 'Alex',
  hasData: true,
  eventsCount: 12544,
};
