import type { IServiceOrganization } from '@openpanel/db';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckIcon } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button, LinkButton } from '@/components/ui/button';
import { useNumber } from '@/hooks/use-numer-formatter';
import { useTRPC } from '@/integrations/trpc/react';
import { formatDate } from '@/utils/date';
import { op } from '@/utils/op';

const FEATURES = [
  'Тарифы от $2.5 в месяц',
  'Безлимитные отчёты, участники и проекты',
  'Продвинутые воронки и конверсии',
  'Аналитика в реальном времени',
  'Отслеживание KPI и кастомных событий',
  'Фокус на приватности, соответствие GDPR',
  'Отслеживание выручки',
  'Интеграция с Google Search Console',
];

type BadgeVariant = 'secondary' | 'warning' | 'info';

interface CopyVariant {
  badge: { label: string; variant: BadgeVariant };
  gradient: string;
  title: string;
  lead: string;
  dateLabel: string;
  action: 'checkout' | 'portal' | 'resume';
  cta: (plan: string, price: string) => string;
  note: string | null;
}

const COPY: Record<
  'expired' | 'trialEnded' | 'unpaid' | 'freePlan' | 'paused',
  CopyVariant
> = {
  trialEnded: {
    badge: { label: 'Trial завершён', variant: 'secondary' },
    gradient: 'rgb(16 185 129)',
    title: 'Ваши 30 дней подошли к концу',
    lead: 'Спасибо, что попробовали Openpanel RU. Всё, что Вы настроили, осталось на месте: Ваши проекты, отчёты и все отслеженные события. Выберите тариф — и Ваши дашборды снова заработают примерно через минуту.',
    dateLabel: 'Trial завершён',
    action: 'checkout',
    cta: (plan, price) => `Продолжить с тарифом ${plan} за ${price}/мес.`,
    note: 'Мы пока продолжаем собирать входящие события, так что ничего не потеряется, пока Вы принимаете решение.',
  },
  expired: {
    badge: { label: 'Подписка закончилась', variant: 'info' },
    gradient: 'rgb(59 130 246)',
    title: 'Ваши данные там же, где Вы их оставили',
    lead: 'Ваша подписка закончилась, но мы ничего не удалили. Возобновите её — и Ваши дашборды, отчёты и события вернутся сразу же.',
    dateLabel: 'Подписка закончилась',
    action: 'checkout',
    cta: (plan, price) => `Возобновить с тарифом ${plan} за ${price}/мес.`,
    note: null,
  },
  unpaid: {
    badge: { label: 'Проблема с оплатой', variant: 'warning' },
    gradient: 'rgb(245 158 11)',
    title: 'Последний платёж не прошёл',
    lead: 'Обычно это истёкшая карта или блокировка банка, и исправить это можно за минуту. Обновите способ оплаты — и Ваши дашборды сразу вернутся. Ваши данные никуда не делись.',
    dateLabel: 'Оплачено до',
    action: 'portal',
    cta: () => 'Обновить способ оплаты',
    note: null,
  },
  paused: {
    badge: { label: 'Приостановлено', variant: 'secondary' },
    gradient: 'rgb(16 185 129)',
    title: 'Ваша подписка на паузе',
    lead: 'Вы приостановили подписку, поэтому списание остановлено — но мы по-прежнему собираем каждое событие. Возобновите в любой удобный момент, и Ваши дашборды сразу вернутся к тому состоянию, в котором Вы их оставили.',
    dateLabel: 'Списание возобновится',
    action: 'resume',
    cta: () => 'Возобновить подписку сейчас',
    note: 'Возобновление сразу запускает новый расчётный период. Во время паузы события продолжают собираться, так что ничего не потеряется.',
  },
  freePlan: {
    badge: { label: 'Изменение тарифов', variant: 'secondary' },
    gradient: 'rgb(16 185 129)',
    title: 'Мы вывели бесплатный тариф из эксплуатации',
    lead: 'Мы предпочитаем небольшой устойчивый сервис бесплатному, который не можем должным образом поддерживать. Платные тарифы начинаются от $2.5/мес., и Ваши данные переносятся как есть.',
    dateLabel: 'Подписка закончилась',
    action: 'checkout',
    cta: (plan, price) => `Продолжить с тарифом ${plan} за ${price}/мес.`,
    note: null,
  },
};

export default function BillingPrompt({
  organization,
  type,
}: {
  organization: IServiceOrganization;
  type: keyof typeof COPY;
}) {
  const number = useNumber();
  const trpc = useTRPC();
  const copy = COPY[type];
  const { data: products, isLoading: isLoadingProducts } = useQuery(
    trpc.subscription.products.queryOptions({
      organizationId: organization.id,
    })
  );
  const checkout = useMutation(
    trpc.subscription.checkout.mutationOptions({
      onSuccess(data) {
        if (data?.url) {
          window.location.href = data.url;
        } else {
          toast.success('Подписка обновлена', {
            description: 'Обновление может занять несколько секунд',
          });
        }
      },
      onError(error) {
        toast.error(error.message);
      },
    })
  );
  const portal = useMutation(
    trpc.subscription.portal.mutationOptions({
      onSuccess(data) {
        if (data?.url) {
          window.location.href = data.url;
        }
      },
      onError(error) {
        toast.error(error.message);
      },
    })
  );
  const queryClient = useQueryClient();
  const resume = useMutation(
    trpc.subscription.resumeSubscription.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(trpc.organization.pathFilter());
        queryClient.invalidateQueries(trpc.subscription.pathFilter());
        toast.success('С возвращением!', {
          description: 'Обновление может занять несколько секунд',
        });
      },
      onError(error) {
        toast.error(error.message);
      },
    })
  );

  const eventsCount = organization.subscriptionPeriodEventsCount ?? 0;
  const bestProductFit = products
    ?.filter(
      (product) =>
        product.recurringInterval === 'month' &&
        !product.disabled &&
        typeof product.metadata.eventsLimit === 'number' &&
        product.prices.some((price) => price.amountType === 'fixed')
    )
    .find(
      (product) =>
        typeof product.metadata.eventsLimit === 'number' &&
        product.metadata.eventsLimit >= eventsCount
    );
  const bestPrice = bestProductFit?.prices.find(
    (price) => price.amountType === 'fixed'
  );
  const price =
    bestPrice && 'priceAmount' in bestPrice
      ? number.currency(bestPrice.priceAmount / 100)
      : null;

  useEffect(() => {
    op.track('billing_prompt_viewed', {
      type,
    });
  }, [type]);

  const renderCta = () => {
    if (copy.action === 'resume') {
      return (
        <Button
          className="w-full"
          loading={resume.isPending}
          onClick={() => {
            op.track('billing_prompt_upgrade_clicked', {
              type,
              cta: 'resume',
            });
            resume.mutate({ organizationId: organization.id });
          }}
          size="lg"
        >
          {copy.cta('', '')}
        </Button>
      );
    }

    if (copy.action === 'portal') {
      return (
        <Button
          className="w-full"
          loading={portal.isPending}
          onClick={() => {
            op.track('billing_prompt_upgrade_clicked', {
              type,
              cta: 'portal',
            });
            portal.mutate({ organizationId: organization.id });
          }}
          size="lg"
        >
          {copy.cta('', '')}
        </Button>
      );
    }

    if (!(bestProductFit && bestPrice && price)) {
      // While products load we don't yet know if a plan fits. Render a plain
      // loading button here — `asChild` + `loading` can't coexist because the
      // spinner would give Radix's <Slot> a second child (React.Children.only).
      if (isLoadingProducts) {
        return (
          <Button className="w-full" loading size="lg">
            Загрузка тарифов
          </Button>
        );
      }
      return (
        <Button asChild className="w-full" size="lg">
          <a href="mailto:hello@openpanel.dev?subject=Custom plan">
            Получить индивидуальный тариф
          </a>
        </Button>
      );
    }

    return (
      <Button
        className="w-full"
        loading={isLoadingProducts || checkout.isPending}
        onClick={() => {
          op.track('billing_prompt_upgrade_clicked', {
            type,
            cta: 'checkout',
            price:
              'priceAmount' in bestPrice ? bestPrice.priceAmount / 100 : 0,
          });
          checkout.mutate({
            organizationId: organization.id,
            productPriceId: bestPrice.id,
            productId: bestProductFit.id,
          });
        }}
        size="lg"
      >
        {copy.cta(bestProductFit.name, price)}
      </Button>
    );
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 md:py-20">
      <div className="relative overflow-hidden rounded-lg border bg-card">
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${copy.gradient} 0%, transparent 70%)`,
          }}
        />

        <div className="col gap-3 p-6 md:p-8">
          <Badge variant={copy.badge.variant}>{copy.badge.label}</Badge>
          <h1 className="font-semibold text-2xl">{copy.title}</h1>
          <p className="text-muted-foreground leading-relaxed">{copy.lead}</p>
        </div>

        <div className="row gap-3 px-6 md:px-8">
          <div className="col flex-1 gap-1 rounded-md bg-def-200 p-4">
            <div className="font-bold font-mono text-2xl">
              {number.short(eventsCount)}
            </div>
            <div className="text-muted-foreground text-sm">
              Отслеженных событий — всё сохранено
            </div>
          </div>
          {(() => {
            // Paused shows the automatic resume date instead of the period end.
            const date =
              type === 'paused'
                ? organization.subscriptionResumesAt
                : organization.subscriptionEndsAt;
            if (!date) {
              return null;
            }
            return (
              <div className="col flex-1 gap-1 rounded-md bg-def-200 p-4">
                <div className="font-bold font-mono text-2xl">
                  {formatDate(date)}
                </div>
                <div className="text-muted-foreground text-sm">
                  {copy.dateLabel}
                </div>
              </div>
            );
          })()}
        </div>

        <div className="col gap-3 p-6 md:p-8">
          {copy.action === 'checkout' &&
            (bestProductFit ? (
              <p className="text-muted-foreground text-sm">
                Исходя из Вашего использования, Вам подойдёт тариф{' '}
                <strong className="text-foreground">
                  {bestProductFit.name}
                </strong>{' '}
                : до{' '}
                {number.short(Number(bestProductFit.metadata.eventsLimit))}{' '}
                событий в месяц за {price}.
              </p>
            ) : (
              !isLoadingProducts && (
                <p className="text-muted-foreground text-sm">
                  Ваше использование превышает наши стандартные тарифы, поэтому
                  давайте настроим для Вас индивидуальный.
                </p>
              )
            ))}
          {renderCta()}
          {copy.note && (
            <p className="text-muted-foreground text-sm">{copy.note}</p>
          )}
          <div className="row items-center justify-between gap-2">
            <LinkButton
              params={{ organizationId: organization.id }}
              to="/$organizationId/billing"
              variant="outline"
            >
              Все тарифы
            </LinkButton>
            <a
              className="text-muted-foreground text-sm hover:underline"
              href="mailto:hello@openpanel.dev"
            >
              Вопросы? Напишите нам
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <div className="row items-center gap-2" key={feature}>
            <CheckIcon className="size-4 shrink-0 text-emerald-500" />
            <span className="text-muted-foreground text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
