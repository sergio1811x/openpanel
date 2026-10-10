import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { QuoteIcon } from 'lucide-react';

const testimonials = [
  {
    key: 'thomas',
    bgImage: '/img-1.webp',
    quote:
      'OpenPanel — безусловно, лучшая open-source аналитика из всех, что я видел. Лучший UX/UI, гораздо больше функций и невероятная поддержка от основателя.',
    author: 'Thomas Sanlis',
    site: 'uneed.best',
  },
  {
    key: 'julien',
    bgImage: '/img-2.webp',
    quote:
      'Протестировав несколько инструментов продуктовой аналитики, мы выбрали OpenPanel и очень довольны. Профили и события-конверсии — наши любимые функции.',
    author: 'Julien Hany',
    site: 'strackr.com',
  },
  {
    key: 'piotr',
    bgImage: '/img-3.webp',
    quote:
      'Вкладка «Обзор» великолепна — в ней есть всё, что мне нужно. Интерфейс красивый, чистый, современный, очень приятный для глаз.',
    author: 'Piotr Kulpinski',
    site: 'producthunt.com',
  },
  {
    key: 'selfhost',
    bgImage: '/img-4.webp',
    quote:
      'После многолетних крупных трат на PostHog OpenPanel даёт нам ту же — а во многом и лучшую — аналитику, сохраняя за нами полное владение данными. Мы больше не хотим вести бизнес без OpenPanel.',
    author: 'Пользователь self-hosted',
    site: undefined,
  },
];

function TestimonialSlide({
  bgImage,
  quote,
  author,
  site,
}: {
  bgImage: string;
  quote: string;
  author: string;
  site?: string;
}) {
  return (
    <div className="relative flex flex-col justify-end h-full p-10 select-none">
      <img
        src={bgImage}
        className="absolute inset-0 w-full h-full object-cover"
        alt=""
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      <div className="relative z-10 flex flex-col gap-4">
        <QuoteIcon className="size-10 text-white/40 stroke-1" />
        <blockquote className="text-3xl font-medium text-white leading-relaxed">
          {quote}
        </blockquote>
        <figcaption className="text-white/60 text-sm">
          — {author}
          {site && <span className="ml-1 text-white/40">· {site}</span>}
        </figcaption>
      </div>
    </div>
  );
}

export function OnboardingLeftPanel() {
  return (
    <div className="sticky top-0 h-screen overflow-hidden">
      <div className="flex items-center justify-center h-full mt-24">
        <Carousel
          className="w-full h-full [&>div]:h-full [&>div]:min-h-full"
          opts={{ loop: true, align: 'center' }}
          plugins={[Autoplay({ delay: 6000, stopOnInteraction: false })]}
        >
          <CarouselContent className="h-full">
            {testimonials.map((t) => (
              <CarouselItem key={t.key} className="p-8 pb-32 pt-0">
                <div className="rounded-xl min-h-full h-full overflow-hidden bg-card border border-border shadow-lg">
                  <TestimonialSlide
                    bgImage={t.bgImage}
                    quote={t.quote}
                    author={t.author}
                    site={t.site}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
