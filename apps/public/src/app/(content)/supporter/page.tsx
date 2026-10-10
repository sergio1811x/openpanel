import { CtaBanner } from '@/app/(home)/_sections/cta-banner';
import { HeroContainer } from '@/app/(home)/_sections/hero';
import { FeatureCard } from '@/components/feature-card';
import { Section, SectionHeader } from '@/components/section';
import { Button } from '@/components/ui/button';
import { url } from '@/lib/layout.shared';
import { getOgImageUrl, getPageMetadata } from '@/lib/metadata';
import { SupporterPerks } from 'components/sections/supporter-perks';
import {
  ClockIcon,
  GithubIcon,
  InfinityIcon,
  MessageSquareIcon,
  RocketIcon,
  SparklesIcon,
  StarIcon,
  ZapIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = getPageMetadata({
  title: 'Стать спонсором',
  description:
    'Поддержите OpenPanel и получите эксклюзивные бонусы: свежие Docker-образы, приоритетную поддержку и ранний доступ к новым функциям.',
  url: url('/supporter'),
  image: getOgImageUrl('/supporter'),
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Become a Supporter',
  description:
    'Support OpenPanel and get exclusive perks like latest Docker images, prioritized support, and early access to new features.',
  url: url('/supporter'),
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
        id="supporter-schema"
        strategy="beforeInteractive"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroContainer>
        <div className="col center-center flex-1">
          <SectionHeader
            as="h1"
            align="center"
            className="flex-1"
            title={
              <>
                Помогите нам строить
                <br />
                будущее открытой аналитики
              </>
            }
            description="Ваша поддержка ускоряет разработку, оплачивает инфраструктуру и помогает быстрее создавать функции. А ещё вы получаете эксклюзивные бонусы и ранний доступ ко всему, что мы выпускаем."
          />
          <div className="col gap-4 justify-center items-center mt-8">
            <Button size="lg" asChild>
              <Link href="https://buy.polar.sh/polar_cl_Az1CruNFzQB2bYdMOZmGHqTevW317knWqV44W1FqZmV">
                Стать спонсором
                <SparklesIcon className="size-4" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              От $20 в месяц • Отмена в любой момент
            </p>
          </div>
        </div>
      </HeroContainer>

      <div className="container">
        {/* Main Content with Sidebar */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 mb-16">
          {/* Main Content */}
          <div className="col gap-16">
            {/* Why Support Section */}
            <Section className="my-0">
              <SectionHeader
                title="Почему ваша поддержка важна"
                description="Мы не большая корпорация — просто небольшая команда, увлечённая созданием полезного для разработчиков. OpenPanel появилась на свет, потому что мы верили: инструменты аналитики не должны быть сложными или спрятанными за дорогими enterprise-подписками."
              />
              <div className="col gap-6 mt-8">
                <p className="text-muted-foreground">
                  Став спонсором, вы напрямую финансируете:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <FeatureCard
                    title="Активную разработку"
                    description="Больше времени на исправление багов, добавление функций и улучшение документации"
                    icon={ZapIcon}
                  />
                  <FeatureCard
                    title="Инфраструктуру"
                    description="Работу серверов, CI/CD-пайплайны и инструменты разработки"
                    icon={ZapIcon}
                  />
                  <FeatureCard
                    title="Независимость"
                    description="Фокус на главном: создание инструмента, который разработчики действительно хотят"
                    icon={ZapIcon}
                  />
                </div>
                <p className="text-muted-foreground">
                  Никакого корпоративного языка и громких обещаний — просто честная
                  работа над тем, чтобы OpenPanel стала лучше для всех. Каждый вклад,
                  каким бы он ни был, помогает нам оставаться независимыми и
                  сосредоточенными на важном.
                </p>
              </div>
            </Section>

            {/* What You Get Section */}
            <Section className="my-0">
              <SectionHeader
                title="Что вы получаете как спонсор"
                description="Эксклюзивные бонусы и ранний доступ ко всему, что мы выпускаем."
              />
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <FeatureCard
                  title="Свежие Docker-образы"
                  description="Получайте сборки с последними изменениями на каждый коммит. Доступ к новым функциям за недели до публичного релиза."
                  icon={RocketIcon}
                >
                  <Link
                    href="/docs/self-hosting/supporter-access-latest-docker-images"
                    className="text-sm text-primary hover:underline mt-2"
                  >
                    Подробнее →
                  </Link>
                </FeatureCard>
                <FeatureCard
                  title="Приоритетная поддержка"
                  description="Получайте помощь быстрее благодаря приоритетной поддержке в нашем сообществе Discord. Ваши вопросы разбирают первыми."
                  icon={MessageSquareIcon}
                />
                <FeatureCard
                  title="Предложения по функциям"
                  description="Ваши идеи и запросы функций получают приоритет в нашем роадмапе. Формируйте будущее OpenPanel."
                  icon={SparklesIcon}
                />
                <FeatureCard
                  title="Эксклюзивная роль в Discord"
                  description="Особый значок и признание в сообществе. Гордо показывайте свою поддержку."
                  icon={StarIcon}
                />
              </div>
            </Section>

            {/* Impact Section */}
            <Section className="my-0">
              <SectionHeader
                title="Ваш вклад"
                description="Каждый доллар идёт напрямую в разработку, инфраструктуру и улучшение OpenPanel. Вот что делает возможной ваша поддержка:"
              />
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <FeatureCard
                  title="100% открытый код"
                  description="Полная прозрачность. Изучайте код, вносите вклад, делайте форк или развертывайте самостоятельно — без привязки к вендору."
                  icon={GithubIcon}
                />
                <FeatureCard
                  title="Разработка 24/7"
                  description="Постоянные улучшения и обновления. Ваша поддержка позволяет быстрее выпускать новые версии."
                  icon={ClockIcon}
                />
                <FeatureCard
                  title="Self-hosting"
                  description="Разверните OpenPanel где угодно — на своём сервере, в своём облаке или локально. Полная гибкость."
                  icon={InfinityIcon}
                />
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <aside className="lg:block hidden">
            <SupporterPerks />
          </aside>
        </div>

        {/* Mobile Perks */}
        <div className="lg:hidden mb-16">
          <SupporterPerks />
        </div>

        <CtaBanner
          title="Готовы поддержать OpenPanel?"
          description="Присоединяйтесь к сообществу спонсоров и помогите нам создать лучшую open-source альтернативу Mixpanel. Каждый вклад ускоряет разработку и делает OpenPanel лучше для всех."
          ctaText="Стать спонсором"
          ctaLink="https://buy.polar.sh/polar_cl_Az1CruNFzQB2bYdMOZmGHqTevW317knWqV44W1FqZmV"
        />
      </div>

      <div className="lg:-mx-20 xl:-mx-40 not-prose mt-16">
        {/* <Testimonials />
        <Faq /> */}
      </div>
    </div>
  );
}
