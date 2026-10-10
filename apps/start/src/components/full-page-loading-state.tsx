import type { LucideIcon } from 'lucide-react';
import { Loader2Icon } from 'lucide-react';

import { FullPageEmptyState } from './full-page-empty-state';

const FullPageLoadingState = ({
  title = 'Загрузка...',
  description = 'Пожалуйста, подождите, пока мы получим данные...',
}: { title?: string; description?: string }) => {
  return (
    <FullPageEmptyState
      className="min-h-[calc(100vh-theme(spacing.16))]"
      title={title}
      description={description}
      icon={
        ((props) => (
          <Loader2Icon {...props} className="animate-spin" />
        )) as LucideIcon
      }
    />
  );
};

export default FullPageLoadingState;
