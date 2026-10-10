'use client';

import { InfiniteMovingCards } from '@/components/infinite-moving-cards';
import { Section, SectionHeader } from '@/components/section';
import { TwitterCard } from '@/components/twitter-card';
import { useEffect, useMemo, useRef } from 'react';

const testimonials = [
  {
    verified: true,
    avatarUrl: '/twitter-steven.jpg',
    name: 'Steven Tey',
    handle: 'steventey',
    content: [
      'Вышла open-source альтернатива Mixpanel → http://git.new/openpanel',
      'Сочетает мощь Mixpanel и простоту @PlausibleHQ в полностью открытом продукте.',
      'Сделан @CarlLindesvard, уже отслеживает 750K+ событий 🤩',
    ],
    replies: 25,
    retweets: 68,
    likes: 648,
  },
  {
    verified: true,
    avatarUrl: '/twitter-pontus.jpg',
    name: 'Pontus Abrahamsson - oss/acc',
    handle: 'pontusab',
    content: ['Спасибо, OpenPanel — зверь, обожаю его!'],
    replies: 25,
    retweets: 68,
    likes: 648,
  },
  {
    verified: true,
    avatarUrl: '/twitter-piotr.jpg',
    name: 'Piotr Kulpinski',
    handle: 'piotrkulpinski',
    content: [
      'Вкладка Обзор в OpenPanel отличная. В ней есть всё, что мне нужно от аналитики: статистика, графики, источники трафика, география, устройства и т.д.',
      'Интерфейс прекрасен ✨ Чистый, современный вид, очень приятный для глаз.',
    ],
    replies: 25,
    retweets: 68,
    likes: 648,
  },
  {
    verified: true,
    avatarUrl: '/twitter-greg.png',
    name: 'greg hodson 🍜',
    handle: 'h0dson',
    content: ['поддерживаю, openpanel просто великолепен'],
    replies: 25,
    retweets: 68,
    likes: 648,
  },
  {
    verified: true,
    avatarUrl: '/twitter-jacob.jpg',
    name: 'Jacob 🍀 Build in Public',
    handle: 'javayhuwx',
    content: [
      '🤯 вау, потрясающе! Вчера вечером подключил @OpenPanelDev к http://indiehackers.site, и теперь вижу посетителей со всего мира.',
      'У OpenPanel более красивый UI и гораздо более мощные возможности по сравнению с Umami.',
      '#buildinpublic #indiehackers',
    ],
    replies: 25,
    retweets: 68,
    likes: 648,
  },
  {
    verified: true,
    avatarUrl: '/twitter-lee.jpg',
    name: 'Lee',
    handle: 'DutchEngIishman',
    content: [
      'Второй день маркетинга.',
      'Мне нравится этот восходящий тренд..',
      'P.S. сайт запустился в воскресенье',
      'P.P.S. Openpanel от @CarlLindesvard — потрясающий.',
    ],
    replies: 25,
    retweets: 68,
    likes: 648,
  },
  {
    verified: true,
    avatarUrl: '/twitter-thomas.jpg',
    name: 'Thomas Sanlis',
    handle: 'T_Zahil',
    content: [
      `Теперь мы спонсируем @OpenPanelDev с Uneed 🥳`,
      `Если ищете аналитику с открытым исходным кодом, OpenPanel — безусловно лучшая из всех, что я видел`,
      'Бонус: установка в один клик на Coolify 🥰',
    ],
    replies: 8,
    retweets: 3,
    likes: 23,
  },
];

export function Testimonials() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const isPausedRef = useRef(false);

  // Duplicate items to create the illusion of infinite scrolling
  const duplicatedTestimonials = useMemo(
    () => [...testimonials, ...testimonials],
    [],
  );

  useEffect(() => {
    const scrollerElement = scrollerRef.current;
    if (!scrollerElement) return;

    const handleScroll = () => {
      // When we've scrolled to the end of the first set, reset to the beginning
      // This creates a seamless infinite scroll effect
      const scrollWidth = scrollerElement.scrollWidth;
      const clientWidth = scrollerElement.clientWidth;
      const scrollLeft = scrollerElement.scrollLeft;

      // Reset scroll position when we reach halfway (end of first set)
      if (scrollLeft + clientWidth >= scrollWidth / 2) {
        scrollerElement.scrollLeft = scrollLeft - scrollWidth / 2;
      }
    };

    // Auto-scroll functionality
    const autoScroll = () => {
      if (!isPausedRef.current && scrollerElement) {
        scrollerElement.scrollLeft += 0.5; // Adjust speed here
        animationFrameRef.current = requestAnimationFrame(autoScroll);
      }
    };

    scrollerElement.addEventListener('scroll', handleScroll);

    // Start auto-scrolling
    animationFrameRef.current = requestAnimationFrame(autoScroll);

    // Pause on hover
    const handleMouseEnter = () => {
      isPausedRef.current = true;
    };
    const handleMouseLeave = () => {
      isPausedRef.current = false;
      animationFrameRef.current = requestAnimationFrame(autoScroll);
    };

    scrollerElement.addEventListener('mouseenter', handleMouseEnter);
    scrollerElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      scrollerElement.removeEventListener('scroll', handleScroll);
      scrollerElement.removeEventListener('mouseenter', handleMouseEnter);
      scrollerElement.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <Section className="overflow-hidden">
      <div className="container mb-16">
        <SectionHeader
          title="Пользователи в восторге"
          description="От инди-хакеров до глобальных команд — OpenPanel помогает без усилий понять своих пользователей."
        />
      </div>
      <div className="relative -mx-4 px-4">
        {/* Gradient masks for fade effect */}
        <div
          className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, hsl(var(--background)), transparent)',
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to left, hsl(var(--background)), transparent)',
          }}
        />

        <InfiniteMovingCards
          items={testimonials}
          direction="left"
          pauseOnHover
          speed="slow"
          className="gap-8"
          renderItem={(item) => (
            <TwitterCard
              name={item.name}
              handle={item.handle}
              content={item.content}
              avatarUrl={item.avatarUrl}
            />
          )}
        />
      </div>
    </Section>
  );
}
