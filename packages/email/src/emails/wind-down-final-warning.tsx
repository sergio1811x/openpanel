import { Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Button } from '../components/button';
import { Layout } from '../components/layout';
import { withUtm } from '../utm';

export const zWindDownFinalWarning = z.object({
  firstName: z.string().optional(),
  billingUrl: z.string(),
  deleteDate: z.string(),
  hasData: z.boolean().default(true),
  stillTracking: z.boolean().default(false),
  eventsCount: z.number().optional(),
  recentEventsCount: z.number().optional(),
});

const formatEvents = (count: number) =>
  new Intl.NumberFormat('ru-RU').format(count);

export type Props = z.infer<typeof zWindDownFinalWarning>;
export default WindDownFinalWarning;
export function WindDownFinalWarning({
  firstName,
  billingUrl = 'http://localhost:3000',
  deleteDate,
  hasData = true,
  stillTracking = false,
  eventsCount,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Здравствуйте{firstName ? `, ${firstName}` : ''}!</Text>
      <Text>
        Это последнее письмо по этому поводу, и именно оно влечёт реальные
        последствия, поэтому буду краток.
      </Text>
      <Text>
        <strong>
          {deleteDate} Ваша организация Openpanel RU и всё её содержимое будут
          безвозвратно удалены.
        </strong>{' '}
        Это значит, что Ваши проекты, настройки и
        {hasData && eventsCount
          ? ` все собранные события (${formatEvents(eventsCount)}).`
          : ' любые данные, связанные с аккаунтом.'}{' '}
        Отменить это невозможно, и после удаления я не смогу ничего
        восстановить.
      </Text>
      {stillTracking ? (
        <Text>
          Обратите внимание: Ваши SDK всё ещё установлены и продолжают
          отправлять запросы. После {deleteDate} эти запросы будут завершаться
          с ошибкой, поскольку рабочее пространство перестанет существовать,
          так что стоит либо оформить подписку, либо удалить код отслеживания.
        </Text>
      ) : null}
      <Text>
        С окончания пробного периода прошло шесть недель, и до этого письма я
        писал Вам трижды, поэтому не хочу, чтобы оно стало неожиданностью.
      </Text>
      <Text>
        Оформление тарифа до {deleteDate} отменит удаление и мгновенно всё
        восстановит.
      </Text>
      <Text>
        <Button href={withUtm(billingUrl, 'wind-down-final-warning')}>
          Сохранить мои данные
        </Button>
      </Text>
      <Text>
        Если данные нужны, а подписка — нет, ответьте до {deleteDate}{' '}
        и я экспортирую их для Вас. Если хотите, чтобы всё было удалено, делать
        ничего не нужно.
      </Text>
      <Text>Carl</Text>
    </Layout>
  );
}

WindDownFinalWarning.PreviewProps = {
  firstName: 'Alex',
  billingUrl: 'http://localhost:3000/org-id/billing',
  deleteDate: '10 апреля',
  hasData: true,
  stillTracking: true,
  eventsCount: 842_110,
  recentEventsCount: 128_400,
};
