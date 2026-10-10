import {
  AwardIcon,
  HeartIcon,
  type LucideIcon,
  MessageCircleIcon,
  RocketIcon,
  SparklesIcon,
  ZapIcon,
} from 'lucide-react';
import { PromptCard } from '@/components/organization/prompt-card';
import { LinkButton } from '@/components/ui/button';
import { useAppContext } from '@/hooks/use-app-context';
import { useCookieStore } from '@/hooks/use-cookie-store';

const PERKS = [
  {
    icon: RocketIcon,
    text: 'Свежие Docker-образы',
    description: 'Сборки последней версии при каждом коммите',
  },
  {
    icon: MessageCircleIcon,
    text: 'Приоритетная поддержка',
    description: 'Получайте помощь быстрее с приоритетной поддержкой в Discord',
  },
  {
    icon: SparklesIcon,
    text: 'Запросы функций',
    description: 'Ваши идеи получают приоритет в нашем роадмапе',
  },
  {
    icon: AwardIcon,
    text: 'Эксклюзивная роль в Discord',
    description: 'Особый бейдж и признание в нашем сообществе',
  },
  {
    icon: ZapIcon,
    text: 'Ранний доступ',
    description: 'Пробуйте новые функции до публичного релиза',
  },
  {
    icon: HeartIcon,
    text: 'Прямое влияние',
    description: 'Ваша поддержка напрямую финансирует разработку',
  },
] as const;

function PerkPoint({
  icon: Icon,
  text,
  description,
}: {
  icon: LucideIcon;
  text: string;
  description: string;
}) {
  return (
    <div className="row items-center gap-4">
      <Icon className="size-4" />
      <div className="col min-w-0 flex-1 gap-1.5">
        <h3 className="font-medium text-sm">{text}</h3>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </div>
  );
}

export default function SupporterPrompt() {
  const { isSelfHosted, isDemo } = useAppContext();
  const [supporterPromptClosed, setSupporterPromptClosed] = useCookieStore(
    'supporter-prompt-closed',
    false
  );

  if (!isSelfHosted || isDemo) {
    return null;
  }

  return (
    <PromptCard
      gradientColor="rgb(16 185 129)"
      onClose={() => setSupporterPromptClosed(true)}
      show={!supporterPromptClosed}
      subtitle="Помогите нам строить будущее открытой аналитики"
      title="Поддержите Openpanel RU"
    >
      <div className="col gap-3 px-6">
        {PERKS.map((perk) => (
          <PerkPoint
            description={perk.description}
            icon={perk.icon}
            key={perk.text}
            text={perk.text}
          />
        ))}
      </div>

      <div className="px-6">
        <LinkButton
          className="w-full"
          href="https://buy.polar.sh/polar_cl_Az1CruNFzQB2bYdMOZmGHqTevW317knWqV44W1FqZmV"
        >
          Стать сторонником
        </LinkButton>
        <p className="mt-4 text-center text-muted-foreground text-xs">
          От $20 в месяц • Отмена в любой момент •{' '}
          <a
            className="text-primary underline-offset-4 hover:underline"
            href="#"
            rel="noreferrer"
            target="_blank"
          >
            Подробнее
          </a>
        </p>
      </div>
    </PromptCard>
  );
}
