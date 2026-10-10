import AnimateHeight from '@/components/animate-height';
import { InputWithLabel, WithLabel } from '@/components/forms/input-with-label';
import TagInput from '@/components/forms/tag-input';
import { Button } from '@/components/ui/button';
import { CheckboxInput } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Widget, WidgetBody, WidgetHead } from '@/components/widget';
import { handleError, useTRPC } from '@/integrations/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { IServiceProjectWithClients } from '@openpanel/db';
import { zProject } from '@openpanel/validation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SaveIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type Props = { project: IServiceProjectWithClients };

const validator = zProject.pick({
  name: true,
  id: true,
  domain: true,
  cors: true,
  crossDomain: true,
  allowUnsafeRevenueTracking: true,
});
type IForm = z.infer<typeof validator>;

export default function EditProjectDetails({ project }: Props) {
  const [hasDomain, setHasDomain] = useState(project.domain !== null);
  const form = useForm<IForm>({
    resolver: zodResolver(validator),
    defaultValues: {
      id: project.id,
      name: project.name,
      domain: project.domain,
      cors: project.cors,
      crossDomain: project.crossDomain,
      allowUnsafeRevenueTracking: project.allowUnsafeRevenueTracking,
    },
  });
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    trpc.project.update.mutationOptions({
      onError: handleError,
      onSuccess: () => {
        toast.success('Проект обновлён');
        queryClient.invalidateQueries(
          trpc.project.list.queryFilter({
            organizationId: project.organizationId,
          }),
        );
        queryClient.invalidateQueries(
          trpc.project.getProjectWithClients.queryFilter({
            projectId: project.id,
          }),
        );
      },
    }),
  );

  const onSubmit = (values: IForm) => {
    if (hasDomain) {
      let error = false;
      if (values.cors.length === 0) {
        form.setError('cors', {
          type: 'required',
          message: 'Добавьте хотя бы один CORS-домен',
        });
        error = true;
      }

      if (!values.domain) {
        form.setError('domain', {
          type: 'required',
          message: 'Добавьте домен',
        });
        error = true;
      }

      if (error) {
        return;
      }
    }

    mutation.mutate(hasDomain ? values : { ...values, cors: [], domain: null });
  };

  return (
    <Widget className="max-w-screen-md w-full">
      <WidgetHead>
        <span className="title">Детали</span>
      </WidgetHead>
      <WidgetBody>
        <form onSubmit={form.handleSubmit(onSubmit)} className="col gap-4">
          <InputWithLabel
            label="Название"
            {...form.register('name')}
            defaultValue={project.name}
          />

          <div className="-mb-2 flex gap-2 items-center justify-between">
            <Label className="mb-0">Домен</Label>
            <Switch checked={hasDomain} onCheckedChange={setHasDomain} />
          </div>
          <AnimateHeight open={hasDomain}>
            <Input
              placeholder="https://example.com"
              {...form.register('domain')}
              className="mb-4"
              error={form.formState.errors.domain?.message}
              defaultValue={project.domain ?? ''}
            />

            <Controller
              name="cors"
              control={form.control}
              render={({ field }) => (
                <WithLabel
                  label="Разрешённые домены"
                  error={form.formState.errors.cors?.message}
                >
                  <TagInput
                    {...field}
                    error={form.formState.errors.cors?.message}
                    placeholder="Добавьте домен"
                    value={field.value ?? []}
                    renderTag={(tag) =>
                      tag === '*' ? 'Разрешить все домены' : tag
                    }
                    onChange={(newValue) => {
                      field.onChange(
                        newValue.map((item) => {
                          const trimmed = item.trim();
                          if (
                            trimmed.startsWith('http://') ||
                            trimmed.startsWith('https://') ||
                            trimmed === '*'
                          ) {
                            return trimmed;
                          }
                          return `https://${trimmed}`;
                        }),
                      );
                    }}
                  />
                </WithLabel>
              )}
            />
            <Controller
              name="crossDomain"
              control={form.control}
              render={({ field }) => {
                return (
                  <WithLabel label="Поддержка кросс-доменности" className="mt-4">
                    <CheckboxInput
                      ref={field.ref}
                      onBlur={field.onBlur}
                      defaultChecked={field.value}
                      onCheckedChange={field.onChange}
                    >
                      <div>Включить поддержку кросс-доменности</div>
                      <div className="font-normal text-muted-foreground">
                        Это позволит отслеживать пользователей на нескольких
                        доменах
                      </div>
                    </CheckboxInput>
                  </WithLabel>
                );
              }}
            />
          </AnimateHeight>

          <Controller
            name="allowUnsafeRevenueTracking"
            control={form.control}
            render={({ field }) => {
              return (
                <WithLabel label="Отслеживание выручки">
                  <CheckboxInput
                    ref={field.ref}
                    onBlur={field.onBlur}
                    defaultChecked={field.value}
                    onCheckedChange={field.onChange}
                  >
                    <div>Разрешить «небезопасное» отслеживание выручки</div>
                    <div className="font-normal text-muted-foreground">
                      Если включено, Вы сможете отслеживать выручку из клиентского
                      кода.
                    </div>
                  </CheckboxInput>
                </WithLabel>
              );
            }}
          />

          <Button
            loading={mutation.isPending}
            type="submit"
            icon={SaveIcon}
            className="self-start"
          >
            Сохранить
          </Button>
        </form>
      </WidgetBody>
    </Widget>
  );
}
