import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { LogoSquare } from '@/components/logo';

export const Route = createFileRoute('/_login')({
  beforeLoad: async ({ context }) => {
    if (context.session?.session) {
      throw redirect({ to: '/' });
    }
  },
  component: AuthLayout,
});

// FORK (Openpanel RU): минималистичный центр Экран входа —
// по центру только логин и пароль, учётные записи задаёт администратор в БД.
function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="col w-full max-w-sm gap-8">
        <div className="flex justify-center">
          <LogoSquare className="w-12" />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
