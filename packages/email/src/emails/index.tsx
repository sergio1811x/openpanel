import type { z } from 'zod';
import { EmailInvite, zEmailInvite } from './email-invite';
import EmailResetPassword, {
  zEmailResetPassword,
} from './email-reset-password';
import OnboardingDashboards, {
  zOnboardingDashboards,
} from './onboarding-dashboards';
import OnboardingFeatureRequest, {
  zOnboardingFeatureRequest,
} from './onboarding-feature-request';
import OnboardingTrialEnding, {
  zOnboardingTrialEnding,
} from './onboarding-trial-ending';
import NotificationRule, { zNotificationRule } from './notification-rule';
import OnboardingWelcome, { zOnboardingWelcome } from './onboarding-welcome';
import OnboardingWhatToTrack, {
  zOnboardingWhatToTrack,
} from './onboarding-what-to-track';
import TrackingDataStopped, {
  zTrackingDataStopped,
} from './tracking-data-stopped';
import TrackingNoData, { zTrackingNoData } from './tracking-no-data';
import UsageLimitExceeded, {
  zUsageLimitExceeded,
} from './usage-limit-exceeded';
import UsageNearLimit, { zUsageNearLimit } from './usage-near-limit';
import WeeklyDigest, { zWeeklyDigest } from './weekly-digest';
import WindDownBlocked, { zWindDownBlocked } from './wind-down-blocked';
import WindDownExpired, { zWindDownExpired } from './wind-down-expired';
import WindDownFinalWarning, {
  zWindDownFinalWarning,
} from './wind-down-final-warning';
import WindDownStoppingSoon, {
  zWindDownStoppingSoon,
} from './wind-down-stopping-soon';

export const templates = {
  invite: {
    subject: (data: z.infer<typeof zEmailInvite>) =>
      `Приглашение в организацию ${data.organizationName}`,
    Component: EmailInvite,
    schema: zEmailInvite,
  },
  'reset-password': {
    subject: (data: z.infer<typeof zEmailResetPassword>) =>
      'Сброс пароля',
    Component: EmailResetPassword,
    schema: zEmailResetPassword,
  },
  'onboarding-welcome': {
    subject: () => 'Добро пожаловать в Openpanel RU',
    Component: OnboardingWelcome,
    schema: zOnboardingWelcome,
    category: 'onboarding' as const,
  },
  'onboarding-what-to-track': {
    subject: (data: z.infer<typeof zOnboardingWhatToTrack>) =>
      data.hasData ? 'Что отслеживать в первую очередь' : 'Не получается с установкой?',
    Component: OnboardingWhatToTrack,
    schema: zOnboardingWhatToTrack,
    category: 'onboarding' as const,
  },
  'onboarding-dashboards': {
    subject: (data: z.infer<typeof zOnboardingDashboards>) =>
      data.hasData ? 'Ваш первый дашборд' : 'Прошла неделя — данных пока нет',
    Component: OnboardingDashboards,
    schema: zOnboardingDashboards,
    category: 'onboarding' as const,
  },
  'onboarding-feature-request': {
    subject: () => 'Чего-то не хватает?',
    Component: OnboardingFeatureRequest,
    schema: zOnboardingFeatureRequest,
    category: 'onboarding' as const,
  },
  'onboarding-trial-ending': {
    subject: (data: z.infer<typeof zOnboardingTrialEnding>) =>
      data.trialEndDate
        ? `Пробный период Openpanel RU заканчивается ${data.trialEndDate}`
        : 'Пробный период Openpanel RU скоро закончится',
    Component: OnboardingTrialEnding,
    schema: zOnboardingTrialEnding,
    // Without a category these bypassed unsubscribe entirely (no suppression
    // check, no List-Unsubscribe header).
    category: 'onboarding' as const,
  },
  'wind-down-expired': {
    subject: (data: z.infer<typeof zWindDownExpired>) =>
      data.stillTracking
        ? 'Вы всё ещё отправляете события, но пробный период закончился'
        : 'Пробный период закончился, дашборд заблокирован',
    Component: WindDownExpired,
    schema: zWindDownExpired,
    category: 'account_lifecycle' as const,
  },
  'wind-down-stopping-soon': {
    subject: (data: z.infer<typeof zWindDownStoppingSoon>) =>
      `Мы прекратим запись Ваших событий ${data.blockDate}`,
    Component: WindDownStoppingSoon,
    schema: zWindDownStoppingSoon,
    category: 'account_lifecycle' as const,
  },
  'wind-down-blocked': {
    subject: (data: z.infer<typeof zWindDownBlocked>) =>
      data.stillTracking
        ? 'Ваши события больше не записываются'
        : 'Отслеживание событий приостановлено для Ваших проектов',
    Component: WindDownBlocked,
    schema: zWindDownBlocked,
    category: 'account_lifecycle' as const,
  },
  'wind-down-final-warning': {
    subject: (data: z.infer<typeof zWindDownFinalWarning>) =>
      `Последнее предупреждение: Ваши данные будут удалены ${data.deleteDate}`,
    Component: WindDownFinalWarning,
    schema: zWindDownFinalWarning,
    // Deliberately uncategorised, which makes it transactional: no suppression
    // check and no unsubscribe link. Telling someone their data is about to be
    // erased is a service notice, not marketing, and it must not be silenced
    // by an earlier opt-out.
  },
  'weekly-digest': {
    subject: (data: z.infer<typeof zWeeklyDigest>) =>
      `Ваша неделя в ${data.projectName}`,
    Component: WeeklyDigest,
    schema: zWeeklyDigest,
    category: 'weekly_digest' as const,
  },
  'usage-near-limit': {
    subject: (data: z.infer<typeof zUsageNearLimit>) =>
      `Вы использовали ${Math.round((data.eventsCount / data.eventsLimit) * 100)}% месячного лимита событий`,
    Component: UsageNearLimit,
    schema: zUsageNearLimit,
    category: 'product_alerts' as const,
  },
  'usage-limit-exceeded': {
    subject: () => 'Достигнут лимит событий — графики на паузе, данные продолжают собираться',
    Component: UsageLimitExceeded,
    schema: zUsageLimitExceeded,
    category: 'product_alerts' as const,
  },
  'tracking-no-data': {
    subject: () => 'Отслеживание пока не отправляет данные',
    Component: TrackingNoData,
    schema: zTrackingNoData,
    category: 'product_alerts' as const,
  },
  'tracking-data-stopped': {
    subject: (data: z.infer<typeof zTrackingDataStopped>) =>
      data.projectNames.length === 1
        ? `${data.projectNames[0]} перестал отправлять события`
        : 'Некоторые Ваши проекты перестали отправлять события',
    Component: TrackingDataStopped,
    schema: zTrackingDataStopped,
    category: 'product_alerts' as const,
  },
  'notification-rule': {
    subject: (data: z.infer<typeof zNotificationRule>) => data.title,
    Component: NotificationRule,
    schema: zNotificationRule,
    category: 'product_alerts' as const,
  },
} as const;

export type Templates = typeof templates;
export type TemplateKey = keyof Templates;
