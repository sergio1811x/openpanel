import { Button, Link, Text } from '@react-email/components';
import React from 'react';
import { z } from 'zod';
import { Layout } from '../components/layout';

export const zEmailResetPassword = z.object({
  url: z.string(),
});

export type Props = z.infer<typeof zEmailResetPassword>;
export default EmailResetPassword;
export function EmailResetPassword({
  url = 'https://openpanel.dev',
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>
        Вы запросили сброс пароля. Перейдите по ссылке ниже, чтобы сбросить
        пароль:
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
        Сброс пароля
      </Button>
      <Text>
        Ссылка для сброса пароля: <Link href={url}>{url}</Link>
      </Text>
      <Text style={{ color: '#666' }}>
        Не запрашивали сброс пароля? Просто проигнорируйте это письмо, а если
        считаете, что это ошибка, обратитесь в поддержку.
      </Text>
    </Layout>
  );
}
