import { CtaBanner } from '@/app/(home)/_sections/cta-banner';
import { HeroContainer } from '@/app/(home)/_sections/hero';
import { FaqItem, Faqs } from '@/components/faq';
import { FeatureCard } from '@/components/feature-card';
import { Section, SectionHeader } from '@/components/section';
import { Button } from '@/components/ui/button';
import { url } from '@/lib/layout.shared';
import { getOgImageUrl, getPageMetadata } from '@/lib/metadata';
import {
  BarChartIcon,
  CheckIcon,
  CodeIcon,
  GlobeIcon,
  HeartHandshakeIcon,
  LinkIcon,
  MailIcon,
  MessageSquareIcon,
  SparklesIcon,
  UsersIcon,
  ZapIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = getPageMetadata({
  title: 'Бесплатная аналитика для open source проектов | OpenPanel OSS Program',
  description:
    'Получите бесплатную веб- и продуктовую аналитику для вашего open source проекта. До 2,5 млн событий в месяц. Подайте заявку в open source программу OpenPanel.',
  url: url('/open-source'),
  image: getOgImageUrl('/open-source'),
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Free Analytics for Open Source Projects | OpenPanel OSS Program',
  description:
    "Get free web and product analytics for your open source project. Track up to 2.5M events/month. Apply to OpenPanel's open source program today.",
  url: url('/open-source'),
  publisher: {
    '@type': 'Organization',
    name: 'OpenPanel',
    logo: {
      '@type': 'ImageObject',
      url: url('/logo.png'),
    },
  },
  mainEntity: {
    '@type': 'Offer',
    name: 'Free Analytics for Open Source Projects',
    description:
      'Free analytics service for open source projects up to 2.5M events per month',
    price: '0',
    priceCurrency: 'USD',
  },
};

export default function OpenSourcePage() {
  return (
    <div>
      <Script
        id="open-source-schema"
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
                Бесплатная аналитика для
                <br />
                open source проектов
              </>
            }
            description="Отслеживайте пользователей, понимайте распространение и развивайте свой проект — совершенно бесплатно. Бесплатная аналитика для open source проектов с объёмом до 2,5 млн событий в месяц."
          />
          <div className="col gap-4 justify-center items-center mt-8">
            <Button size="lg" asChild>
              <Link href="mailto:oss@openpanel.dev">
                Подать заявку на бесплатный доступ
                <MailIcon className="size-4" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              До 2,5 млн событий в месяц • Без кредитной карты
            </p>
          </div>
        </div>
      </HeroContainer>

      <div className="container">
        <div className="col gap-16">
          {/* What You Get Section */}
          <Section className="my-0">
            <SectionHeader
              title="Что вы получаете"
              description="Всё, что нужно, чтобы понять пользователей и развивать свой open source проект."
            />
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <FeatureCard
                title="2,5 млн событий в месяц"
                description="Более чем достаточно для большинства open source проектов. Отслеживайте просмотры страниц, действия пользователей и кастомные события без ограничений."
                icon={BarChartIcon}
              />
              <FeatureCard
                title="Полный доступ к функциям"
                description="Те же мощные возможности, что и на платных планах. Воронки, анализ удержания, кастомные дашборды и аналитика в реальном времени."
                icon={ZapIcon}
              />
              <FeatureCard
                title="Неограниченное число участников команды"
                description="Приглашайте всю команду контрибьюторов. Сотрудничайте с мейнтейнерами и ключевыми разработчиками, разбираясь в росте вашего проекта."
                icon={UsersIcon}
              />
              <FeatureCard
                title="Приоритетная поддержка"
                description="Отдельная помощь для мейнтейнеров open source. Быстрые ответы и приоритетное сопровождение, когда это необходимо."
                icon={MessageSquareIcon}
              />
            </div>
          </Section>

          {/* Why We Do This Section */}
          <Section className="my-0">
            <SectionHeader
              title="Почему мы это делаем"
              description="OpenPanel создана open source сообществом и для него. Мы верим в то, что нужно отдавать."
            />
            <div className="col gap-6 mt-8">
              <p className="text-muted-foreground">
                Мы начали OpenPanel, потому что верили: инструменты аналитики не
                должны быть сложными или спрятанными за дорогими enterprise-подписками.
                Будучи open source проектом сами, мы понимаем сложности создания и
                развития проекта без ресурсов больших корпораций.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <FeatureCard
                  title="Создано для OSS"
                  description="OpenPanel — open source. Мы знаем, что значит разрабатывать открыто."
                  icon={CodeIcon}
                />
                <FeatureCard
                  title="Без барьеров"
                  description="Аналитика не должна быть барьером на пути к пониманию пользователей. Мы убираем этот барьер."
                  icon={HeartHandshakeIcon}
                />
                <FeatureCard
                  title="Отдаём сообществу"
                  description="Мы возвращаем долг проектам, которые нас вдохновляют, и сообществу, которое нас поддерживает."
                  icon={SparklesIcon}
                />
              </div>
            </div>
          </Section>

          {/* What We Ask In Return Section */}
          <Section className="my-0">
            <SectionHeader
              title="Что мы просим взамен"
              description="Всё просто. Небольшой способ помочь нам расти и поддерживать больше проектов."
            />
            <div className="row gap-6 mt-8">
              <div className="col gap-6">
                <FeatureCard
                  title="Обратная ссылка на OpenPanel"
                  description="Простая ссылка на вашем сайте или в README поможет другим узнать об OpenPanel. Это выгодно всему сообществу."
                  icon={LinkIcon}
                >
                  <p className="text-sm text-muted-foreground mt-2">
                    Пример: «Аналитика на движке{' '}
                    <Link
                      href="https://openpanel.dev"
                      className="text-primary hover:underline"
                    >
                      OpenPanel
                    </Link>
                    »
                  </p>
                </FeatureCard>
                <FeatureCard
                  title="Виджет на сайте"
                  description="Покажите число посетителей с помощью нашего виджета аналитики в реальном времени. Полностью опционально, но помогает рассказать о нас."
                  icon={GlobeIcon}
                >
                  <a
                    href="https://openpanel.dev"
                    style={{
                      display: 'inline-block',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      width: '250px',
                      height: '48px',
                    }}
                  >
                    <iframe
                      src="https://dashboard.openpanel.dev/widget/badge?shareId=ancygl&color=%231F1F1F"
                      height="48"
                      width="100%"
                      style={{
                        border: 'none',
                        overflow: 'hidden',
                        pointerEvents: 'none',
                      }}
                      title="Значок аналитики OpenPanel"
                    />
                  </a>
                </FeatureCard>
                <p className="text-muted-foreground">
                  Это всё. Никаких сложных требований, скрытых платежей и подвоха.
                  Мы просто хотим помочь open source проектам стать успешными.
                </p>
              </div>
              <div>
                <div className="text-center text-xs text-muted-foreground">
                  <iframe
                    title="Виджет реального времени"
                    src="https://dashboard.openpanel.dev/widget/realtime?shareId=26wVGY"
                    width="300"
                    height="400"
                    className="rounded-xl border mb-2"
                  />
                  Аналитика от{' '}
                  <a className="underline" href="https://openpanel.dev">
                    OpenPanel.dev
                  </a>
                </div>
              </div>
            </div>
          </Section>

          {/* Eligibility Criteria Section */}
          <Section className="my-0">
            <SectionHeader
              title="Критерии отбора"
              description="Мы хотим поддерживать настоящие open source проекты, которые действительно меняют что-то к лучшему."
            />
            <div className="col gap-4 mt-8">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <CheckIcon className="size-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Лицензия, одобренная OSI</h3>
                    <p className="text-sm text-muted-foreground">
                      Ваш проект должен использовать открытую лицензию, одобренную OSI
                      (MIT, Apache, GPL и т.д.)
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckIcon className="size-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Публичный репозиторий</h3>
                    <p className="text-sm text-muted-foreground">
                      Код должен быть публично доступен на GitHub, GitLab или
                      подобных платформах
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckIcon className="size-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Активная разработка</h3>
                    <p className="text-sm text-muted-foreground">
                      Покажите, что проект активно развивается и сообщество растёт
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckIcon className="size-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Некоммерческое назначение
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Основное назначение должно быть некоммерческим, хотя
                      коммерческие OSS проекты могут рассматриваться
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* How to Apply Section */}
          <Section className="my-0">
            <SectionHeader
              title="Как подать заявку"
              description="Всё просто: отправьте нам письмо с краткой информацией о вашем проекте."
            />
            <div className="col gap-6 mt-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="col gap-3">
                  <div className="size-10 rounded-full bg-primary/10 center-center text-primary font-semibold">
                    1
                  </div>
                  <h3 className="font-semibold">Напишите нам</h3>
                  <p className="text-sm text-muted-foreground">
                    Напишите на{' '}
                    <Link
                      href="mailto:oss@openpanel.dev"
                      className="text-primary hover:underline"
                    >
                      oss@openpanel.dev
                    </Link>{' '}
                    с информацией о вашем проекте
                  </p>
                </div>
                <div className="col gap-3">
                  <div className="size-10 rounded-full bg-primary/10 center-center text-primary font-semibold">
                    2
                  </div>
                  <h3 className="font-semibold">Расскажите о проекте</h3>
                  <p className="text-sm text-muted-foreground">
                    Укажите URL проекта, тип лицензии и краткое описание того,
                    что вы создаете
                  </p>
                </div>
                <div className="col gap-3">
                  <div className="size-10 rounded-full bg-primary/10 center-center text-primary font-semibold">
                    3
                  </div>
                  <h3 className="font-semibold">Мы рассмотрим заявку</h3>
                  <p className="text-sm text-muted-foreground">
                    Мы оценим ваш проект и ответим в течение нескольких
                    рабочих дней
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button size="lg" asChild>
                  <Link href="mailto:oss@openpanel.dev?subject=Open Source Program Application">
                    Подать заявку
                    <MailIcon className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Section>

          {/* FAQ Section */}
          <Section className="my-0">
            <SectionHeader
              title="Часто задаваемые вопросы"
              description="Всё, что нужно знать о нашей open source программе."
            />
            <div className="mt-8">
              <Faqs>
                <FaqItem question="Что считается open source проектом?">
                  Мы рассматриваем любой проект с открытой лицензией, одобренной OSI
                  (MIT, Apache, GPL, BSD и т.д.), который публично доступен и активно
                  поддерживается. Основное назначение проекта должно быть некоммерческим,
                  хотя коммерческие open source проекты могут рассматриваться
                  индивидуально.
                </FaqItem>
                <FaqItem question="Что будет, если я превышу 2,5 млн событий в месяц?">
                  Мы понимаем, что успешные проекты растут. Если вы стабильно превышаете
                  2,5 млн событий, мы свяжемся с вами, чтобы обсудить варианты. Мы гибкие
                  и хотим поддержать ваш успех. В большинстве случаев мы найдём решение,
                  удобное для обеих сторон.
                </FaqItem>
                <FaqItem question="Могут ли подать заявку коммерческие open source проекты?">
                  Да, мы рассматриваем коммерческие open source проекты в индивидуальном
                  порядке. Если ваш проект open source, но имеет коммерческие продукты,
                  укажите это в заявке — мы оценим ситуацию.
                </FaqItem>
                <FaqItem question="На сколько даётся бесплатный доступ?">
                  Пока ваш проект остаётся соответствующим критериям и активным, бесплатный
                  доступ продолжается. Мы периодически проверяем проекты, но нацелены
                  поддерживать их долгосрочно.
                </FaqItem>
                <FaqItem question="Обязательно ли размещать виджет?">
                  Нет, виджет полностью опционален. Мы просим только обратную ссылку на
                  OpenPanel на вашем сайте или в README. Виджет — просто приятный способ
                  показать вашу аналитику, если хотите.
                </FaqItem>
                <FaqItem question="А если мой проект совсем маленький или только стартует?">
                  Мы рады проектам любого размера! Независимо от того, только ли вы
                  начинаете или уже располагаете большим сообществом, — если вы
                  соответствуете критериям, мы с радостью поможем. Малым проектам
                  понимание пользователей на раннем этапе приносит наибольшую пользу.
                </FaqItem>
              </Faqs>
            </div>
          </Section>

          <CtaBanner
            title="Готовы получить бесплатную аналитику для вашего open source проекта?"
            description="Присоединяйтесь к другим open source проектам, которые используют OpenPanel, чтобы понимать пользователей и развивать сообщества. Подайте заявку сегодня — настройка займёт считанные минуты."
            ctaText="Подать заявку на бесплатный доступ"
            ctaLink="mailto:oss@openpanel.dev?subject=Open Source Program Application"
          />
        </div>
      </div>
    </div>
  );
}
