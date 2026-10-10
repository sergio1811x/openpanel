import {
  GlobeIcon,
  Link2Icon,
  QrCodeIcon,
  SearchIcon,
  TimerIcon,
} from 'lucide-react';

export const TOOLS = [
  {
    name: 'Проверка URL',
    url: '/tools/url-checker',
    icon: SearchIcon,
    description:
      'Анализ любого URL: SEO, соцсети, технические данные и безопасность',
  },
  {
    name: 'Проверка IP',
    url: '/tools/ip-lookup',
    icon: GlobeIcon,
    description: 'Узнайте свой IP-адрес и данные геолокации',
  },
];
