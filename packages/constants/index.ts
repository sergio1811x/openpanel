import { differenceInDays, isSameDay } from 'date-fns';

export const DEFAULT_ASPECT_RATIO = 0.5625;
export const NOT_SET_VALUE = '(не задано)';

export const RESERVED_EVENT_NAMES = ['session_start', 'session_end'] as const;

export const timeWindows = {
  '30min': {
    key: '30min',
    label: 'Последние 30 минут',
    shortcut: 'R',
  },
  lastHour: {
    key: 'lastHour',
    label: 'Последний час',
    shortcut: 'H',
  },
  last24h: {
    key: 'last24h',
    label: 'Последние 24 часа',
    shortcut: '4',
  },
  today: {
    key: 'today',
    label: 'Сегодня',
    shortcut: 'D',
  },
  yesterday: {
    key: 'yesterday',
    label: 'Вчера',
    shortcut: 'E',
  },
  '7d': {
    key: '7d',
    label: 'Последние 7 дней',
    shortcut: 'W',
  },
  '30d': {
    key: '30d',
    label: 'Последние 30 дней',
    shortcut: 'T',
  },
  '3m': {
    key: '3m',
    label: 'Последние 3 месяца',
    shortcut: '3',
  },
  '6m': {
    key: '6m',
    label: 'Последние 6 месяцев',
    shortcut: '6',
  },
  '12m': {
    key: '12m',
    label: 'Последние 12 месяцев',
    shortcut: '0',
  },
  monthToDate: {
    key: 'monthToDate',
    label: 'С начала месяца',
    shortcut: 'M',
  },
  lastMonth: {
    key: 'lastMonth',
    label: 'В прошлом месяце',
    shortcut: 'P',
  },
  yearToDate: {
    key: 'yearToDate',
    label: 'С начала года',
    shortcut: 'Y',
  },
  lastYear: {
    key: 'lastYear',
    label: 'В прошлом году',
    shortcut: 'U',
  },
  custom: {
    key: 'custom',
    label: 'Свой период',
    shortcut: 'C',
  },
} as const;

export const ProjectTypeNames = {
  website: 'Сайт',
  app: 'Приложение',
  backend: 'Бэкенд',
} as const;

export const operators = {
  is: 'Равно',
  isNot: 'Не равно',
  contains: 'Содержит',
  doesNotContain: 'Не содержит',
  startsWith: 'Начинается с',
  endsWith: 'Заканчивается на',
  regex: 'Регулярное выражение',
  isNull: 'Пустое',
  isNotNull: 'Не пустое',
  gt: 'Больше чем',
  lt: 'Меньше чем',
  gte: 'Больше или равно',
  lte: 'Меньше или равно',
  inCohort: 'В кохорте',
  notInCohort: 'Не в кохорте',
} as const;

// Compact labels for the operator trigger button. The comparison operators
// have very long names ("Greater than or equal to"), so we show a symbol on
// the trigger (reads naturally next to the value, e.g. "≥ 2019-01-01") and
// surface the full `operators` text as a sub-line in the dropdown.
export const operatorsShort: Record<keyof typeof operators, string> = {
  is: 'Равно',
  isNot: 'Не равно',
  contains: 'Содержит',
  doesNotContain: 'Не содержит',
  startsWith: 'Начинается с',
  endsWith: 'Заканчивается на',
  regex: 'Рег. выражение',
  isNull: 'Пустое',
  isNotNull: 'Не пустое',
  gt: '>',
  lt: '<',
  gte: '≥',
  lte: '≤',
  inCohort: 'В кохорте',
  notInCohort: 'Не в кохорте',
};

// Cast type a filter value/column should be coerced to before comparing.
// `string` (the default) keeps raw text comparison; the others wrap both sides
// of the comparison in the matching ClickHouse cast (see packages/db
// filter-cast.ts) so e.g. a date property compares as a date instead of
// crashing `toFloat64('2019-01-01')`.
export const filterValueTypes = {
  string: 'Текст',
  number: 'Число',
  date: 'Дата',
  datetime: 'Дата и время',
  boolean: 'Логический',
} as const;

export type IFilterValueType = keyof typeof filterValueTypes;

// Operators that make sense for each value type. The type constrains the
// operator list in the UI (a Number can't `contains`, a Boolean only
// `is`/`isNot`). Cohort operators are excluded everywhere — they're surfaced by
// CohortFilterItem, not the standard operator select.
const STRING_OPERATORS = [
  'is',
  'isNot',
  'contains',
  'doesNotContain',
  'startsWith',
  'endsWith',
  'regex',
  'isNull',
  'isNotNull',
] as const;

const ORDERED_OPERATORS = [
  'is',
  'isNot',
  'gt',
  'gte',
  'lt',
  'lte',
  'isNull',
  'isNotNull',
] as const;

const BOOLEAN_OPERATORS = ['is', 'isNot', 'isNull', 'isNotNull'] as const;

export function getOperatorsForType(
  type?: IFilterValueType,
): readonly (keyof typeof operators)[] {
  switch (type) {
    case 'number':
    case 'date':
    case 'datetime':
      return ORDERED_OPERATORS;
    case 'boolean':
      return BOOLEAN_OPERATORS;
    default:
      return STRING_OPERATORS;
  }
}

export const chartTypes = {
  linear: 'Линейный',
  bar: 'Столбчатый',
  histogram: 'Гистограмма',
  pie: 'Круговая',
  metric: 'Метрика',
  area: 'Область',
  map: 'Карта',
  funnel: 'Воронка',
  retention: 'Удержание',
  conversion: 'Конверсия',
  sankey: 'Санкей',
} as const;

export const chartSegments = {
  event: 'Все события',
  user: 'Уникальные пользователи',
  session: 'Уникальные сессии',
  group: 'Уникальные группы',
  user_average: 'В среднем на пользователя',
  one_event_per_user: 'Одно событие на пользователя',
  property_sum: 'Сумма свойства',
  property_average: 'Среднее свойства',
  property_max: 'Максимум свойства',
  property_min: 'Минимум свойства',
};

export const lineTypes = {
  monotone: 'Монотонная',
  monotoneX: 'Монотонная X',
  monotoneY: 'Монотонная Y',
  linear: 'Линейная',
  natural: 'Натуральная',
  basis: 'Базисная',
  step: 'Ступенчатая',
  stepBefore: 'Ступенчатая (до)',
  stepAfter: 'Ступенчатая (после)',
  basisClosed: 'Базисная замкнутая',
  basisOpen: 'Базисная разомкнутая',
  bumpX: 'Сглаженная X',
  bumpY: 'Сглаженная Y',
  bump: 'Сглаженная',
  linearClosed: 'Линейная замкнутая',
} as const;

export const intervals = {
  minute: 'Минута',
  day: 'День',
  hour: 'Час',
  week: 'Неделя',
  month: 'Месяц',
} as const;

export const alphabetIds = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const;

export const metrics = {
  count: 'count',
  sum: 'sum',
  average: 'average',
  min: 'min',
  max: 'max',
} as const;

export function isMinuteIntervalEnabledByRange(
  range: keyof typeof timeWindows
) {
  return range === '30min' || range === 'lastHour';
}

export function isHourIntervalEnabledByRange(range: keyof typeof timeWindows) {
  return (
    isMinuteIntervalEnabledByRange(range) ||
    range === 'today' ||
    range === 'yesterday' ||
    range === 'last24h' ||
    range === '7d'
  );
}

export function getDefaultIntervalByRange(
  range: keyof typeof timeWindows
): keyof typeof intervals {
  if (range === '30min' || range === 'lastHour') {
    return 'minute';
  }
  if (range === 'today' || range === 'yesterday' || range === 'last24h') {
    return 'hour';
  }
  if (
    range === '7d' ||
    range === '30d' ||
    range === '3m' ||
    range === 'lastMonth' ||
    range === 'monthToDate'
  ) {
    return 'day';
  }
  if (range === '6m') {
    return 'week';
  }
  return 'month';
}

export function getDefaultIntervalByDates(
  startDate: string | null,
  endDate: string | null
): null | keyof typeof intervals {
  if (startDate && endDate) {
    if (isSameDay(startDate, endDate)) {
      return 'hour';
    }
    const days = differenceInDays(endDate, startDate);
    if (days <= 92) {
      return 'day';
    }
    if (days <= 186) {
      return 'week';
    }
    return 'month';
  }

  return null;
}

export const countries = {
  AF: 'Афганистан',
  AL: 'Албания',
  DZ: 'Алжир',
  AS: 'Американское Самоа',
  AD: 'Андорра',
  AO: 'Ангола',
  AI: 'Ангилья',
  AQ: 'Антарктида',
  AG: 'Антигуа и Барбуда',
  AR: 'Аргентина',
  AM: 'Армения',
  AW: 'Аруба',
  AU: 'Австралия',
  AT: 'Австрия',
  AZ: 'Азербайджан',
  BS: 'Багамы',
  BH: 'Бахрейн',
  BD: 'Бангладеш',
  BB: 'Барбадос',
  BY: 'Беларусь',
  BE: 'Бельгия',
  BZ: 'Белиз',
  BJ: 'Бенин',
  BM: 'Бермуды',
  BT: 'Бутан',
  BO: 'Боливия',
  BQ: 'Бонэйр, Синт-Эстатиус и Саба',
  BA: 'Босния и Герцеговина',
  BW: 'Ботсвана',
  BV: 'Остров Буве',
  BR: 'Бразилия',
  IO: 'Британская территория в Индийском океане',
  BN: 'Бруней',
  BG: 'Болгария',
  BF: 'Буркина-Фасо',
  BI: 'Бурунди',
  CV: 'Кабо-Верде',
  KH: 'Камбоджа',
  CM: 'Камерун',
  CA: 'Канада',
  KY: 'Каймановы острова',
  CF: 'Центральноафриканская Республика',
  TD: 'Чад',
  CL: 'Чили',
  CN: 'Китай',
  CX: 'Остров Рождества',
  CC: 'Кокосовые острова',
  CO: 'Колумбия',
  KM: 'Коморы',
  CD: 'ДР Конго',
  CG: 'Конго',
  CK: 'Острова Кука',
  CR: 'Коста-Рика',
  HR: 'Хорватия',
  CU: 'Куба',
  CW: 'Кюрасао',
  CY: 'Кипр',
  CZ: 'Чехия',
  CI: 'Кот-д’Ивуар',
  DK: 'Дания',
  DJ: 'Джибути',
  DM: 'Доминика',
  DO: 'Доминиканская Республика',
  EC: 'Эквадор',
  EG: 'Египет',
  SV: 'Сальвадор',
  GQ: 'Экваториальная Гвинея',
  ER: 'Эритрея',
  EE: 'Эстония',
  SZ: 'Эсватини',
  ET: 'Эфиопия',
  FK: 'Фолклендские острова',
  FO: 'Фарерские острова',
  FJ: 'Фиджи',
  FI: 'Финляндия',
  FR: 'Франция',
  GF: 'Французская Гвиана',
  PF: 'Французская Полинезия',
  TF: 'Французские Южные территории',
  GA: 'Габон',
  GM: 'Гамбия',
  GE: 'Грузия',
  DE: 'Германия',
  GH: 'Гана',
  GI: 'Гибралтар',
  GR: 'Греция',
  GL: 'Гренландия',
  GD: 'Гренада',
  GP: 'Гваделупа',
  GU: 'Гуам',
  GT: 'Гватемала',
  GG: 'Гернси',
  GN: 'Гвинея',
  GW: 'Гвинея-Бисау',
  GY: 'Гайана',
  HT: 'Гаити',
  HM: 'Остров Херд и острова Макдональд',
  VA: 'Ватикан',
  HN: 'Гондурас',
  HK: 'Гонконг',
  HU: 'Венгрия',
  IS: 'Исландия',
  IN: 'Индия',
  ID: 'Индонезия',
  IR: 'Иран',
  IQ: 'Ирак',
  IE: 'Ирландия',
  IM: 'Остров Мэн',
  IL: 'Израиль',
  IT: 'Италия',
  JM: 'Ямайка',
  JP: 'Япония',
  JE: 'Джерси',
  JO: 'Иордания',
  KZ: 'Казахстан',
  KE: 'Кения',
  KI: 'Кирибати',
  KP: 'Северная Корея',
  KR: 'Южная Корея',
  KW: 'Кувейт',
  KG: 'Киргизия',
  LA: 'Лаос',
  LV: 'Латвия',
  LB: 'Ливан',
  LS: 'Лесото',
  LR: 'Либерия',
  LY: 'Ливия',
  LI: 'Лихтенштейн',
  LT: 'Литва',
  LU: 'Люксембург',
  MO: 'Макао',
  MG: 'Мадагаскар',
  MW: 'Малави',
  MY: 'Малайзия',
  MV: 'Мальдивы',
  ML: 'Мали',
  MT: 'Мальта',
  MH: 'Маршалловы Острова',
  MQ: 'Мартиника',
  MR: 'Мавритания',
  MU: 'Маврикий',
  YT: 'Майотта',
  MX: 'Мексика',
  FM: 'Микронезия',
  MD: 'Молдавия',
  MC: 'Монако',
  MN: 'Монголия',
  ME: 'Черногория',
  MS: 'Монтсеррат',
  MA: 'Марокко',
  MZ: 'Мозамбик',
  MM: 'Мьянма',
  NA: 'Намибия',
  NR: 'Науру',
  NP: 'Непал',
  NL: 'Нидерланды',
  NC: 'Новая Каледония',
  NZ: 'Новая Зеландия',
  NI: 'Никарагуа',
  NE: 'Нигер',
  NG: 'Нигерия',
  NU: 'Ниуэ',
  NF: 'Остров Норфолк',
  MP: 'Северные Марианские острова',
  NO: 'Норвегия',
  OM: 'Оман',
  PK: 'Пакистан',
  PW: 'Палау',
  PS: 'Палестина',
  PA: 'Панама',
  PG: 'Папуа — Новая Гвинея',
  PY: 'Парагвай',
  PE: 'Перу',
  PH: 'Филиппины',
  PN: 'Питкэрн',
  PL: 'Польша',
  PT: 'Португалия',
  PR: 'Пуэрто-Рико',
  QA: 'Катар',
  MK: 'Северная Македония',
  RO: 'Румыния',
  RU: 'Россия',
  RW: 'Руанда',
  RE: 'Реюньон',
  BL: 'Сен-Бартелеми',
  SH: 'Острова Святой Елены, Вознесения и Тристан-да-Кунья',
  KN: 'Сент-Китс и Невис',
  LC: 'Сент-Люсия',
  MF: 'Сен-Мартен',
  PM: 'Сен-Пьер и Микелон',
  VC: 'Сент-Винсент и Гренадины',
  WS: 'Самоа',
  SM: 'Сан-Марино',
  ST: 'Сан-Томе и Принсипи',
  SA: 'Саудовская Аравия',
  SN: 'Сенегал',
  RS: 'Сербия',
  SC: 'Сейшелы',
  SL: 'Сьерра-Леоне',
  SG: 'Сингапур',
  SX: 'Синт-Мартен',
  SK: 'Словакия',
  SI: 'Словения',
  SB: 'Соломоновы Острова',
  SO: 'Сомали',
  ZA: 'ЮАР',
  GS: 'Южная Георгия и Южные Сандвичевы острова',
  SS: 'Южный Судан',
  ES: 'Испания',
  LK: 'Шри-Ланка',
  SD: 'Судан',
  SR: 'Суринам',
  SJ: 'Шпицберген и Ян-Майен',
  SE: 'Швеция',
  CH: 'Швейцария',
  SY: 'Сирия',
  TW: 'Тайвань',
  TJ: 'Таджикистан',
  TZ: 'Танзания',
  TH: 'Таиланд',
  TL: 'Восточный Тимор',
  TG: 'Того',
  TK: 'Токелау',
  TO: 'Тонга',
  TT: 'Тринидад и Тобаго',
  TN: 'Тунис',
  TR: 'Турция',
  TM: 'Туркмения',
  TC: 'Тёркс и Кайкос',
  TV: 'Тувалу',
  UG: 'Уганда',
  UA: 'Украина',
  AE: 'Объединённые Арабские Эмираты',
  GB: 'Великобритания',
  US: 'США',
  UM: 'Внешние малые острова США',
  UY: 'Уругвай',
  UZ: 'Узбекистан',
  VU: 'Вануату',
  VE: 'Венесуэла',
  VN: 'Вьетнам',
  VG: 'Британские Виргинские острова',
  VI: 'Американские Виргинские острова',
  WF: 'Уоллис и Футуна',
  EH: 'Западная Сахара',
  YE: 'Йемен',
  ZM: 'Замбия',
  ZW: 'Зимбабве',
  AX: 'Аландские острова',
} as const;

export function getCountry(code?: string) {
  return countries[code as keyof typeof countries];
}

// Keys must match the template `category` in @openpanel/email. Each entry's
// label + description drive the account email-preferences toggles.
export const emailCategories = {
  onboarding: {
    label: 'Онбординг',
    description: 'Советы и подсказки для начала работы',
  },
  weekly_digest: {
    label: 'Недельный дайджест',
    description: 'Еженедельная сводка аналитики с AI-инсайтами',
  },
  product_alerts: {
    label: 'Продуктовые оповещения',
    description:
      'Важные уведомления о ваших проектах: остановка передачи данных, лимиты событий и оповещения из правил уведомлений',
  },
  // Kept separate from `onboarding` on purpose: opting out of getting-started
  // tips must not also opt you out of being told your account is winding down.
  // The final deletion warning has no category at all, so it always sends.
  account_lifecycle: {
    label: 'Статус аккаунта',
    description:
      'Уведомления об окончании триала, приостановке приёма событий и данных, запланированных к удалению',
  },
} as const;

export type EmailCategory = keyof typeof emailCategories;

export const chartColors = [
  { main: '#2563EB', translucent: 'rgba(37, 99, 235, 0.1)' },
  { main: '#ff7557', translucent: 'rgba(255, 117, 87, 0.1)' },
  { main: '#7fe1d8', translucent: 'rgba(127, 225, 216, 0.1)' },
  { main: '#f8bc3c', translucent: 'rgba(248, 188, 60, 0.1)' },
  { main: '#b3596e', translucent: 'rgba(179, 89, 110, 0.1)' },
  { main: '#72bef4', translucent: 'rgba(114, 190, 244, 0.1)' },
  { main: '#ffb27a', translucent: 'rgba(255, 178, 122, 0.1)' },
  { main: '#0f7ea0', translucent: 'rgba(15, 126, 160, 0.1)' },
  { main: '#3ba974', translucent: 'rgba(59, 169, 116, 0.1)' },
  { main: '#febbb2', translucent: 'rgba(254, 187, 178, 0.1)' },
  { main: '#cb80dc', translucent: 'rgba(203, 128, 220, 0.1)' },
  { main: '#5cb7af', translucent: 'rgba(92, 183, 175, 0.1)' },
  { main: '#7856ff', translucent: 'rgba(120, 86, 255, 0.1)' },
];
