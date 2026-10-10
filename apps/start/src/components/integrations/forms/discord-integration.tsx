import { InputWithLabel } from '@/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import { useAppParams } from '@/hooks/use-app-params';
import { useTRPC } from '@/integrations/trpc/react';
import type { RouterOutputs } from '@/trpc/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { zCreateDiscordIntegration } from '@openpanel/validation';
import { useMutation } from '@tanstack/react-query';
import { path, mergeDeepRight } from 'ramda';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type IForm = z.infer<typeof zCreateDiscordIntegration>;

export function DiscordIntegrationForm({
  defaultValues,
  onSuccess,
}: {
  defaultValues?: RouterOutputs['integration']['get'];
  onSuccess: () => void;
}) {
  const { projectId } = useAppParams();
  const form = useForm<IForm>({
    defaultValues: mergeDeepRight(
      {
        id: defaultValues?.id,
        projectId,
        config: {
          type: 'discord' as const,
          url: '',
          headers: {},
        },
      },
      defaultValues ?? {},
    ),
    resolver: zodResolver(zCreateDiscordIntegration),
  });
  const trpc = useTRPC();
  const mutation = useMutation(
    trpc.integration.createOrUpdate.mutationOptions({
      onSuccess,
      onError() {
        toast.error('Не удалось создать интеграцию');
      },
    }),
  );

  const handleSubmit = (values: IForm) => {
    mutation.mutate(values);
  };

  const handleError = () => {
    toast.error('Ошибка валидации');
  };

  const testMutation = useMutation(
    trpc.integration.testConnection.mutationOptions(),
  );

  const handleTest = async () => {
    const url = form.getValues('config.url');
    if (!url) {
      return toast.error('Не указан URL вебхука');
    }
    const res = await testMutation.mutateAsync({
      projectId,
      config: { type: 'discord', url },
    });
    if (res.success) {
      toast.success('Тестовое уведомление отправлено');
    } else {
      toast.error('Не удалось отправить тестовое уведомление');
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit, handleError)}
      className="col gap-4"
    >
      <InputWithLabel
        label="Название"
        placeholder="Например, Мой личный Discord"
        {...form.register('name')}
        error={form.formState.errors.name?.message}
      />
      <InputWithLabel
        label="Discord Webhook URL"
        {...form.register('config.url')}
        error={path(['config', 'url', 'message'], form.formState.errors)}
      />
      <div className="row gap-4">
        <Button type="button" variant="outline" onClick={handleTest}>
          Проверить подключение
        </Button>
        <Button type="submit" className="flex-1">
          Создать
        </Button>
      </div>
    </form>
  );
}
