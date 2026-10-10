import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { BookOpenIcon, CodeIcon } from 'lucide-react';
import { baseOptions } from '@/lib/layout.shared';
import { API_REFERENCE_BASE_URL, getApiReferenceSource } from '@/lib/openapi';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiSource = await getApiReferenceSource();

  const tabs = [
    {
      title: 'Документация',
      description: 'Руководства и справочники',
      url: '/docs',
      icon: <BookOpenIcon className="size-4 text-blue-500" />,
    },
    {
      title: 'API-справочник',
      description: 'Эндпоинты REST API',
      url: API_REFERENCE_BASE_URL,
      icon: <CodeIcon className="size-4 text-yellow-500" />,
      $folder: apiSource.pageTree as never,
    },
  ];

  return (
    <DocsLayout tabs={tabs} tree={apiSource.pageTree} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
