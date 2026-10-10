import type { IServiceOrganization } from '@openpanel/db';
import { useQuery } from '@tanstack/react-query';
import { differenceInMonths } from 'date-fns';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTRPC } from '@/integrations/trpc/react';
import { pushModal } from '@/modals';
import { op } from '@/utils/op';

// Yearly plans churn a fraction of monthly ones. Nudge monthly subscribers who
// have stuck around for a while to switch — they get 2 months free, we keep
// them longer. Dismissal is per-org and per-browser.
const MIN_TENURE_MONTHS = 3;

const dismissKey = (organizationId: string) =>
  `op-yearly-prompt-dismissed:${organizationId}`;

const readDismissed = (organizationId: string) => {
  try {
    return localStorage.getItem(dismissKey(organizationId)) === '1';
  } catch {
    return true;
  }
};

export default function YearlySwitchPrompt({
  organization,
}: {
  organization: IServiceOrganization;
}) {
  const trpc = useTRPC();
  // Hidden until mounted so SSR and the first client render agree.
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    setDismissed(readDismissed(organization.id));
  }, [organization.id]);

  const eligible =
    organization.subscriptionState === 'active' &&
    organization.subscriptionInterval === 'month' &&
    !!organization.subscriptionFirstStartedAt &&
    differenceInMonths(new Date(), organization.subscriptionFirstStartedAt) >=
      MIN_TENURE_MONTHS;

  const accessQuery = useQuery(
    trpc.organization.myAccess.queryOptions(
      { organizationId: organization.id },
      { enabled: eligible && !dismissed }
    )
  );
  const isAdmin = accessQuery.data?.role === 'org:admin';

  const currentProductQuery = useQuery(
    trpc.subscription.getCurrent.queryOptions(
      { organizationId: organization.id },
      { enabled: eligible && !dismissed && isAdmin }
    )
  );

  if (!(eligible && isAdmin) || dismissed) {
    return null;
  }

  const dismiss = () => {
    op.track('yearly_prompt_dismissed', { organizationId: organization.id });
    try {
      localStorage.setItem(dismissKey(organization.id), '1');
    } catch {
      // Storage unavailable — the prompt just shows again next session.
    }
    setDismissed(true);
  };

  return (
    <div className="col gap-1 border-b bg-card p-4 lg:p-8">
      <div className="font-medium text-lg">
        Перейдите на годовую оплату — получите 2 месяца бесплатно
      </div>
      <div className="mb-1">
        Вы с нами уже некоторое время. Платите за 10 месяцев и получаете 12: тот
        же тариф, те же лимиты, один счёт в год.
      </div>
      <div className="row gap-2">
        <Button
          loading={currentProductQuery.isLoading}
          onClick={() => {
            op.track('yearly_prompt_clicked', {
              organizationId: organization.id,
            });
            pushModal('SelectBillingPlan', {
              organization,
              currentProduct: currentProductQuery.data ?? null,
              defaultInterval: 'year',
            });
          }}
        >
          Посмотреть годовую цену
        </Button>
        <Button onClick={dismiss} variant="outline">
          Может, позже
        </Button>
      </div>
    </div>
  );
}
