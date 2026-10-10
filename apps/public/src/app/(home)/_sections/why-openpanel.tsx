'use client';

import { QuoteIcon, StarIcon } from 'lucide-react';
import Image from 'next/image';
import Markdown from 'react-markdown';
import { FeatureCardBackground } from '@/components/feature-card';
import { Section, SectionHeader, SectionLabel } from '@/components/section';
import { cn } from '@/lib/utils';

const images = [
  {
    name: 'Lucide Animated',
    url: 'https://lucide-animated.com',
    logo: '/logos/lucide-animated.png',
  },
  {
    name: 'KiddoKitchen',
    url: 'https://kiddokitchen.se',
    logo: '/logos/kiddokitchen.png',
  },
  {
    name: 'Maneken',
    url: 'https://maneken.app',
    logo: '/logos/maneken.png',
  },
  {
    name: 'Midday',
    url: 'https://midday.ai',
    logo: '/logos/midday.png',
  },
  {
    name: 'Screenzen',
    url: 'https://www.screenzen.co',
    logo: '/logos/screenzen.png',
  },
  {
    name: 'Tiptip',
    url: 'https://tiptip.id',
    logo: '/logos/tiptip.png',
  },
];

const quotes: {
  quote: string;
  author: string;
  site?: string;
}[] = [
  {
    quote:
      'Протестировав несколько инструментов продуктовой аналитики для Strackr, **мы выбрали OpenPanel и очень довольны продуктом**. Пользуемся с беты-версии, обновления выходят постоянно. Профили и события конверсий — наши любимые функции.',
    author: 'Julien Hany',
    site: 'https://strackr.com',
  },
  {
    quote: `До OpenPanel я пользовался Plausible — было неплохо. **Но OpenPanel на десять голов впереди!!** Лучший UX/UI, гораздо больше возможностей и невероятная поддержка от основателя. Бонус: установка в один клик на Coolify!! Я больше ни на что не перейду 😎`,
    author: 'Thomas Sanlis',
    site: 'https://uneed.best',
  },
  {
    quote: `Мы используем OpenPanel уже почти три месяца и очень довольны. После многих лет больших затрат на PostHog OpenPanel даёт нам ту же — а во многом и лучшую — аналитику, сохраняя полное владение нашими данными. Это настоящий self-hosted, но на удивление простой в обслуживании: настройка и текущая поддержка не вызывают сложностей, поэтому мы меньше времени тратим на управление инструментами и больше — на работу с инсайтами.\n\nOpenPanel даёт метрики, необходимые для понимания работы сайта и приложения и того, как пользователи взаимодействуют с ними. Дашборды понятные, данные надёжные, а набор функций покрывает всё, на что мы опирались раньше. Поддержка просто великолепная: отзывчивая, полезная и знающая, — переход оказался лёгким. Честно говоря, мы больше не хотим вести бизнес без OpenPanel.`,
    author: 'Self-hosting users',
  },
];

export function WhyOpenPanel() {
  return (
    <Section className="container gap-16">
      <SectionHeader label="Нам доверяют основатели" title="Кто пользуется OpenPanel?" />
      <div className="col overflow-hidden">
        <SectionLabel className="z-5 -mb-2 self-start bg-background pr-4 text-muted-foreground">
          ИСПОЛЬЗУЮТ
        </SectionLabel>
        <div className="-mx-4 grid grid-cols-3 border-y py-4 md:grid-cols-6">
          {images.map((image) => (
            <div className="border-r px-4 last:border-r-0" key={image.logo}>
              <a
                className={cn('group center-center relative aspect-square')}
                href={image.url}
                key={image.logo}
                rel="noopener noreferrer nofollow"
                target="_blank"
                title={image.name}
              >
                <FeatureCardBackground />
                <Image
                  alt={image.name}
                  className={cn('size-16 object-contain dark:invert')}
                  height={64}
                  src={image.logo}
                  width={64}
                />
              </a>
            </div>
          ))}
        </div>
        <div className="-mx-4 grid grid-cols-1 border-y py-4 md:grid-cols-2">
          {quotes.slice(0, 2).map((quote) => (
            <figure
              className="group px-4 py-4 md:odd:border-r"
              key={quote.author}
            >
              <div className="row items-center justify-between">
                <QuoteIcon className="mb-2 size-10 stroke-1 text-muted-foreground/50 transition-all group-hover:rotate-6 group-hover:text-foreground" />
                <div className="row gap-1">
                  <StarIcon className="size-4 fill-yellow-500 stroke-0 text-yellow-500" />
                  <StarIcon className="size-4 fill-yellow-500 stroke-0 text-yellow-500" />
                  <StarIcon className="size-4 fill-yellow-500 stroke-0 text-yellow-500" />
                  <StarIcon className="size-4 fill-yellow-500 stroke-0 text-yellow-500" />
                  <StarIcon className="size-4 fill-yellow-500 stroke-0 text-yellow-500" />
                </div>
              </div>
              <blockquote className="prose text-justify text-xl">
                <Markdown>{quote.quote}</Markdown>
              </blockquote>
              <figcaption className="row mt-4 justify-between text-muted-foreground text-sm">
                <span>{quote.author}</span>
                {quote.site && (
                  <cite className="not-italic">
                    <a
                      href={quote.site}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {quote.site.replace('https://', '')}
                    </a>
                  </cite>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Section>
  );
}
