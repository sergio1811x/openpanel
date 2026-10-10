import { Link, Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Button } from '../components/button';
import { Layout } from '../components/layout';
import { withUtm } from '../utm';

export const zWindDownExpired = z.object({
  firstName: z.string().optional(),
  billingUrl: z.string(),
  blockDate: z.string(),
  trialEndedDate: z.string().optional(),
  recommendedPlan: z.string().optional(),
  hasData: z.boolean().default(true),
  /** SDKs are demonstrably still sending, months after the trial lapsed. */
  stillTracking: z.boolean().default(false),
  eventsCount: z.number().optional(),
  recentEventsCount: z.number().optional(),
  projectNames: z.array(z.string()).default([]),
  /**
   * AI-written (or deterministic-fallback) paragraph of concrete facts from
   * the org's own recent data. Only present for still-tracking orgs above the
   * volume threshold — see win-back-highlight.ts in the worker.
   */
  highlight: z.string().optional(),
});

const formatEvents = (count: number) =>
  new Intl.NumberFormat('ru-RU').format(count);

export type Props = z.infer<typeof zWindDownExpired>;
export default WindDownExpired;
export function WindDownExpired({
  firstName,
  billingUrl = 'http://localhost:3000',
  blockDate,
  trialEndedDate,
  recommendedPlan,
  hasData = true,
  stillTracking = false,
  eventsCount,
  recentEventsCount,
  projectNames = [],
  highlight,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  const greeting = <Text>Здравствуйте{firstName ? `, ${firstName}` : ''}!</Text>;
  const projectLabel =
    projectNames.length === 1
      ? projectNames[0]
      : projectNames.length > 1
        ? `${projectNames[0]} и ещё ${projectNames.length - 1}`
        : undefined;
  const mcpPitch = (
    <Text>
      С момента Вашего пробного периода появилось много нового — в том числе
      наш{' '}
      <Link href={withUtm('#', 'wind-down-expired')}>
        MCP-сервер
      </Link>
      : подключите Claude, Cursor или любой MCP-клиент и задавайте вопросы по
      этим данным обычным языком.
    </Text>
  );
  const cta = (
    <Text>
      <Button href={withUtm(billingUrl, 'wind-down-expired')}>
        Выбрать тариф
      </Button>
    </Text>
  );

  // Still sending. The persuasive fact is the live volume, not the history.
  if (stillTracking) {
    return (
      <Layout unsubscribeUrl={unsubscribeUrl}>
        {greeting}
        <Text>
          Отслеживание Openpanel RU всё ещё работает
          {trialEndedDate ? `, хотя Ваш пробный период закончился ${trialEndedDate}` : ''}
          .
          {recentEventsCount
            ? ` За последние 30 дней от Вас поступило событий: ${formatEvents(recentEventsCount)} — и мы записали каждое из них.`
            : ' Ваши SDK продолжают отправлять данные, и мы продолжаем их записывать.'}
        </Text>
        {highlight ? <Text>{highlight}</Text> : null}
        <Text>
          Лучше скажу прямо, чем позволю этому тихо завершиться: {blockDate} мы
          перестанем принимать события из Ваших проектов. SDK продолжат
          отправлять запросы, но ничего не будет записываться, и в истории с
          этого дня останется постоянный пробел.
        </Text>
        <Text>
          {recommendedPlan
            ? `При Вашем текущем объёме это ${recommendedPlan}.`
            : 'Тарифы начинаются с $2.50 в месяц.'}{' '}
          Оформите подписку до {blockDate} — и ничего не изменится: те же
          данные, та же настройка, дашборд разблокирован.
        </Text>
        {cta}
        {mcpPitch}
        <Text>
          Если проблема в цене или Вам нужна лишь часть отправляемого,
          ответьте на письмо — что-нибудь придумаем.
        </Text>
        <Text>Carl</Text>
      </Layout>
    );
  }

  // Tracked at some point, but nothing recent.
  if (hasData) {
    return (
      <Layout unsubscribeUrl={unsubscribeUrl}>
        {greeting}
        <Text>
          Пробный период закончился{trialEndedDate ? ` ${trialEndedDate}` : ''},
          поэтому дашборд заблокирован. Ваши данные
          {projectLabel ? ` из ${projectLabel}` : ''} всё ещё здесь —
          {eventsCount
            ? ` все собранные события (${formatEvents(eventsCount)}) на месте.`
            : ' всё, что Вы отслеживали, сохранено.'}
        </Text>
        <Text>
          Давно ничего не поступало, поэтому я предполагаю, что Вы ушли дальше.
          Если так, можете проигнорировать это письмо: в ближайшие недели я
          закрою рабочее пространство и отправлю напоминание перед удалением
          чего-либо.
        </Text>
        <Text>
          Если хотите продолжить,{' '}
          {recommendedPlan
            ? `тариф под Ваш объём — ${recommendedPlan}`
            : 'тарифы начинаются с $2.50 в месяц'}{' '}
          и всё продолжится с того места, где остановилось.
        </Text>
        {cta}
        {mcpPitch}
        <Text>Carl</Text>
      </Layout>
    );
  }

  // Never sent an event.
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      {greeting}
      <Text>
        Ваш пробный период Openpanel RU закончился. События до нас так и не дошли,
        поэтому хранить нечего и терять Вам нечего.
      </Text>
      <Text>
        В ближайшие недели я закрою рабочее пространство, если Вы не оформите
        тариф. Перед удалением чего-либо Вы получите напоминание.
      </Text>
      {cta}
      <Text>
        Если на этапе настройки что-то помешало, мне действительно важно это
        узнать. Достаточно одной строки.
      </Text>
      <Text>Carl</Text>
    </Layout>
  );
}

WindDownExpired.PreviewProps = {
  firstName: 'Alex',
  billingUrl: 'http://localhost:3000/org-id/billing',
  blockDate: '14 марта',
  trialEndedDate: '3 ноября 2025 г.',
  recommendedPlan: '100 000 событий в месяц за $20.00',
  hasData: true,
  stillTracking: true,
  eventsCount: 842_110,
  recentEventsCount: 128_400,
  projectNames: ['acme-web', 'acme-docs'],
  highlight:
    'acme-web получил 12 400 посетителей за последние 30 дней с пиком 840 12 ноября — а /pricing стала самой посещаемой страницей.',
};
