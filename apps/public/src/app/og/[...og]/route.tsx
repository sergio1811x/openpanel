import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { getCompareData } from '@/lib/compare';
import { getFeatureData } from '@/lib/features';
import { url as baseUrl } from '@/lib/layout.shared';
import { articleSource, guideSource, pageSource, source } from '@/lib/source';

// Truncate text helper
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength).trim()}...`;
}

async function getOgData(
  segments: string[]
): Promise<{ title: string; description?: string }> {
  switch (segments[0]) {
    case 'default':
      return {
        title: 'Главная',
        description: 'Главная страница',
      };
    case 'supporter': {
      return {
        title: 'Стать спонсором',
        description:
          'Поддержите OpenPanel и получите эксклюзивные бонусы: свежие Docker-образы, приоритетную поддержку и ранний доступ к новым функциям.',
      };
    }
    case 'open-source': {
      return {
        title: 'Бесплатная аналитика для open source проектов',
        description:
          'Получите бесплатную веб- и продуктовую аналитику для вашего open source проекта. До 2,5 млн событий в месяц. Подайте заявку в open source программу OpenPanel.',
      };
    }
    case 'pricing': {
      return {
        title: 'Тарифы',
        description:
          'Наши тарифы максимально просты: выберите, сколько событий вы хотите отслеживать каждый месяц, — всё остальное без ограничений. Никаких уровней и скрытых расходов.',
      };
    }
    case 'articles': {
      if (segments.length > 1) {
        const data = await articleSource.getPage(segments.slice(1));
        return {
          title: data?.data.title ?? 'Статья не найдена',
          description:
            data?.data.description || 'Упс, не удалось найти эту статью',
        };
      }
      return {
        title: 'Статьи',
        description:
          'Читайте наши последние статьи и будьте в курсе свежих новостей и обновлений.',
      };
    }
    case 'compare': {
      const slug = segments[1];
      if (!slug) {
        return {
          title: 'Сравнение альтернатив',
          description: 'Сравните OpenPanel с другими инструментами аналитики',
        };
      }
      const data = await getCompareData(slug);
      return {
        title: data?.seo.title || data?.hero.heading || 'Сравнение',
        description: data?.seo.description || data?.hero.subheading,
      };
    }
    case 'guides': {
      if (segments.length > 1) {
        const data = await guideSource.getPage(segments.slice(1));
        return {
          title: data?.data.title ?? 'Руководство не найдено',
          description:
            data?.data.description || 'Упс, не удалось найти это руководство',
        };
      }
      return {
        title: 'Руководства по внедрению',
        description:
          'Пошаговые инструкции по подключению аналитики к вашему приложению',
      };
    }
    case 'features': {
      const slug = segments[1];
      if (!slug) {
        return {
          title: 'Возможности продуктовой аналитики',
          description:
            'Изучите возможности OpenPanel: отслеживание событий, воронки, удержание, профили пользователей и многое другое.',
        };
      }
      const featureData = await getFeatureData(slug);
      return {
        title: featureData?.seo.title ?? 'Возможность не найдена',
        description:
          featureData?.seo.description ?? featureData?.hero.subheading,
      };
    }
    case 'docs': {
      const data = await source.getPage(segments.slice(1));
      return {
        title: data?.data.title ?? 'Страница не найдена',
        description:
          data?.data.description || 'Упс, не удалось найти эту страницу',
      };
    }
    case 'tools': {
      if (segments.length > 1) {
        const tool = segments[1];
        switch (tool) {
          case 'ip-lookup':
            return {
              title: 'Проверка IP-адреса',
              description:
                'Подробная информация о любом IP-адресе: геолокация, провайдер и сетевые данные.',
            };
          case 'url-checker':
            return {
              title: 'Проверка URL',
              description:
                'Проанализируйте любой сайт: SEO, соцсети, технические данные и безопасность. Полный разбор любого URL.',
            };
          default:
            return {
              title: 'Инструменты',
              description: 'Бесплатные веб-инструменты для разработчиков и владельцев сайтов',
            };
        }
      }
      return {
        title: 'Инструменты',
        description: 'Бесплатные веб-инструменты для разработчиков и владельцев сайтов',
      };
    }
    default: {
      const data = await pageSource.getPage(segments);
      return {
        title: data?.data.title || 'Страница не найдена',
        description:
          data?.data.description || 'Упс, не удалось найти эту страницу',
      };
    }
  }
}

// export async function generateStaticParams() {
//   const params: { og: string[] }[] = [];

//   // Static pages
//   params.push({ og: ['default'] });
//   params.push({ og: ['supporter'] });
//   params.push({ og: ['pricing'] });
//   params.push({ og: ['articles'] });
//   params.push({ og: ['compare'] });
//   params.push({ og: ['docs'] });

//   // Articles
//   const articles = await articleSource.getPages();
//   for (const article of articles) {
//     const slug = article.url.replace(/^\/articles\//, '').replace(/\/$/, '');
//     params.push({ og: ['articles', slug] });
//   }

//   // Compare pages
//   const compareSlugs = await getAllCompareSlugs();
//   for (const slug of compareSlugs) {
//     params.push({ og: ['compare', slug] });
//   }

//   // Docs pages
//   const docs = await source.getPages();
//   for (const doc of docs) {
//     params.push({ og: ['docs', ...doc.slugs] });
//   }

//   // Other pages
//   const pages = await pageSource.getPages();
//   for (const page of pages) {
//     params.push({ og: page.slugs });
//   }

//   return params;
// }

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ og: string[] }> }
) {
  try {
    const { og } = await params;

    // Get OG data based on segments
    const { title, description } = await getOgData(og);

    // Truncate title and description
    const truncatedTitle = truncateText(title, 100);
    const truncatedDescription = description
      ? truncateText(description, 200)
      : undefined;

    // Get background image URL
    const backgroundImageUrl = baseUrl('/ogimage-empty.png');

    // Fetch Geist font files from CDN (cache fonts for better performance)
    const [geistRegular, geistBold] = await Promise.all([
      fetch(
        'https://cdn.jsdelivr.net/npm/geist@1.5.1/dist/fonts/geist-sans/Geist-Regular.ttf'
      ).then((res) => res.arrayBuffer()),
      fetch(
        'https://cdn.jsdelivr.net/npm/geist@1.5.1/dist/fonts/geist-sans/Geist-Bold.ttf'
      ).then((res) => res.arrayBuffer()),
    ]);

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
        }}
      >
        {/* Title and Description at bottom left */}
        <div
          style={{
            bottom: '55px',
            left: '55px',
            maxWidth: '900px',
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: truncatedTitle.length > 40 ? '56px' : '72px',
              fontFamily: 'GeistBold',
              color: '#000',
              lineHeight: 1.1,
              marginBottom: truncatedDescription ? '20px' : '0',
              fontWeight: 700,
            }}
          >
            {truncatedTitle}
          </div>

          {/* Description */}
          {truncatedDescription ? (
            <div
              style={{
                fontSize: '30px',
                fontFamily: 'Geist',
                color: '#666',
                lineHeight: 1.4,
                fontWeight: 400,
              }}
            >
              {truncatedDescription}
            </div>
          ) : null}
        </div>
      </div>,
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Geist',
            data: geistRegular,
            style: 'normal',
            weight: 400,
          },
          {
            name: 'GeistBold',
            data: geistBold,
            style: 'normal',
            weight: 700,
          },
        ],
      }
    );
  } catch (e: any) {
    console.error(`Failed to generate OG image: ${e.message}`);
    return new Response('Не удалось сгенерировать изображение', {
      status: 500,
    });
  }
}
