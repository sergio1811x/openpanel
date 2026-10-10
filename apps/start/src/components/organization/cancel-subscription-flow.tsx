import type { IServiceOrganization } from '@openpanel/db';
import type { ICancellationReason } from '@openpanel/validation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ButtonContainer } from '@/components/button-container';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTRPC } from '@/integrations/trpc/react';
import { ModalHeader } from '@/modals/Modal/Container';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/date';
import { op } from '@/utils/op';

// The cancel flow lives inside the SelectBillingPlan modal as internal views
// (no stacked modals): reason -> pause offer -> discount offer -> cancel.

interface Props {
  organization: IServiceOrganization;
  // Back to the plan picker view.
  onBack: () => void;
  // A flow outcome happened (paused, discounted, or canceled) — close the modal.
  onComplete: () => void;
}

const REASONS: { value: ICancellationReason; label: string }[] = [
  { value: 'unused', label: 'Я пока не пользуюсь сервисом' },
  { value: 'too_expensive', label: 'Это слишком дорого' },
  { value: 'missing_features', label: 'Не хватает нужных функций' },
  { value: 'switched_service', label: 'Я перешёл на другой сервис' },
  { value: 'too_complex', label: 'Это слишком сложно' },
  { value: 'low_quality', label: 'Качество не оправдало ожиданий' },
  { value: 'customer_service', label: 'Не доволен клиентской поддержкой' },
  { value: 'other', label: 'Другое' },
];

const PAUSE_MONTHS = [1, 2, 3] as const;

type Step = 'reason' | 'pause' | 'discount';

export default function CancelSubscriptionFlow({
  organization,
  onBack,
  onComplete,
}: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('reason');
  const [reason, setReason] = useState<ICancellationReason | null>(null);
  const [comment, setComment] = useState('');
  const [pauseMonths, setPauseMonths] = useState<1 | 2 | 3>(1);

  const discountAvailable = !organization.subscriptionSaveDiscountAppliedAt;

  // Funnel instrumentation. Every step render emits a step_viewed event, and
  // the unmount cleanup emits cancel_flow_abandoned when the flow closes with
  // no recorded outcome (X, esc, click-outside, navigation) — that's the
  // silent drop-off a decisions-only funnel can't see. Refs so the cleanup
  // reads the latest values.
  const outcomeRef = useRef<
    'paused' | 'discounted' | 'canceled' | 'kept' | null
  >(null);
  const stepRef = useRef<Step>('reason');
  stepRef.current = step;
  const reasonRef = useRef<ICancellationReason | null>(null);
  reasonRef.current = reason;

  useEffect(() => {
    op.track('cancel_flow_step_viewed', {
      organizationId: organization.id,
      step,
      reason: reasonRef.current,
    });
  }, [step, organization.id]);

  useEffect(
    () => () => {
      if (!outcomeRef.current) {
        op.track('cancel_flow_abandoned', {
          organizationId: organization.id,
          step: stepRef.current,
          reason: reasonRef.current,
        });
      }
    },
    [organization.id]
  );

  const invalidate = () => {
    queryClient.invalidateQueries(trpc.organization.pathFilter());
    queryClient.invalidateQueries(trpc.subscription.pathFilter());
  };

  const pauseMutation = useMutation(
    trpc.subscription.pauseSubscription.mutationOptions({
      onSuccess(data) {
        outcomeRef.current = 'paused';
        invalidate();
        toast.success('Подписка приостановлена', {
          description: `Списание остановится в конце текущего периода и возобновится ${formatDate(data.resumesAt)}. Ваши события продолжают поступать.`,
        });
        onComplete();
      },
      onError(error) {
        toast.error(error.message);
      },
    })
  );

  const discountMutation = useMutation(
    trpc.subscription.applySaveDiscount.mutationOptions({
      onSuccess() {
        outcomeRef.current = 'discounted';
        invalidate();
        toast.success('Скидка применена', {
          description:
            'Скидка 30% на следующие 12 месяцев, начиная со следующего расчётного цикла.',
        });
        onComplete();
      },
      onError(error) {
        toast.error(error.message);
      },
    })
  );

  const cancelMutation = useMutation(
    trpc.subscription.cancelSubscription.mutationOptions({
      onSuccess() {
        outcomeRef.current = 'canceled';
        invalidate();
        toast.success('Подписка отменена', {
          description: organization.subscriptionEndsAt
            ? `Ваша подписка останется активной до ${formatDate(organization.subscriptionEndsAt)}.`
            : 'Обновление может занять несколько секунд',
        });
        onComplete();
      },
      onError(error) {
        toast.error(error.message);
      },
    })
  );

  const isPending =
    pauseMutation.isPending ||
    discountMutation.isPending ||
    cancelMutation.isPending;

  const cancelNow = () => {
    if (!reason) {
      return;
    }
    op.track('subscription_canceled', {
      organizationId: organization.id,
      reason,
    });
    cancelMutation.mutate({
      organizationId: organization.id,
      reason,
      comment: comment.trim() || undefined,
    });
  };

  if (step === 'reason') {
    return (
      <>
        <ModalHeader
          text="Прежде чем уйти — какова основная причина? Это действительно помогает нам стать лучше."
          title="Отмена подписки"
        />
        <div className="scrollbar-thin col min-h-0 flex-1 gap-4 overflow-y-auto">
          <div className="col shrink-0 divide-y divide-border overflow-hidden rounded-lg border">
            {REASONS.map((item) => (
              <button
                className={cn(
                  'row shrink-0 items-center justify-between p-4 py-3 text-left transition-colors hover:bg-def-100',
                  reason === item.value && 'bg-def-100'
                )}
                key={item.value}
                onClick={() => setReason(item.value)}
                type="button"
              >
                <span className="font-medium">{item.label}</span>
                {reason === item.value && (
                  <div className="center-center size-4 shrink-0 rounded-full bg-emerald-600 text-primary-foreground">
                    <CheckIcon className="size-2" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <Textarea
            className="shrink-0"
            onChange={(event) => setComment(event.target.value)}
            placeholder="Хотите что-то добавить? (необязательно)"
            value={comment}
          />
        </div>
        <ButtonContainer className="shrink-0 gap-2 [&>*]:flex-1">
          <Button
            onClick={() => {
              outcomeRef.current = 'kept';
              op.track('cancel_flow_dismissed', {
                organizationId: organization.id,
                step: 'reason',
                reason,
              });
              onBack();
            }}
            variant="outline"
          >
            Передумать
          </Button>
          <Button
            disabled={!reason}
            onClick={() => {
              op.track('cancel_reason_selected', {
                organizationId: organization.id,
                reason,
              });
              setStep('pause');
            }}
            variant="destructive"
          >
            Продолжить
          </Button>
        </ButtonContainer>
      </>
    );
  }

  if (step === 'pause') {
    return (
      <>
        <ModalHeader
          text="Приостановите подписку: списание остановится в конце текущего периода, мы продолжим собирать Ваши события, и всё останется точно так, как Вы оставили, когда вернётесь."
          title="Может, сделать паузу?"
        />
        <div className="scrollbar-thin col min-h-0 flex-1 gap-3 overflow-y-auto">
          <div className="row shrink-0 gap-2">
            {PAUSE_MONTHS.map((months) => (
              <Button
                className="flex-1"
                key={months}
                onClick={() => setPauseMonths(months)}
                variant={pauseMonths === months ? 'default' : 'outline'}
              >
                {months === 1 ? '1 месяц' : `${months} мес.`}
              </Button>
            ))}
          </div>
          <p className="shrink-0 text-muted-foreground text-sm">
            Списание возобновится автоматически после паузы — либо возобновите
            раньше в любой момент на странице биллинга. Во время паузы Вы ничего
            не платите.
          </p>
        </div>
        <ButtonContainer className="shrink-0 gap-2 [&>*]:flex-1">
          <Button
            disabled={isPending}
            loading={cancelMutation.isPending}
            onClick={() => {
              op.track('cancel_pause_declined', {
                organizationId: organization.id,
                reason,
              });
              if (discountAvailable) {
                setStep('discount');
              } else {
                cancelNow();
              }
            }}
            variant="outline"
          >
            {discountAvailable ? 'Нет, спасибо' : 'Нет, спасибо, отменить'}
          </Button>
          <Button
            disabled={isPending}
            loading={pauseMutation.isPending}
            onClick={() => {
              op.track('cancel_pause_accepted', {
                organizationId: organization.id,
                reason,
                months: pauseMonths,
              });
              pauseMutation.mutate({
                organizationId: organization.id,
                months: pauseMonths,
              });
            }}
          >
            Приостановить на {pauseMonths === 1 ? '1 месяц' : `${pauseMonths} мес.`}
          </Button>
        </ButtonContainer>
      </>
    );
  }

  return (
    <>
      <ModalHeader
        text="Мы хотели бы, чтобы Вы остались. Оставайтесь на текущем тарифе и получите скидку 30% на следующие 12 месяцев, начиная со следующего расчётного цикла."
        title="И последнее — скидка 30% на год"
      />
      <div className="scrollbar-thin col min-h-0 flex-1 overflow-y-auto">
        <div className="row shrink-0 items-center gap-3 rounded-lg border bg-def-100 p-4">
          <span className="font-bold font-mono text-3xl text-emerald-600 dark:text-emerald-500">
            −30%
          </span>
          <span className="text-muted-foreground">на следующие 12 месяцев</span>
        </div>
      </div>
      <ButtonContainer className="shrink-0 gap-2 [&>*]:flex-1">
        <Button
          disabled={isPending}
          loading={cancelMutation.isPending}
          onClick={() => {
            op.track('cancel_discount_declined', {
              organizationId: organization.id,
              reason,
            });
            cancelNow();
          }}
          variant="outline"
        >
          Отменить подписку
        </Button>
        <Button
          disabled={isPending}
          loading={discountMutation.isPending}
          onClick={() => {
            op.track('cancel_discount_accepted', {
              organizationId: organization.id,
              reason,
            });
            discountMutation.mutate({ organizationId: organization.id });
          }}
        >
          Применить скидку 30%
        </Button>
      </ButtonContainer>
    </>
  );
}
