/**
 * Humanizes raw tool names into action-phrase labels for the UI.
 *
 * Each tool gets a tuple: (verb-form for in-progress, noun-form for
 * completed). E.g.
 *   list_event_names → ["Ищу названия событий", "Названия событий"]
 *
 * Falls back to a generic transformation when a tool isn't in the
 * map: snake_case → "Snake case", with verb-prefix heuristics
 * ("get_" → "Загружаю", "list_" → "Ищу", "find_" → "Ищу").
 */

const VERB_PREFIXES: Array<[string, string]> = [
  ['list_', 'Ищу'],
  ['get_', 'Загружаю'],
  ['find_', 'Ищу'],
  ['query_', 'Запрашиваю'],
  ['analyze_', 'Анализирую'],
  ['compare_', 'Сравниваю'],
  ['correlate_', 'Сопоставляю'],
  ['explain_', 'Объясняю'],
  ['suggest_', 'Подбираю'],
  ['preview_', 'Просматриваю'],
  ['generate_', 'Создаю'],
  ['apply_', 'Применяю'],
  ['set_', 'Обновляю'],
  ['gsc_', 'Загружаю SEO'],
];

const PHRASES: Record<
  string,
  { active: string; done: string }
> = {
  // Discovery
  list_event_names: { active: 'Ищу названия событий', done: 'Названия событий' },
  list_event_properties: {
    active: 'Ищу свойства',
    done: 'Свойства событий',
  },
  get_event_property_values: {
    active: 'Загружаю значения свойств',
    done: 'Значения свойств',
  },

  // Saved reports & dashboards
  list_dashboards: { active: 'Загружаю дашборды', done: 'Дашборды' },
  list_reports: { active: 'Загружаю отчёты', done: 'Отчёты' },
  get_report_data: { active: 'Выполняю отчёт', done: 'Отчёт' },
  generate_report: { active: 'Создаю отчёт', done: 'Отчёт' },

  // Aggregate analytics
  get_analytics_overview: { active: 'Загружаю обзор', done: 'Обзор' },
  get_top_pages: { active: 'Загружаю топ страниц', done: 'Топ страниц' },
  get_top_referrers: {
    active: 'Загружаю топ источников',
    done: 'Топ источников',
  },
  get_country_breakdown: {
    active: 'Загружаю гео-разбивку',
    done: 'Гео-разбивка',
  },
  get_device_breakdown: {
    active: 'Загружаю разбивку по устройствам',
    done: 'Разбивка по устройствам',
  },
  get_rolling_active_users: {
    active: 'Загружаю активных пользователей',
    done: 'Активные пользователи',
  },
  get_funnel: { active: 'Строю воронку', done: 'Воронка' },
  get_retention_cohort: {
    active: 'Строю кохорту удержания',
    done: 'Удержание',
  },
  get_user_flow: { active: 'Строю путь пользователя', done: 'Путь пользователя' },

  // Free-form
  query_events: { active: 'Запрашиваю события', done: 'События' },
  query_sessions: { active: 'Запрашиваю сессии', done: 'Сессии' },
  find_profiles: { active: 'Ищу профили', done: 'Профили' },

  // Profile
  get_profile_full: { active: 'Загружаю профиль', done: 'Профиль' },
  get_profile_events: {
    active: 'Загружаю события профиля',
    done: 'События профиля',
  },
  get_profile_sessions: {
    active: 'Загружаю сессии профиля',
    done: 'Сессии профиля',
  },
  get_profile_metrics: {
    active: 'Загружаю метрики профиля',
    done: 'Метрики профиля',
  },
  get_profile_journey: {
    active: 'Загружаю путь пользователя',
    done: 'Путь пользователя',
  },
  get_profile_groups: {
    active: 'Загружаю группы профиля',
    done: 'Группы профиля',
  },
  compare_profile_to_average: {
    active: 'Сравниваю со средним',
    done: 'Сравнение профиля',
  },

  // Session
  get_session_full: { active: 'Загружаю сессию', done: 'Сессия' },
  get_session_path: { active: 'Загружаю путь сессии', done: 'Путь сессии' },
  get_session_events: {
    active: 'Загружаю события сессии',
    done: 'События сессии',
  },
  get_similar_sessions: {
    active: 'Ищу похожие сессии',
    done: 'Похожие сессии',
  },
  compare_session_to_typical: {
    active: 'Сравниваю с типичной',
    done: 'Сравнение сессий',
  },
  get_session_referrer_context: {
    active: 'Загружаю контекст источника',
    done: 'Контекст источника',
  },
  get_session_replay_summary: {
    active: 'Загружаю повтор сессии',
    done: 'Повтор сессии',
  },

  // Pages
  get_page_performance: {
    active: 'Загружаю эффективность страницы',
    done: 'Эффективность страницы',
  },
  get_page_conversions: {
    active: 'Загружаю конверсии страницы',
    done: 'Конверсии страницы',
  },
  get_entry_exit_pages: {
    active: 'Загружаю страницы входа/выхода',
    done: 'Страницы входа/выхода',
  },
  find_declining_pages: {
    active: 'Ищу падающие страницы',
    done: 'Падающие страницы',
  },

  // SEO / GSC
  gsc_get_overview: { active: 'Загружаю SEO-обзор', done: 'SEO-обзор' },
  gsc_get_top_queries: { active: 'Загружаю топ запросов', done: 'Топ запросов' },
  gsc_get_top_pages: {
    active: 'Загружаю топ SEO-страниц',
    done: 'Топ SEO-страниц',
  },
  gsc_get_query_details: {
    active: 'Загружаю детали запроса',
    done: 'Детали запроса',
  },
  gsc_get_page_details: {
    active: 'Загружаю детали страницы',
    done: 'Детали страницы',
  },
  gsc_get_query_opportunities: {
    active: 'Ищу возможности по запросам',
    done: 'Возможности по запросам',
  },
  gsc_get_cannibalization: {
    active: 'Проверяю каннибализацию',
    done: 'Каннибализация',
  },
  correlate_seo_with_traffic: {
    active: 'Сопоставляю SEO с трафиком',
    done: 'Корреляция SEO и трафика',
  },

  // Events
  analyze_event_distribution: {
    active: 'Анализирую распределение событий',
    done: 'Распределение событий',
  },
  correlate_events: { active: 'Сопоставляю события', done: 'Корреляция событий' },
  get_event_property_distribution: {
    active: 'Загружаю распределение свойств',
    done: 'Распределение свойств',
  },
  list_properties_for_event: {
    active: 'Загружаю свойства',
    done: 'Свойства событий',
  },

  // Insights
  list_insights: { active: 'Загружаю инсайты', done: 'Инсайты' },
  explain_insight: { active: 'Загружаю инсайт', done: 'Инсайт' },
  find_related_insights: {
    active: 'Ищу связанные инсайты',
    done: 'Связанные инсайты',
  },

  // Group
  get_group_full: { active: 'Загружаю группу', done: 'Группа' },
  get_group_members: { active: 'Загружаю участников группы', done: 'Участники группы' },
  get_group_events: { active: 'Загружаю события группы', done: 'События группы' },
  get_group_metrics: {
    active: 'Загружаю метрики группы',
    done: 'Метрики группы',
  },
  compare_groups: { active: 'Сравниваю группы', done: 'Сравнение групп' },

  // Report editor
  preview_report_with_changes: {
    active: 'Просматриваю изменения',
    done: 'Предпросмотр отчёта',
  },
  suggest_breakdowns: {
    active: 'Подбираю разбивки',
    done: 'Предложения разбивок',
  },
  compare_to_previous_period: {
    active: 'Сравниваю с предыдущим периодом',
    done: 'Сравнение периодов',
  },
  find_anomalies_in_current_report: {
    active: 'Ищу аномалии',
    done: 'Аномалии',
  },
  explain_filter_impact: {
    active: 'Анализирую влияние фильтра',
    done: 'Влияние фильтра',
  },

  // UI mutators (client-side)
  apply_filters: {
    active: 'Применяю период',
    done: 'Период обновлён',
  },
  set_property_filters: {
    active: 'Применяю фильтры',
    done: 'Фильтры обновлены',
  },
  set_event_names_filter: {
    active: 'Применяю фильтр событий',
    done: 'Фильтр событий обновлён',
  },

  // References
  list_references: {
    active: 'Загружаю точки отсчёта',
    done: 'Точки отсчёта',
  },
  get_references_around: {
    active: 'Проверяю точки отсчёта рядом с этой датой',
    done: 'Точки отсчёта рядом',
  },
};

export type ToolPhrasePhase = 'active' | 'done';

export function getToolPhrase(toolName: string, phase: ToolPhrasePhase): string {
  const explicit = PHRASES[toolName];
  if (explicit) return explicit[phase];

  const matchedPrefix = VERB_PREFIXES.find(([p]) => toolName.startsWith(p));
  const verb = matchedPrefix?.[0] ?? '';
  const verbLabel = matchedPrefix?.[1] ?? 'Выполняю';

  const noun = humanizeNoun(toolName.slice(verb.length) || toolName);
  return phase === 'active' ? `${verbLabel} ${noun.toLowerCase()}` : noun;
}

function humanizeNoun(s: string): string {
  return s
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}
