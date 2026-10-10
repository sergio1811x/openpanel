import { zodResolver } from '@hookform/resolvers/zod';
import { zOnboardingProject } from '@openpanel/validation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  MonitorIcon,
  SaveIcon,
  ServerIcon,
  SmartphoneIcon,
} from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { popModal } from '.';
import { ModalContent, ModalHeader } from './Modal/Container';
import AnimateHeight from '@/components/animate-height';
import { ButtonContainer } from '@/components/button-container';
import { CreateClientSuccess } from '@/components/clients/create-client-success';
import { CheckboxItem } from '@/components/forms/checkbox-item';
import { InputWithLabel, WithLabel } from '@/components/forms/input-with-label';
import TagInput from '@/components/forms/tag-input';
import { Button } from '@/components/ui/button';
import { useAppParams } from '@/hooks/use-app-params';
import { ONBOARDING_SECRET_KEY } from '@/hooks/use-client-secret';
import { handleError, useTRPC } from '@/integrations/trpc/react';

const validator = zOnboardingProject;
type IForm = z.infer<typeof validator>;

export default function AddProject() {
  const { organizationId } = useAppParams();
  const navigate = useNavigate();
  const form = useForm<IForm>({
    resolver: zodResolver(validator),
    defaultValues: {
      organizationId,
      timezone: '', // Not used
      project: '',
      domain: '',
      cors: [],
      website: false,
      app: false,
      backend: false,
    },
  });
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    trpc.project.create.mutationOptions({
      onError: handleError,
      onSuccess: (res) => {
        queryClient.invalidateQueries(
          trpc.project.list.queryFilter({ organizationId })
        );
        toast.success('Проект создан', {
          description: `${res.name}`,
          action: {
            label: 'Открыть проект',
            onClick: () =>
              navigate({
                to: '/$organizationId/$projectId',
                params: {
                  organizationId,
                  projectId: res.id,
                },
              }),
          },
        });
      },
    })
  );

  const onSubmit = (values: IForm) => {
    mutation.mutate(values);
  };

  const isWebsite = useWatch({
    name: 'website',
    control: form.control,
  });

  const isApp = useWatch({
    name: 'app',
    control: form.control,
  });

  const isBackend = useWatch({
    name: 'backend',
    control: form.control,
  });

  useEffect(() => {
    if (!isWebsite) {
      form.setValue('domain', null);
      form.setValue('cors', []);
    }
  }, [isWebsite, form]);

  useEffect(() => {
    form.clearErrors();
  }, [isWebsite, isApp, isBackend]);

  return (
    <ModalContent>
      {mutation.isSuccess ? (
        <>
          <ModalHeader text={'Ваш проект создан'} title="Успешно" />
          {mutation.data.client && (
            <CreateClientSuccess {...mutation.data.client} />
          )}
          <ButtonContainer className="justify-end">
            <Button onClick={() => popModal()} variant="outline">
              Закрыть
            </Button>
            {/* Route through the same connect -> verify steps as onboarding so
                a second project doesn't skip the install instructions. The
                connect page reads the secret from sessionStorage — seed it
                here, since this is the only moment the plain secret exists. */}
            <Button asChild className="flex-1">
              <a
                href={`/onboarding/${mutation.data.id}/connect`}
                onClick={() => {
                  const secret = mutation.data.client?.secret;
                  if (secret) {
                    try {
                      sessionStorage.setItem(ONBOARDING_SECRET_KEY, secret);
                    } catch {
                      // Storage unavailable — connect falls back to its
                      // secret-already-shown notice.
                    }
                  }
                }}
              >
                Настроить отслеживание
              </a>
            </Button>
          </ButtonContainer>
        </>
      ) : (
        <>
          <ModalHeader title="Создание проекта" />
          <form className="col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <InputWithLabel
              label="Название проекта"
              placeholder="Например: Мой музыкальный сайт"
              {...form.register('project')}
              error={form.formState.errors.project?.message}
            />

            <div className="flex flex-col divide-y">
              <Controller
                control={form.control}
                name="website"
                render={({ field }) => (
                  <CheckboxItem
                    description="Отслеживание событий и конверсий на вашем сайте"
                    disabled={isApp}
                    error={form.formState.errors.website?.message}
                    Icon={MonitorIcon}
                    label="Веб-сайт"
                    {...field}
                  >
                    <AnimateHeight open={isWebsite && !isApp}>
                      <div className="p-4 pl-14">
                        <InputWithLabel
                          label="Домен"
                          placeholder="Адрес вашего сайта"
                          {...form.register('domain')}
                          className="mb-4"
                          error={form.formState.errors.domain?.message}
                          onBlur={(e) => {
                            const value = e.target.value.trim();
                            if (
                              value.includes('.') &&
                              form.getValues().cors.length === 0 &&
                              !form.formState.errors.domain
                            ) {
                              form.setValue('cors', [value]);
                            }
                          }}
                        />

                        <Controller
                          control={form.control}
                          name="cors"
                          render={({ field }) => (
                            <WithLabel label="Разрешённые домены">
                              <TagInput
                                {...field}
                                error={form.formState.errors.cors?.message}
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
                                    })
                                  );
                                }}
                                placeholder="Принимать события с этих доменов"
                                renderTag={(tag) =>
                                  tag === '*'
                                    ? 'Принимать события с любых доменов'
                                    : tag
                                }
                                value={field.value ?? []}
                              />
                            </WithLabel>
                          )}
                        />
                      </div>
                    </AnimateHeight>
                  </CheckboxItem>
                )}
              />
              <Controller
                control={form.control}
                name="app"
                render={({ field }) => (
                  <CheckboxItem
                    description="Отслеживание событий и конверсий в вашем приложении"
                    disabled={isWebsite}
                    error={form.formState.errors.app?.message}
                    Icon={SmartphoneIcon}
                    label="Приложение"
                    {...field}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="backend"
                render={({ field }) => (
                  <CheckboxItem
                    description="Отслеживание событий и конверсий для вашего бэкенда / API"
                    error={form.formState.errors.backend?.message}
                    Icon={ServerIcon}
                    label="Backend / API"
                    {...field}
                  />
                )}
              />
            </div>

            <ButtonContainer className="justify-end">
              <Button
                icon={SaveIcon}
                loading={mutation.isPending}
                type="submit"
              >
                Создать проект
              </Button>
            </ButtonContainer>
          </form>
        </>
      )}
    </ModalContent>
  );
}
