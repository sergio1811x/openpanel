import { clipboard } from '@/utils/clipboard';
import { toast } from 'sonner';

import { Tooltiper } from './ui/tooltip';

type Props = {
  children: React.ReactNode;
  className?: string;
  value: string;
};

const ClickToCopy = ({ children, value }: Props) => {
  return (
    <Tooltiper
      content="Нажмите, чтобы скопировать"
      asChild
      className="cursor-pointer"
      onClick={() => {
        clipboard(value);
        toast('Скопировано!');
      }}
    >
      {children}
    </Tooltiper>
  );
};

export default ClickToCopy;
