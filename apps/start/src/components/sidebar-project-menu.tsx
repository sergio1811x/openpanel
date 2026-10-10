import type { IServiceDashboards } from '@openpanel/db';
import { useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BellIcon,
  WorkflowIcon,
  BookOpenIcon,
  Building2Icon,
  ChartLineIcon,
  ChevronDownIcon,
  CogIcon,
  GanttChartIcon,
  Globe2Icon,
  GridIcon,
  LayersIcon,
  LayoutDashboardIcon,
  LayoutPanelTopIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  TargetIcon,
  TrendingUpDownIcon,
  UndoDotIcon,
  UserCircleIcon,
  UsersIcon,
  WallpaperIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { SidebarLink } from './sidebar-link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useChatState } from '@/components/chat/chat-context';
import { SidebarChatComposer } from '@/components/chat/sidebar-chat-composer';
import { pushModal } from '@/modals';
import { cn } from '@/utils/cn';

interface SidebarProjectMenuProps {
  dashboards: IServiceDashboards;
}

export default function SidebarProjectMenu({
  dashboards,
}: SidebarProjectMenuProps) {
  return (
    <>
      <SidebarChatComposer />
      <div className="mb-2 font-medium text-muted-foreground text-sm">
        Аналитика
      </div>
      <SidebarLink href={'/'} icon={WallpaperIcon} label="Обзор" />
      <SidebarLink
        href={'/dashboards'}
        icon={LayoutPanelTopIcon}
        label="Дашборды"
      />
      <SidebarLink
        href={'/insights'}
        icon={TrendingUpDownIcon}
        label="Инсайты"
      />
      <SidebarLink href={'/pages'} icon={LayersIcon} label="Страницы" />
      <SidebarLink href={'/seo'} icon={SearchIcon} label="SEO" />
      <SidebarLink href={'/realtime'} icon={Globe2Icon} label="Реалтайм" />
      <SidebarLink href={'/events'} icon={GanttChartIcon} label="События" />
      <SidebarLink href={'/sessions'} icon={UsersIcon} label="Сессии" />
      <SidebarLink href={'/profiles'} icon={UserCircleIcon} label="Профили" />
      <SidebarLink href={'/groups'} icon={Building2Icon} label="Группы" />
      <SidebarLink href={'/cohorts'} icon={TargetIcon} label="Кохорты" />
      <div className="mt-4 mb-2 font-medium text-muted-foreground text-sm">
        Управление
      </div>
      <SidebarLink
        exact={false}
        href={'/settings'}
        icon={CogIcon}
        label="Настройки"
      />
      <SidebarLink href={'/references'} icon={GridIcon} label="Справочники" />
      <SidebarLink
        exact={false}
        href={'/notifications'}
        icon={BellIcon}
        label="Уведомления"
      />
      <SidebarLink
        exact={false}
        href={'/integrations'}
        icon={WorkflowIcon}
        label="Интеграции"
      />
      <SidebarLink href={'..'} icon={UndoDotIcon} label="Вернуться в рабочее пространство" />
    </>
  );
}

export function ActionCTAButton() {
  const navigate = useNavigate();
  const { openChatForContext } = useChatState();

  const ACTIONS = [
    {
      label: 'Создать отчёт',
      icon: ChartLineIcon,
      onClick: () =>
        navigate({
          to: '/$organizationId/$projectId/reports',
          from: '/$organizationId/$projectId',
        }),
    },
    {
      label: 'Создать справочник',
      icon: BookOpenIcon,
      onClick: () => pushModal('AddReference'),
    },
    {
      label: 'Спросить AI',
      icon: SparklesIcon,
      onClick: () => openChatForContext(),
    },
    {
      label: 'Создать дашборд',
      icon: LayoutDashboardIcon,
      onClick: () => pushModal('AddDashboard'),
    },
    {
      label: 'Создать правило уведомлений',
      icon: BellIcon,
      onClick: () =>
        navigate({
          to: '/$organizationId/$projectId/notifications/rules',
          from: '/$organizationId/$projectId',
        }),
    },
  ];

  const [currentActionIndex, setCurrentActionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActionIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % ACTIONS.length;
        if (nextIndex === 0 && prevIndex !== 0) {
          clearInterval(interval);
          return 0;
        }
        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'group flex w-full items-center gap-2 rounded-md border border-border bg-def-200 px-3 py-2 text-left',
              'text-[13px] font-medium text-foreground',
              'transition-colors hover:bg-def-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <PlusIcon className="size-5 shrink-0" />
            <div className="relative flex h-5 flex-1 items-center overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.span
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute whitespace-nowrap"
                  exit={{ y: -16, opacity: 0 }}
                  initial={{ y: 16, opacity: 0 }}
                  key={currentActionIndex}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    duration: 0.3,
                  }}
                >
                  {ACTIONS[currentActionIndex].label}
                </motion.span>
              </AnimatePresence>
            </div>
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {ACTIONS.map((action) => (
            <DropdownMenuItem
              className="cursor-pointer"
              key={action.label}
              onClick={action.onClick}
            >
              <action.icon className="mr-2 size-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
