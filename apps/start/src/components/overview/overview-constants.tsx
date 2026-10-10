import type { IGetTopGenericInput } from '@openpanel/db';

export const OVERVIEW_COLUMNS_NAME: Record<
  IGetTopGenericInput['column'],
  string
> = {
  country: 'Страна',
  region: 'Регион',
  city: 'Город',
  browser: 'Браузер',
  brand: 'Бренд',
  os: 'ОС',
  device: 'Устройство',
  browser_version: 'Версия браузера',
  os_version: 'Версия ОС',
  model: 'Модель',
  referrer: 'Источник',
  referrer_name: 'Название источника',
  referrer_type: 'Тип источника',
  utm_source: 'UTM-источник',
  utm_medium: 'UTM-канал',
  utm_campaign: 'UTM-кампания',
  utm_term: 'UTM-термин',
  utm_content: 'UTM-содержание',
};

export const OVERVIEW_COLUMNS_NAME_PLURAL: Record<
  IGetTopGenericInput['column'],
  string
> = {
  country: 'Страны',
  region: 'Регионы',
  city: 'Города',
  browser: 'Браузеры',
  brand: 'Бренды',
  os: 'ОС',
  device: 'Устройства',
  browser_version: 'Версии браузеров',
  os_version: 'Версии ОС',
  model: 'Модели',
  referrer: 'Источники',
  referrer_name: 'Названия источников',
  referrer_type: 'Типы источников',
  utm_source: 'UTM-источники',
  utm_medium: 'UTM-каналы',
  utm_campaign: 'UTM-кампании',
  utm_term: 'UTM-термины',
  utm_content: 'UTM-содержание',
};

export const OVERVIEW_COLUMNS_TOP: Record<
  IGetTopGenericInput['column'],
  string
> = {
  country: 'Топ стран',
  region: 'Топ регионов',
  city: 'Топ городов',
  browser: 'Топ браузеров',
  brand: 'Топ брендов',
  os: 'Топ ОС',
  device: 'Топ устройств',
  browser_version: 'Топ версий браузера',
  os_version: 'Топ версий ОС',
  model: 'Топ моделей',
  referrer: 'Топ URL',
  referrer_name: 'Топ источников',
  referrer_type: 'Топ типов',
  utm_source: 'Топ UTM-источников',
  utm_medium: 'Топ UTM-каналов',
  utm_campaign: 'Топ UTM-кампаний',
  utm_term: 'Топ UTM-терминов',
  utm_content: 'Топ UTM-содержимого',
};
