import { getPageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = getPageMetadata({
  url: '/tools/url-checker',
  title: 'Проверка URL — бесплатный инспектор SEO, Open Graph и мета-тегов',
  description:
    'Проверьте SEO любого URL, Open Graph, Twitter Cards, редиректы, SSL и технический стек. Бесплатно, мгновенно, без регистрации. Для разработчиков и SEO-специалистов.',
});

export default function IPLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
