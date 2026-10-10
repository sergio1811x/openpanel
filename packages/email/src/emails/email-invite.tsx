import { Button, Link, Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Layout } from '../components/layout';

export const zEmailInvite = z.object({
  url: z.string(),
  organizationName: z.string(),
});

export type Props = z.infer<typeof zEmailInvite>;
export default EmailInvite;
export function EmailInvite({
  organizationName = 'Acme Co',
  url = 'https://openpanel.dev',
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Вас пригласили присоединиться к организации {organizationName}!</Text>
      <Text>
        Если у Вас ещё нет аккаунта, нажмите кнопку ниже, чтобы создать его и
        присоединиться к организации:
      </Text>
      <Button
        href={url}
        style={{
          backgroundColor: '#000',
          borderRadius: '6px',
          color: '#fff',
          padding: '12px 20px',
          textDecoration: 'none',
        }}
      >
        Присоединиться к {organizationName}
      </Button>
      <Text>
        Ссылка для присоединения: <Link href={url}>{url}</Link>
      </Text>
      <Text style={{ color: '#666' }}>
        Уже есть аккаунт? Ничего делать не нужно — доступ появится
        автоматически после входа.
      </Text>
    </Layout>
  );
}
