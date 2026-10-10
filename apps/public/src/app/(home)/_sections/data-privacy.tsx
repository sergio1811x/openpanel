import { BoltIcon, GithubIcon, ServerIcon } from 'lucide-react';
import Link from 'next/link';
import { FeatureCard } from '@/components/feature-card';
import { GetStartedButton } from '@/components/get-started-button';
import { DataOwnershipIllustration } from '@/components/illustrations/data-ownership';
import { PrivacyIllustration } from '@/components/illustrations/privacy';
import { Section, SectionHeader } from '@/components/section';
import { Button } from '@/components/ui/button';

const secondaryFeatures = [
  {
    title: 'Открытый исходный код',
    description:
      'Полная прозрачность. Изучайте код, вносите вклад, делайте форк или развертывайте самостоятельно — без привязки к вендору.',
    icon: GithubIcon,
  },
  {
    title: 'Самостоятельный хостинг',
    description:
      'Разверните OpenPanel где угодно — на своём сервере, в своём облаке или локально. Полная гибкость.',
    icon: ServerIcon,
  },
  {
    title: 'Легковесный и быстрый',
    description:
      'Компактный и производительный трекер, который не замедлит ваш сайт.',
    icon: BoltIcon,
  },
];

export function DataPrivacy() {
  return (
    <Section className="container">
      <SectionHeader
        description="OpenPanel даёт аналитику на ваших условиях: с уважением к приватности, с открытым исходным кодом и с возможностью полностью развернуть у себя. Каждая часть платформы создана так, чтобы вы контролировали свои данные и получали быстрые, надёжные инсайты, не подрывая доверия пользователей."
        title={
          <>
            Создано ради контроля,
            <br />
            прозрачности и доверия
          </>
        }
      />
      <div className="mt-16 mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <FeatureCard
          description="Аналитика, соответствующая GDPR (общий регламент по защите данных), без cookies и назойливого отслеживания. Данные хранятся в ЕС, по запросу предоставляется соглашение об обработке данных (DPA)."
          illustration={<PrivacyIllustration />}
          title="Соответствует GDPR"
          variant="large"
        />
        <FeatureCard
          description="Данные принадлежат вам — никаких вендоров, обменов и скрытой обработки. Храните аналитику на собственной инфраструктуре и сохраняйте полный контроль."
          illustration={<DataOwnershipIllustration />}
          title="Владение данными"
          variant="large"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {secondaryFeatures.map((feature) => (
          <FeatureCard
            description={feature.description}
            icon={feature.icon}
            key={feature.title}
            title={feature.title}
          />
        ))}
      </div>
      <div className="row mt-8 gap-4">
        <GetStartedButton />
        <Button asChild className="px-6" size="lg" variant="outline">
          <Link href="/docs/self-hosting/self-hosting">Бесплатный self-hosting</Link>
        </Button>
      </div>
    </Section>
  );
}
