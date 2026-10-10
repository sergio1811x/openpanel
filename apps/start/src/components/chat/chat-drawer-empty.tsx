import CopyInput from '@/components/forms/copy-input';
import { usePageContextValue } from '@/contexts/page-context';
import { ExternalLinkIcon, KeyRoundIcon, SparklesIcon } from 'lucide-react';
import { useChatRuntime } from './chat-runtime';

/**
 * Empty-state panel shown inside the drawer body when a chat has no
 * messages yet — page-aware suggestion prompts. The "AI not configured"
 * variant is a separate component (`ChatDrawerNotConfigured` below)
 * rendered directly from `<ChatDrawer>` without the runtime, since
 * it doesn't depend on an agent being available.
 */
export function ChatDrawerEmpty() {
  const ctx = usePageContextValue();
  const { send } = useChatRuntime();
  const suggestions = getSuggestionsForContext(ctx);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-8 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <SparklesIcon className="size-5" />
      </div>
      <div className="max-w-xs">
        <h3 className="font-semibold text-xl mb-2">{suggestions.headline}</h3>
        <p className="mt-1.5 text-muted-foreground leading-[1.5]">
          {suggestions.description}
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-2 items-center">
        {suggestions.prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => send(prompt)}
            className="rounded-md border bg-muted/30 px-3 py-2 text-left text-sm text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChatDrawerNotConfigured() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-8 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <KeyRoundIcon className="size-5" />
      </div>
      <div className="max-w-xs">
        <h3 className="font-semibold text-xl mb-2">Чат ИИ не настроен</h3>
        <p className="mt-1.5 text-muted-foreground leading-[1.5]">
          Установите <code className="font-mono text-sm">OPENAI_API_KEY</code> и/или{' '}
          <code className="font-mono text-sm">ANTHROPIC_API_KEY</code> в сервисе
          API, чтобы включить чат ИИ, затем перезапустите его. В списке моделей
          отображаются только провайдеры с настроенным ключом.
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <CopyInput label="OpenAI" value="OPENAI_API_KEY=sk-..." />
        <CopyInput label="Anthropic" value="ANTHROPIC_API_KEY=sk-ant-..." />
      </div>
      <a
        href="#"
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        Просмотр документации по настройке
        <ExternalLinkIcon className="size-3.5" />
      </a>
    </div>
  );
}

type Suggestions = {
  headline: string;
  description: string;
  prompts: string[];
};

function getSuggestionsForContext(
  ctx: ReturnType<typeof usePageContextValue>,
): Suggestions {
  if (!ctx) {
    return {
      headline: 'Спросите о Ваших данных',
      description:
        'Я могу отвечать на вопросы по Вашей аналитике, создавать отчёты и разбираться в пользователях, сессиях или страницах.',
      prompts: [
        'Что произошло вчера?',
        'Покажи трафик за последние 7 дней',
        'Какие страницы имеют самый высокий показатель отказов?',
      ],
    };
  }

  switch (ctx.page) {
    case 'overview':
      return {
        headline: 'Спросите об этом обзоре',
        description:
          'Я могу объяснить тренды, сравнить периоды или отфильтровать страницу. Задайте вопрос или выберите готовый вариант.',
        prompts: [
          'Что изменилось по сравнению с предыдущим периодом?',
          'Фильтровать только мобильные устройства',
          'Покажи трафик за последние 7 дней',
          'Какие источники привели больше всего сессий?',
        ],
      };

    case 'insights':
      return {
        headline: 'Изучите Ваши инсайты',
        description:
          'Я могу объяснить, почему сработал инсайт, найти связанные или провести Вас по самым важным.',
        prompts: [
          'Какие инсайты сейчас самые важные?',
          'Объясни самую большую аномалию за эту неделю',
          'Есть ли инсайты, связанные с трендами устройств?',
        ],
      };

    case 'pages':
      return {
        headline: 'Спросите о Ваших страницах',
        description:
          'Я могу ранжировать страницы по эффективности, найти падающие или выявить паттерны входа/выхода.',
        prompts: [
          'Какие страницы упали по сравнению с прошлым месяцем?',
          'Покажи страницы с самым высоким показателем отказов',
          'Топ страниц входа за последние 7 дней',
          'Найди страницы со слабым SEO',
        ],
      };

    case 'seo':
      return {
        headline: 'Разберитесь в своём SEO',
        description:
          'Я могу найти перспективные запросы, проверить каннибализацию и сопоставить SEO с вовлечённостью на сайте.',
        prompts: [
          'Запросы на 2-й странице с высокими показами (лёгкие победы)',
          'Есть ли каннибализация запросов, которую стоит исправить?',
          'Какие страницы получают клики из GSC, но имеют высокий отказ?',
          'Топ SEO-запросов за последние 30 дней',
        ],
      };

    case 'events':
      return {
        headline: 'Проанализируйте Ваши события',
        description:
          'Я могу проанализировать распределение, сопоставить события и детально разобрать свойства.',
        prompts: [
          'Какие события часто происходят вместе?',
          'Проанализируй распределение событий по странам',
          'Фильтровать только события регистрации',
          'Какие свойства событий встречаются чаще всего?',
        ],
      };

    case 'profileDetail':
      return {
        headline: 'Спросите об этом пользователе',
        description:
          'Я могу сделать сводку по этому профилю, построить путь или сравнить пользователя со средним.',
        prompts: [
          'Расскажи о пути этого пользователя',
          'Как этот пользователь сравнивается со средним?',
          'Какой была его последняя сессия?',
          'Есть ли необычное поведение?',
        ],
      };

    case 'sessionDetail':
      return {
        headline: 'Спросите об этой сессии',
        description:
          'Я могу разобрать путь, сравнить с типичными сессиями или объяснить контекст источника.',
        prompts: [
          'Разбери мне эту сессию',
          'Как это сравнивается с типичными сессиями?',
          'Откуда пришёл этот трафик?',
          'Есть ли похожие сессии сегодня?',
        ],
      };

    case 'groupDetail':
      return {
        headline: 'Спросите об этой группе',
        description:
          'Я могу показать метрики, перечислить участников и сравнить с похожими группами.',
        prompts: [
          'Сделай сводку активности этой группы',
          'Сравни с другими группами',
          'Кто самые активные участники?',
          'Каков тренд вовлечённости этой группы?',
        ],
      };

    case 'reportEditor':
      return {
        headline: 'Отредактируйте этот отчёт вместе со мной',
        description:
          'Я могу предварительно показать изменения, предложить разбивки или сравнить с предыдущим периодом.',
        prompts: [
          'Предложи полезные разбивки для этого отчёта',
          'Сравни с предыдущим периодом',
          'Найди аномалии в текущих данных',
          'Добавь разбивку по странам',
        ],
      };

    case 'dashboard':
      return {
        headline: 'Спросите об этом дашборде',
        description:
          'Я могу сделать сводку по всем отчётам этого дашборда сразу, отметить изменения или приблизиться к конкретному графику.',
        prompts: [
          'Сделай сводку по этому дашборду',
          'Что здесь работает хуже всего?',
          'Сравни этот дашборд с предыдущим периодом',
          'В каком отчёте самое большое изменение?',
        ],
      };

    default:
      return {
        headline: 'Спросите о Ваших данных',
        description:
          'Я могу отвечать на вопросы по просматриваемой странице, создавать отчёты и разбираться в конкретных пользователях, сессиях или страницах.',
        prompts: [
          'Сколько у нас посетителей на этой неделе?',
          'Топ источников трафика прямо сейчас',
          'Покажи топ страниц по показателю отказов',
        ],
      };
  }
}
