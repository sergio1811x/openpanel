import { InputWithLabel } from '@/components/forms/input-with-label';
import FullPageLoadingState from '@/components/full-page-loading-state';
import DeleteAccount from '@/components/settings/delete-account';
import { Button } from '@/components/ui/button';
import { Widget, WidgetBody, WidgetHead } from '@/components/widget';
import { handleError, useTRPC } from '@/integrations/trpc/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { SaveIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const validator = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

type IForm = z.infer<typeof validator>;

export const Route = createFileRoute('/_app/$organizationId/account/_tabs/')({
  component: Component,
  pendingComponent: FullPageLoadingState,
});

function Component() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const session = useSuspenseQuery(trpc.auth.session.queryOptions());
  const user = session.data?.user;

  const { register, handleSubmit, formState, reset } = useForm<IForm>({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    },
  });

  const mutation = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: (data) => {
        toast('Профиль обновлён', {
          description: 'Ваш профиль был обновлён.',
        });
        queryClient.invalidateQueries(trpc.auth.session.pathFilter());
        reset({
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
        });
      },
      onError: handleError,
    }),
  );

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit((values) => {
          mutation.mutate(values);
        })}
      >
        <Widget className="max-w-screen-md w-full">
        <WidgetHead>
          <span className="title">Профиль</span>
        </WidgetHead>
        <WidgetBody className="gap-4 col">
          <InputWithLabel
            label="Email"
            value={user.email}
            disabled
            readOnly
          />
          <InputWithLabel
            label="Имя"
            {...register('firstName')}
            defaultValue={user.firstName ?? ''}
          />
          <InputWithLabel
            label="Фамилия"
            {...register('lastName')}
            defaultValue={user.lastName ?? ''}
          />
          <Button
            size="sm"
            type="submit"
            disabled={!formState.isDirty || mutation.isPending}
            className="self-end"
            icon={SaveIcon}
            loading={mutation.isPending}
          >
            Сохранить
          </Button>
        </WidgetBody>
      </Widget>
      </form>
      <DeleteAccount />
    </div>
  );
}
