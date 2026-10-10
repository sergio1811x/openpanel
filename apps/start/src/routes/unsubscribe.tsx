import FullPageLoadingState from '@/components/full-page-loading-state';
import { PublicPageCard } from '@/components/public-page-card';
import { Button, LinkButton } from '@/components/ui/button';
import { useTRPC } from '@/integrations/trpc/react';
import { emailCategories } from '@openpanel/constants';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';

const unsubscribeSearchSchema = z.object({
  email: z.string().email(),
  category: z.string(),
  token: z.string(),
});

export const Route = createFileRoute('/unsubscribe')({
  component: RouteComponent,
  validateSearch: unsubscribeSearchSchema,
  pendingComponent: FullPageLoadingState,
});

function RouteComponent() {
  const search = useSearch({ from: '/unsubscribe' });
  const { email, category, token } = search;
  const trpc = useTRPC();
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unsubscribeMutation = useMutation(
    trpc.email.unsubscribe.mutationOptions({
      onSuccess: () => {
        setIsSuccess(true);
        setIsUnsubscribing(false);
      },
      onError: (err) => {
        setError(err.message || 'Не удалось отписаться');
        setIsUnsubscribing(false);
      },
    }),
  );

  const handleUnsubscribe = () => {
    setIsUnsubscribing(true);
    setError(null);
    unsubscribeMutation.mutate({ email, category, token });
  };

  const categoryName =
    emailCategories[category as keyof typeof emailCategories]?.label ?? category;

  if (isSuccess) {
    return (
      <PublicPageCard
        title="Вы отписаны"
        description={`Вы отписались от рассылки «${categoryName}». Мы больше не будем отправлять вам такие письма.`}
      />
    );
  }

  return (
    <PublicPageCard
      title="Отписка от рассылки"
      description={
        <>
          Отписаться от писем «{categoryName}»? Вы перестанете получать
          письма, отправляемые на&nbsp;
          <span className="">{email}</span>
        </>
      }
    >
      <div className="col gap-3">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <Button onClick={handleUnsubscribe} disabled={isUnsubscribing}>
          {isUnsubscribing ? 'Отписываемся...' : 'Подтвердить отписку'}
        </Button>
        <LinkButton href="/" variant="ghost">
          Отмена
        </LinkButton>
      </div>
    </PublicPageCard>
  );
}
