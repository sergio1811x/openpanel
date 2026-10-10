const properties = {
  has_profile: 'С профилем',
  name: 'Название',
  path: 'Путь',
  origin: 'Домен',
  referrer: 'Источник',
  referrer_name: 'Название источника',
  duration: 'Длительность',
  created_at: 'Создано',
  country: 'Страна',
  city: 'Город',
  region: 'Регион',
  os: 'ОС',
  os_version: 'Версия ОС',
  browser: 'Браузер',
  browser_version: 'Версия браузера',
  device: 'Устройство',
  brand: 'Бренд',
  model: 'Модель',
};

export function getPropertyLabel(property: string) {
  return properties[property as keyof typeof properties] || property;
}
