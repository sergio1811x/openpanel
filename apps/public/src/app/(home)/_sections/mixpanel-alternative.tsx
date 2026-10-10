import { BarChart2Icon, CoinsIcon, GithubIcon, ServerIcon } from 'lucide-react';
import Link from 'next/link';
import { FeatureCard } from '@/components/feature-card';
import { GetStartedButton } from '@/components/get-started-button';
import { Section, SectionHeader } from '@/components/section';
import { Button } from '@/components/ui/button';

const reasons = [
  {
    icon: CoinsIcon,
    title: 'Лишь малая доля стоимости',
    description:
      'Тарифы Mixpanel растут до сотен или тысяч долларов в месяц с ростом объёма событий. OpenPanel начинается с $2.50/месяц — или разверните бесплатно у себя без лимитов на события.',
  },
  {
    icon: BarChart2Icon,
    title: 'Функции, которыми вы реально пользуетесь',
    description:
      'События, воронки, удержание, когорты, профили пользователей, кастомные дашборды и A/B-тесты — всё на месте. OpenPanel покрывает все ключевые сценарии аналитики из Mixpanel без долгого освоения.',
  },
  {
    icon: ServerIcon,
    title: 'Настоящий self-hosting',
    description:
      'Mixpanel — только облако. OpenPanel работает на вашей собственной инфраструктуре с простой настройкой через Docker. Полное владение данными, ноль привязки к вендору.',
  },
  {
    icon: GithubIcon,
    title: 'Открытый и прозрачный код',
    description:
      'Mixpanel — чёрный ящик. Код OpenPanel публичен на GitHub: проверяйте, вносите вклад или делайте форк. Без сюрпризов и скрытой обработки данных.',
  },
];

export function MixpanelAlternative() {
  return (
    <Section className="container">
      <SectionHeader
        description="Ищете лучшую альтернативу Mixpanel в 2026 году? OpenPanel покрывает функции продуктовой аналитики, которыми команды реально пользуются, — события, воронки, удержание, когорты и профили пользователей — без цен Mixpanel, компромиссов по приватности и привязки к вендору."
        label="Лучшие альтернативы Mixpanel"
        title="Лучшие альтернативы Mixpanel в 2026 году — почему команды переходят на OpenPanel"
      />
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {reasons.map((reason) => (
          <FeatureCard
            description={reason.description}
            icon={reason.icon}
            key={reason.title}
            title={reason.title}
          />
        ))}
      </div>
      <div className="row mt-8 gap-4">
        <GetStartedButton />
        <Button asChild className="px-6" size="lg" variant="outline">
          <Link href="/compare/mixpanel-alternative">
            OpenPanel против Mixpanel →
          </Link>
        </Button>
      </div>
    </Section>
  );
}
