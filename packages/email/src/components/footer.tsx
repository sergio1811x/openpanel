import {
  Column,
  Hr,
  Img,
  Link,
  Row,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

const baseUrl = 'https://openpanel.dev';

export function Footer({ unsubscribeUrl }: { unsubscribeUrl?: string }) {
  return (
    <>
      <Hr />
      <Section className="w-full p-6">
        <Text className="text-[21px] font-regular" style={{ margin: 0 }}>
          Альтернатива Mixpanel с открытым исходным кодом
        </Text>

        <br />

        <Row className="mt-4">
          <Column className="w-8">
            <Link href="#">
              <Img
                src={`${baseUrl}/icons/github.png`}
                width="22"
                height="22"
                alt="Openpanel RU на GitHub"
              />
            </Link>
          </Column>
          <Column className="w-8">
            <Link href="#">
              <Img
                src={`${baseUrl}/icons/x.png`}
                width="22"
                height="22"
                alt="Openpanel RU на X"
              />
            </Link>
          </Column>
          <Column className="w-8">
            <Link href="#">
              <Img
                src={`${baseUrl}/icons/discord.png`}
                width="22"
                height="22"
                alt="Openpanel RU на Discord"
              />
            </Link>
          </Column>
          <Column className="w-auto">
            <Link href="#">
              <Img
                src={`${baseUrl}/icons/email.png`}
                width="22"
                height="22"
                alt="Связаться с Openpanel RU по email"
              />
            </Link>
          </Column>
        </Row>

        <Row>
          <Text className="text-[#B8B8B8] text-xs">
            Openpanel RU
          </Text>
        </Row>

        {unsubscribeUrl && (
          <Row>
            <Link
              className="text-[#707070] text-[14px]"
              href={unsubscribeUrl}
              title="Отписаться"
            >
              Настройки уведомлений
            </Link>
          </Row>
        )}
      </Section>
    </>
  );
}
