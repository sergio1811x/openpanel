import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { SubscriptionState } from './subscription-state.js';

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive';
type Tone = 'default' | 'warning' | 'destructive';

export type SubscriptionStateMeta = {
  /** Sidebar badge, or null when nothing should be shown. */
  badge: { label: string; variant: BadgeVariant } | null;
  /** App-level banner, or null when no banner should show for this state. */
  banner: {
    title: string;
    description: string;
    cta: string;
    tone: Tone;
  } | null;
  /** Inline status line on the billing page, or null. */
  statusLine: { text: string; tone: Tone } | null;
  /** BillingPrompt copy key when this state blocks the dashboard. */
  blockType: 'expired' | 'trialEnded' | 'unpaid' | 'paused' | null;
};

const fmt = (date: Date | null | undefined) =>
  date ? format(date, 'PPP', { locale: ru }) : null;

/**
 * Single source of truth for how every subscription state is presented across
 * the dashboard (billing page status line, app banner, sidebar badge, and the
 * blocking BillingPrompt). All lifecycle dates come from `subscriptionEndsAt`.
 */
export function getSubscriptionStateMeta(
  state: SubscriptionState,
  opts: {
    endsAt?: Date | null;
    canceledAt?: Date | null;
    resumesAt?: Date | null;
  }
): SubscriptionStateMeta {
  const endsAt = fmt(opts.endsAt);
  const canceledAt = fmt(opts.canceledAt);
  const resumesAt = fmt(opts.resumesAt);

  switch (state) {
    case 'self_hosted':
    case 'active':
      return {
        badge: null,
        banner: null,
        statusLine: endsAt
          ? { text: `Ваша подписка автоматически продлится ${endsAt}`, tone: 'default' }
          : null,
        blockType: null,
      };

    case 'trialing':
      return {
        badge: { label: 'Триал', variant: 'secondary' },
        banner: {
          title: 'Бесплатный триал',
          description: endsAt
            ? `Ваша организация использует бесплатный триал. Он закончится ${endsAt}.`
            : 'Ваша организация использует бесплатный триал.',
          cta: 'Улучшить — от $2.5/мес',
          tone: 'default',
        },
        statusLine: endsAt
          ? { text: `Ваш триал закончится ${endsAt}`, tone: 'default' }
          : null,
        blockType: null,
      };

    case 'trial_expired':
      return {
        badge: { label: 'Триал окончен', variant: 'destructive' },
        banner: {
          title: 'Триал окончен',
          description:
            'Бесплатный триал завершён. Перейдите на платный тариф, чтобы продолжить пользоваться OpenPanel.',
          cta: 'Улучшить тариф',
          tone: 'destructive',
        },
        statusLine: { text: 'Бесплатный триал завершён.', tone: 'destructive' },
        blockType: 'trialEnded',
      };

    case 'canceling':
      return {
        badge: { label: 'Отменяется', variant: 'warning' },
        banner: {
          title: 'Подписка будет отменена',
          description: endsAt
            ? `Вы отменили подписку. Она будет отменена ${endsAt} — повторно активируйте её, чтобы сохранить доступ.`
            : 'Вы отменили подписку. Повторно активируйте её, чтобы сохранить доступ.',
          cta: 'Возобновить',
          tone: 'warning',
        },
        statusLine: endsAt
          ? {
              text: `Ваша подписка будет отменена ${endsAt}`,
              tone: 'destructive',
            }
          : null,
        blockType: null,
      };

    case 'canceled':
      return {
        badge: { label: 'Отменена', variant: 'destructive' },
        banner: {
          title: 'Подписка отменена',
          description: canceledAt
            ? `Ваша подписка была отменена ${canceledAt}. Выберите тариф, чтобы вернуть доступ.`
            : 'Ваша подписка была отменена. Выберите тариф, чтобы вернуть доступ.',
          cta: 'Выбрать тариф',
          tone: 'destructive',
        },
        statusLine: {
          text: canceledAt
            ? `Ваша подписка была отменена ${canceledAt}`
            : 'Ваша подписка была отменена',
          tone: 'destructive',
        },
        blockType: 'expired',
      };

    case 'pausing':
      return {
        badge: { label: 'Приостанавливается', variant: 'warning' },
        banner: {
          title: 'Подписка будет приостановлена',
          description: endsAt
            ? `Ваша подписка будет приостановлена ${endsAt}. Мы продолжаем собирать ваши события во время паузы${resumesAt ? `, списания возобновятся ${resumesAt}` : ''}.`
            : `Подписка будет приостановлена в конце текущего периода. Мы продолжаем собирать ваши события во время паузы.`,
          cta: 'Оставить подписку',
          tone: 'warning',
        },
        statusLine: endsAt
          ? {
              text: `Ваша подписка будет приостановлена ${endsAt}`,
              tone: 'warning',
            }
          : {
              text: 'Подписка будет приостановлена в конце текущего периода',
              tone: 'warning',
            },
        blockType: null,
      };

    case 'paused':
      return {
        badge: { label: 'Приостановлена', variant: 'warning' },
        banner: {
          title: 'Подписка приостановлена',
          description: resumesAt
            ? `Подписка приостановлена и возобновится ${resumesAt}. События продолжают собираться.`
            : 'Подписка приостановлена. События продолжают собираться — возобновите её в любой момент, чтобы продолжить с того же места.',
          cta: 'Возобновить подписку',
          tone: 'warning',
        },
        statusLine: {
          text: resumesAt
            ? `Подписка приостановлена до ${resumesAt}`
            : 'Подписка приостановлена',
          tone: 'warning',
        },
        blockType: 'paused',
      };

    case 'past_due':
      return {
        badge: { label: 'Просрочено', variant: 'warning' },
        banner: {
          title: 'Платёж просрочен',
          description:
            'Последний платёж не прошёл. Обновите способ оплаты, чтобы не потерять доступ.',
          cta: 'Обновить оплату',
          tone: 'warning',
        },
        statusLine: {
          text: 'Последний платёж не прошёл — обновите способ оплаты.',
          tone: 'destructive',
        },
        blockType: null,
      };

    case 'unpaid':
      return {
        badge: { label: 'Не оплачено', variant: 'destructive' },
        banner: {
          title: 'Подписка не оплачена',
          description:
            'Подписка не оплачена. Обновите способ оплаты, чтобы восстановить доступ.',
          cta: 'Обновить оплату',
          tone: 'destructive',
        },
        statusLine: {
          text: 'Подписка не оплачена.',
          tone: 'destructive',
        },
        blockType: 'unpaid',
      };

    case 'incomplete':
      return {
        badge: { label: 'Не завершено', variant: 'warning' },
        banner: {
          title: 'Завершите настройку подписки',
          description:
            'Настройка подписки не завершена. Завершите оформление, чтобы активировать её.',
          cta: 'Завершить оформление',
          tone: 'warning',
        },
        statusLine: {
          text: 'Настройка подписки не завершена.',
          tone: 'destructive',
        },
        blockType: null,
      };

    case 'expired':
      return {
        badge: { label: 'Истекла', variant: 'destructive' },
        banner: {
          title: 'Подписка истекла',
          description: endsAt
            ? `Ваша подписка истекла ${endsAt}. Выберите тариф, чтобы вернуть доступ.`
            : 'Ваша подписка истекла. Выберите тариф, чтобы вернуть доступ.',
          cta: 'Выбрать тариф',
          tone: 'destructive',
        },
        statusLine: {
          text: endsAt
            ? `Ваша подписка истекла ${endsAt}`
            : 'Ваша подписка истекла',
          tone: 'destructive',
        },
        blockType: 'expired',
      };

    default: {
      // Exhaustiveness guard — every SubscriptionState must be handled above.
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
