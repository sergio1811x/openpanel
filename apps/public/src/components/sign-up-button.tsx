import Link from 'next/link';
import { Button } from './ui/button';

export function SignUpButton() {
  return (
    <Button asChild>
      <Link className="hidden md:flex" href="/login">
        Регистрация
      </Link>
    </Button>
  );
}
