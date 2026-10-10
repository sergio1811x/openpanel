import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export function GetStartedButton({
  text,
  href = '/login',
  className,
}: {
  text?: React.ReactNode;
  className?: string;
  href?: string;
}) {
  return (
    <Button asChild className={cn('group', className)} size="lg">
      <Link href={href}>
        {text ?? 'Начать бесплатный период'}
        <ChevronRightIcon className="size-4 transition-transform group-hover:translate-x-1 group-hover:scale-125" />
      </Link>
    </Button>
  );
}
