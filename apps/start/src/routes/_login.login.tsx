import { createFileRoute } from '@tanstack/react-router';
import { AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { SignInEmailForm } from '@/components/auth/sign-in-email-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createTitle, PAGE_TITLES } from '@/utils/title';

export const Route = createFileRoute('/_login/login')({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: createTitle(PAGE_TITLES.LOGIN) },
      { name: 'robots', content: 'noindex, follow' },
    ],
  }),
  validateSearch: z.object({
    error: z.string().optional(),
    correlationId: z.string().optional(),
    inviteId: z.string().optional(),
  }),
});

// FORK (Openpanel RU): регистрация выпилена, OAuth-кнопки убраны —
// остался только вход по email и паролю. Учётные записи создаёт
// администратор на сервере (apps/api/scripts/create-user.mjs).
function LoginPage() {
  const { error } = Route.useSearch();

  return (
    <div className="col w-full gap-8 text-center">
      <div>
        <h1 className="mb-2 font-bold text-3xl text-foreground">Вход</h1>
        <p className="text-muted-foreground">
          Введите логин и пароль, заданные администратором
        </p>
      </div>
      {error && (
        <Alert
          className="mb-6 border-destructive/20 bg-destructive/10 text-left"
          variant="destructive"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
          </AlertDescription>
        </Alert>
      )}

      <SignInEmailForm />
    </div>
  );
}
