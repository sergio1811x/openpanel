import { FeatureCardContainer } from '@/components/feature-card';
import { Section, SectionHeader } from '@/components/section';
import { frameworks } from '@openpanel/sdk-info';
import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';

export function Sdks() {
  return (
    <Section className="container">
      <SectionHeader
        title="Начните за считанные минуты"
        description="Подключите Openpanel RU к любимому фреймворку с помощью наших легковесных SDK. Несколько строк кода — и отслеживание работает."
        className="mb-16"
      />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {frameworks.map((sdk) => (
          <Link href={sdk.href} key={sdk.key}>
            <FeatureCardContainer key={sdk.key}>
              <sdk.IconComponent className="size-6" />
              <div className="row justify-between items-center">
                <span className="text-sm font-semibold">{sdk.name}</span>
                <ArrowRightIcon className="size-4" />
              </div>
            </FeatureCardContainer>
          </Link>
        ))}
      </div>
    </Section>
  );
}
