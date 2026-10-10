import { CtaBanner } from '@/app/(home)/_sections/cta-banner';
import { Faq } from '@/app/(home)/_sections/faq';
import { HeroContainer } from '@/app/(home)/_sections/hero';
import { Pricing } from '@/app/(home)/_sections/pricing';
import { Testimonials } from '@/app/(home)/_sections/testimonials';
import { Section, SectionHeader } from '@/components/section';
import { Button } from '@/components/ui/button';
import { url } from '@/lib/layout.shared';
import { getOgImageUrl, getPageMetadata } from '@/lib/metadata';
import { compareSource } from '@/lib/source';
import { formatEventsCount } from '@/lib/utils';
import { PRICING } from '@openpanel/payments/prices';
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { CompareCard } from '../compare/_components/compare-card';

const title = 'Тарифы OpenPanel Cloud';
const description =
  'Наши тарифы максимально просты: выберите, сколько событий вы хотите отслеживать каждый месяц, — всё остальное без ограничений. Никаких уровней и скрытых расходов.';

export const metadata: Metadata = getPageMetadata({
  title,
  description,
  url: url('/pricing'),
  image: getOgImageUrl('/pricing'),
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description: description,
  url: url('/pricing'),
  publisher: {
    '@type': 'Organization',
    name: 'OpenPanel',
    logo: {
      '@type': 'ImageObject',
      url: url('/logo.png'),
    },
  },
};

export default function SupporterPage() {
  return (
    <div>
      <Script
        id="pricing-schema"
        strategy="beforeInteractive"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroContainer className="-mb-32">
        <SectionHeader
          as="h1"
          align="center"
          className="flex-1"
          title={title}
          description={description}
        />
      </HeroContainer>
      <Pricing />
      <PricingTable />
      <ComparisonSection />
      <Testimonials />
      <Faq />
      <CtaBanner />
    </div>
  );
}

function PricingTable() {
  return (
    <Section className="container">
      <SectionHeader
        title="Полная таблица тарифов"
        description="Вот полная таблица тарифов для всех планов. Используйте промокод, чтобы получить скидку на подписку."
      />
      <div className="prose mt-8">
        <table className="bg-card">
          <thead>
            <tr>
              <th>Тариф</th>
              <th className="text-right">Цена в месяц</th>
              <th className="text-right">Цена за год (2 месяца в подарок)</th>
            </tr>
          </thead>
          <tbody>
            {PRICING.map((price) => (
              <tr key={price.price}>
                <td className="font-semibold">
                  {formatEventsCount(price.events)} событий в месяц
                </td>
                <td className="text-right">
                  {Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(price.price)}
                </td>
                <td className="text-right">
                  {Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(price.price * 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function ComparisonSection() {
  const comparisons = compareSource
    .filter((item) =>
      ['plausible', 'mixpanel', 'google', 'posthog', 'matomo', 'umami'].some(
        (name) => item.competitor.name.toLowerCase().includes(name),
      ),
    )
    .sort((a, b) => a.competitor.name.localeCompare(b.competitor.name));

  return (
    <Section className="container">
      <SectionHeader
        title="Чем мы отличаемся?"
        description={
          <>
            Посмотрите, как OpenPanel сравнивается с другими инструментами аналитики, в{' '}
            <Link
              href="/articles/self-hosted-web-analytics"
              className="underline hover:text-primary transition-colors"
            >
              подробном сравнении open source инструментов веб-аналитики
            </Link>
            .
          </>
        }
      />

      <Button asChild className="mt-8 self-start">
        <Link href="/compare">Все сравнения</Link>
      </Button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
        {comparisons.map((comparison) => (
          <CompareCard
            key={comparison.slug}
            url={comparison.url}
            name={`OpenPanel против ${comparison.competitor.name}`}
            description={comparison.competitor.short_description}
          />
        ))}
      </div>
    </Section>
  );
}
