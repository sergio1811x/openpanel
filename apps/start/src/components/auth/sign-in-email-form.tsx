import { useTRPC } from '@/integrations/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { zSignInEmail } from '@openpanel/validation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { InputWithLabel } from '../forms/input-with-label';
import { Button } from '../ui/button';

const validator = zSignInEmail;
type IForm = z.infer<typeof validator>;

export function SignInEmailForm({
  isLastUsed,
  inviteId,
}: { isLastUsed?: boolean; inviteId?: string }) {
  const trpc = useTRPC();
  const mutation = useMutation(
    trpc.auth.signInEmail.mutationOptions({
      async onSuccess(data) {
        if (data.type === 'totp_required') {
          window.location.href = '/verify';
          return;
        }
        toast.success('Вы успешно вошли в систему');
        window.location.href = '/';
      },
      onError(error) {
        toast.error(error.message);
      },
    }),
  );
  const form = useForm<IForm>({
    resolver: zodResolver(validator),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const onSubmit: SubmitHandler<IForm> = (values) => {
    mutation.mutate({
      ...values,
      inviteId,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="col gap-4">
      <InputWithLabel
        {...form.register('email')}
        error={form.formState.errors.email?.message}
        label="Email"
        className="bg-def-100/50 border-def-300 focus:border-highlight focus:ring-highlight/20"
      />
      <InputWithLabel
        {...form.register('password')}
        error={form.formState.errors.password?.message}
        label="Пароль"
        type="password"
        className="bg-def-100/50 border-def-300 focus:border-highlight focus:ring-highlight/20"
      />
      <div className="relative">
        <Button type="submit" size="lg" className="w-full">
          Войти
        </Button>
        {isLastUsed && (
          <span className="absolute -top-2 right-3 text-[10px] font-medium bg-highlight text-white px-1.5 py-0.5 rounded-full leading-none">
            Использовалась в прошлый раз
          </span>
        )}
      </div>
      {/* FORK (Openpanel RU): восстановление пароля через письмо выпилено —
          пароль задаёт/сбрасывает администратор скриптом create-user.mjs. */}
    </form>
  );
}
