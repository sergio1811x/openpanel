import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { handleError } from '@/integrations/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@tanstack/react-router';
import { SendIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { InputWithLabel } from '@/components/forms/input-with-label';
import { useTRPC } from '@/integrations/trpc/react';
import { zRequestResetPassword } from '@openpanel/validation';
import { useMutation } from '@tanstack/react-query';
import { popModal } from '.';
import { ModalContent, ModalHeader } from './Modal/Container';

const validation = zRequestResetPassword;
type IForm = z.infer<typeof validation>;

type Props = {
  email?: string;
};

export default function RequestPasswordReset({ email }: Props) {
  const router = useRouter();
  const form = useForm<IForm>({
    resolver: zodResolver(validation),
    defaultValues: {
      email: email ?? '',
    },
  });
  const trpc = useTRPC();
  const mutation = useMutation(
    trpc.auth.requestResetPassword.mutationOptions({
      onSuccess() {
        toast.success('Скоро Вы получите письмо на email!');
        popModal();
      },
      onError: handleError,
    }),
  );

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({
      email: values.email,
    });
  });

  return (
    <ModalContent>
      <ModalHeader title="Сброс пароля" />
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <InputWithLabel
          label="Email"
          placeholder="Ваш email-адрес"
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />

        <DialogFooter>
          <Button
            type="button"
            variant={'secondary'}
            onClick={() => popModal()}
          >
            Отмена
          </Button>
          <Button type="submit" icon={SendIcon} loading={mutation.isPending}>
            Продолжить
          </Button>
        </DialogFooter>
      </form>
    </ModalContent>
  );
}
