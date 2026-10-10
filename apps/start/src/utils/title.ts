/**
 * Utility functions for generating page titles
 */

const BASE_TITLE = 'OpenPanel.dev';

/**
 * Creates a hierarchical title with the format: "Page Title | Section | OpenPanel.dev"
 */
export function createTitle(
  pageTitle: string,
  section?: string,
  baseTitle = BASE_TITLE
): string {
  const parts = [pageTitle];
  if (section) {
    parts.push(section);
  }
  parts.push(baseTitle);
  return parts.join(' | ');
}

/**
 * Creates a title for organization-level pages
 */
export function createOrganizationTitle(
  pageTitle: string,
  organizationName?: string
): string {
  if (organizationName) {
    return createTitle(pageTitle, organizationName);
  }
  return createTitle(pageTitle, 'Организация');
}

/**
 * Creates a title for project-level pages
 */
export function createProjectTitle(
  pageTitle: string,
  projectName?: string,
  organizationName?: string
): string {
  const parts = [pageTitle];
  if (projectName) {
    parts.push(projectName);
  }
  if (organizationName) {
    parts.push(organizationName);
  }
  parts.push(BASE_TITLE);
  return parts.join(' | ');
}

/**
 * Creates a title for specific entity pages (reports, sessions, etc.)
 */
export function createEntityTitle(
  entityName: string,
  entityType: string,
  projectName?: string,
  organizationName?: string
): string {
  const parts = [entityName, entityType];
  if (projectName) {
    parts.push(projectName);
  }
  if (organizationName) {
    parts.push(organizationName);
  }
  parts.push(BASE_TITLE);
  return parts.join(' | ');
}

/**
 * Common page titles
 */
export const PAGE_TITLES = {
  // Main sections
  DASHBOARD: 'Дашборд',
  EVENTS: 'События',
  SESSIONS: 'Сессии',
  PAGES: 'Страницы',
  REPORTS: 'Отчёты',
  NOTIFICATIONS: 'Уведомления',
  SETTINGS: 'Настройки',
  INTEGRATIONS: 'Интеграции',
  MEMBERS: 'Участники',
  BILLING: 'Биллинг',
  CHAT: 'AI-ассистент',
  REALTIME: 'Реалтайм',
  REFERENCES: 'Референсы',
  INSIGHTS: 'Инсайты',
  // Profiles
  PROFILES: 'Профили',
  PROFILE_EVENTS: 'События профиля',
  PROFILE_DETAILS: 'Детали профиля',
  // Groups
  GROUPS: 'Группы',
  GROUP_DETAILS: 'Детали группы',
  // Cohorts
  COHORTS: 'Кохорты',
  COHORT_DETAIL: 'Кохорта',
  COHORT_MEMBERS: 'Участники кохорты',
  COHORT_EVENTS: 'События кохорты',

  // Sub-sections
  CONVERSIONS: 'Конверсии',
  STATS: 'Статистика',
  ANONYMOUS: 'Анонимные',
  IDENTIFIED: 'Идентифицированные',
  POWER_USERS: 'Опытные пользователи',
  CLIENTS: 'Клиенты',
  DETAILS: 'Детали',
  AVAILABLE: 'Доступные',
  INSTALLED: 'Установленные',
  INVITATIONS: 'Приглашения',

  // Actions
  CREATE: 'Создать',
  EDIT: 'Изменить',
  DELETE: 'Удалить',

  // Onboarding
  ONBOARDING: 'Начало работы',
  CONNECT: 'Подключение',
  VERIFY: 'Проверка',
  PROJECT: 'Проект',
  PROJECTS: 'Проекты',

  // Auth
  LOGIN: 'Вход',
  RESET_PASSWORD: 'Сброс пароля',

  // Share
  SHARE: 'Общий дашборд',
} as const;
