import { getPageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = getPageMetadata({
  url: '/tools/ip-lookup',
  title: 'Какой у меня IP? Бесплатная проверка IP-адреса и геолокации',
  description:
    'Узнайте свой IP-адрес и местоположение мгновенно. Город, страна, провайдер, ASN и координаты. Бесплатно, без регистрации и отслеживания. Работает для любого IPv4 и IPv6.',
});

export default function IPLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
