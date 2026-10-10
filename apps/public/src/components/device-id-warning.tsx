import { Callout } from 'fumadocs-ui/components/callout';
import Link from 'next/link';

export function DeviceIdWarning() {
  return (
    <Callout>
      Подробнее о{' '}
      <Link href="/docs/device-id">device id и о том, зачем он может понадобиться</Link>.
      **Мы не рекомендуем его использовать, но решать вам.**
    </Callout>
  );
}
