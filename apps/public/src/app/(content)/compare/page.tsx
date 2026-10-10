import { CtaBanner } from '@/app/(home)/_sections/cta-banner';
import { Section, SectionHeader } from '@/components/section';
import { WindowImage } from '@/components/window-image';
import { url } from '@/lib/layout.shared';
import { getOgImageUrl, getPageMetadata } from '@/lib/metadata';
import { compareSource } from '@/lib/source';
import type { Metadata } from 'next';
import { CompareHero } from './[slug]/_components/compare-hero';
import { CompareCard } from './_components/compare-card';

const title = 'Сравнение Openpanel RU с альтернативами';
const description =
  'Подробные сравнения функций и тарифов Openpanel RU и популярных инструментов аналитики. Честный разбор: что у каждого инструмента получается хорошо и где Openpanel RU даёт больше пользы.';

export const metadata: Metadata = getPageMetadata({
  title,
  description,
  url: url('/compare'),
  image: getOgImageUrl('/compare'),
});

const heroData = {
  heading: 'Сравните Openpanel RU с любой альтернативой',
  subheading:
    'Подробные сравнения функций и тарифов Openpanel RU и популярных инструментов аналитики. Честный разбор: что у каждого инструмента получается хорошо и где Openpanel RU даёт больше пользы растущим командам.',
  badges: ['30 дней бесплатно', 'Неограниченные пользователи', 'Настройка за 30 секунд'],
};

export default async function CompareIndexPage() {
  const comparisons = compareSource.sort((a, b) =>
    a.competitor.name.localeCompare(b.competitor.name),
  );

  return (
    <div>
      <CompareHero hero={heroData} />

      <div className="container my-16">
        <WindowImage
          srcDark="/screenshots/overview-dark.png"
          srcLight="/screenshots/overview-light.png"
          alt="Обзор дашборда Openpanel RU"
          caption="Это наш дашборд веб-аналитики — всё работает сразу после установки, так что вы можете начать понимать свой трафик и вовлечённость прямо сейчас."
        />
      </div>

      <Section className="container">
        <SectionHeader
          title="Все сравнения продуктов"
          description="Просмотрите наш полный список подробных сравнений. Узнайте, как Openpanel RU выглядит на фоне каждого конкурента по функциям, тарифам и ценности."
          variant="sm"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {comparisons.map((comparison) => (
            <CompareCard
              key={comparison.slug}
              url={comparison.url}
              name={comparison.competitor.name}
              description={comparison.competitor.short_description}
            />
          ))}
        </div>
      </Section>

      <CtaBanner
        title="Готовы начать?"
        description="Присоединяйтесь к тысячам команд, которые используют Openpanel RU для своей аналитики."
        ctaText="Начать бесплатно"
        ctaLink="#"
      />
    </div>
  );
}
