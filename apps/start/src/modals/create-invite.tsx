import { InputWithLabel } from '@/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  closeSheet,
} from '@/components/ui/sheet';
import { useAppParams } from '@/hooks/use-app-params';
import { zodResolver } from '@hookform/resolvers/zod';
import { SendIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { ProjectAccessGrants } from '@/components/settings/project-access-grants';
import { useTRPC } from '@/integrations/trpc/react';
import type { IServiceProject } from '@openpanel/db';
import { zInviteUser } from '@openpanel/validation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type IForm = z.infer<typeof zInviteUser>;

export default function CreateInvite() {
  const { organizationId } = useAppParams();
  const trpc = useTRPC();
  const projectsQuery = useQuery(
    trpc.project.list.queryOptions({
      organizationId,
    }),
  );
  const projects = projectsQuery.data ?? [];

  const queryClient = useQueryClient();

  const { register, handleSubmit, formState, reset, control } = useForm<IForm>({
    resolver: zodResolver(zInviteUser),
    defaultValues: {
      organizationId,
      access: [],
      role: 'org:member',
    },
  });

  const mutation = useMutation(
    trpc.organization.inviteUser.mutationOptions({
      onSuccess() {
        toast.success('Пользователь приглашён');
        reset();
        queryClient.invalidateQueries(
          trpc.organization.invitations.queryFilter({ organizationId }),
        );
      },
      onError(error) {
        toast.error('Не удалось пригласить пользователя', {
          description: error.message,
        });
      },
    }),
  );

  return (
    <>
      {mutation.isSuccess ? (
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Пользователь приглашён</SheetTitle>
          </SheetHeader>
          <div className="prose dark:prose-invert">
            {mutation.data.type === 'is_member' ? (
              <>
                <p>
                  Поскольку у пользователя уже есть аккаунт, мы добавили его в
                  Вашу организацию. Поэтому этот пользователь не появится в
                  списке приглашений.
                </p>
                <p>Мы также уведомили пользователя об этом по email.</p>
              </>
            ) : (
              <p>
                Мы отправили письмо с инструкциями по присоединению к
                организации.
              </p>
            )}
            <div className="row gap-4 mt-8">
              <Button onClick={() => mutation.reset()}>
                Пригласить другого пользователя
              </Button>
              <Button variant="outline" onClick={() => closeSheet()}>
                Закрыть
              </Button>
            </div>
          </div>
        </SheetContent>
      ) : (
        <SheetContent>
          <SheetHeader>
            <div>
              <SheetTitle>Приглашение пользователя</SheetTitle>
              <SheetDescription>
                Пригласите пользователей в Вашу организацию. Они получат письмо
                с инструкциями.
              </SheetDescription>
            </div>
          </SheetHeader>
          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            className="flex flex-col gap-8"
          >
            <InputWithLabel
              className="w-full max-w-sm"
              label="Email"
              error={formState.errors.email?.message}
              placeholder="Кого Вы хотите пригласить?"
              {...register('email')}
            />
            <div>
              <Label>Какая роль?</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    defaultValue={field.value}
                    onChange={field.onChange}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="org:member" id="member" />
                      <Label className="mb-0" htmlFor="member">
                        Участник
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="org:admin" id="admin" />
                      <Label className="mb-0" htmlFor="admin">
                        Администратор
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
            <Controller
              name="access"
              control={control}
              render={({ field }) => (
                <div>
                  <Label>Ограничить доступ</Label>
                  <ProjectAccessGrants
                    value={field.value}
                    onChange={field.onChange}
                    projects={projects}
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Оставьте пустым, чтобы предоставить доступ ко всем проектам
                  </p>
                </div>
              )}
            />
            <SheetFooter>
              <Button
                icon={SendIcon}
                type="submit"
                loading={mutation.isPending}
              >
                Пригласить пользователя
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      )}
    </>
  );
}
