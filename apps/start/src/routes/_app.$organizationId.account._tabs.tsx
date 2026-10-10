import FullPageLoadingState from '@/components/full-page-loading-state';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePageTabs } from '@/hooks/use-page-tabs';
import { Outlet, createFileRoute, useRouter } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/$organizationId/account/_tabs')({
  component: Component,
  pendingComponent: FullPageLoadingState,
});

function Component() {
  const router = useRouter();
  const { organizationId } = Route.useParams();
  const { activeTab, tabs } = usePageTabs([
    { id: 'account', label: 'Профиль' },
    { id: 'email-preferences', label: 'Настройки email' },
    { id: 'two-factor', label: 'Двухфакторная аутентификация' },
  ]);

  const handleTabChange = (tabId: string) => {
    if (tabId === 'account') {
      router.navigate({
        to: '/$organizationId/account',
        params: { organizationId },
      });
      return;
    }
    router.navigate({
      from: Route.fullPath,
      to: tabId,
    });
  };

  return (
    <PageContainer>
      <PageHeader title="Ваш аккаунт" />
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="mt-2 mb-8"
      >
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Outlet />
    </PageContainer>
  );
}
