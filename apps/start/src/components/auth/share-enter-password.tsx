import { useTRPC } from '@/integrations/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ISignInShare, zSignInShare } from '@openpanel/validation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { PublicPageCard } from '../public-page-card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function ShareEnterPassword({
  shareId,
  shareType = 'overview',
}: {
  shareId: string;
  shareType?: 'overview' | 'dashboard' | 'report';
}) {
  const trpc = useTRPC();
  const mutation = useMutation(
    trpc.auth.signInShare.mutationOptions({
      onSuccess() {
        window.location.reload();
      },
      onError() {
        toast.error('Неверный пароль');
      },
    }),
  );
  const form = useForm<ISignInShare>({
    resolver: zodResolver(zSignInShare),
    defaultValues: {
      password: '',
      shareId,
      shareType,
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate({
      password: data.password,
      shareId,
      shareType,
    });
  });

  const typeLabel =
    shareType === 'dashboard'
      ? 'Дашборд'
      : shareType === 'report'
        ? 'Отчёт'
        : 'Обзор';

  return (
    <PublicPageCard
      title={`${typeLabel} защищён паролем`}
      description={`Введите правильный пароль, чтобы открыть ${typeLabel.toLowerCase()}`}
    >
      <form onSubmit={onSubmit} className="col gap-4">
        <Input
          {...form.register('password')}
          type="password"
          placeholder="Введите пароль"
          size="large"
        />
        <Button type="submit">Получить доступ</Button>
      </form>
    </PublicPageCard>
  );
}
