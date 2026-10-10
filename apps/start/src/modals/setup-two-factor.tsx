import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DownloadIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { popModal } from '.';
import { ModalContent, ModalHeader } from './Modal/Container';
import CopyInput from '@/components/forms/copy-input';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { handleError, useTRPC } from '@/integrations/trpc/react';

export default function SetupTwoFactor() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'scan' | 'recovery'>('scan');
  const [code, setCode] = useState('');
  const [setupData, setSetupData] = useState<{
    qrDataUrl: string;
    secret: string;
  } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const setupMutation = useMutation(
    trpc.auth.totpSetup.mutationOptions({
      onSuccess: (data) => {
        setSetupData({ qrDataUrl: data.qrDataUrl, secret: data.secret });
      },
      onError: handleError,
    })
  );

  const enableMutation = useMutation(
    trpc.auth.totpEnable.mutationOptions({
      onSuccess: (data) => {
        setRecoveryCodes(data.recoveryCodes);
        setStep('recovery');
        queryClient.invalidateQueries(trpc.auth.totpStatus.pathFilter());
      },
      onError: (error) => {
        toast.error(error.message);
        setCode('');
      },
    })
  );

  useEffect(() => {
    setupMutation.mutate();
  }, []);

  if (step === 'recovery') {
    return (
      <ModalContent>
        <ModalHeader
          text="Сохраните их в надёжном месте. Каждый код можно использовать один раз, если Вы потеряете доступ к аутентификатору. Больше Вы их не увидите."
          title="Сохраните коды восстановления"
        />
        <RecoveryCodesBlock codes={recoveryCodes} />
        <DialogFooter>
          <Button onClick={() => popModal()}>Коды сохранены</Button>
        </DialogFooter>
      </ModalContent>
    );
  }

  return (
    <ModalContent>
      <ModalHeader
        text="Отсканируйте QR-код в приложении-аутентификаторе, затем введите 6-значный код для включения."
        title="Настройка двухфакторной аутентификации"
      />

      {setupMutation.isPending || !setupData ? (
        <div className="center-center min-h-[260px]">
          <span className="text-muted-foreground text-sm">
            Генерация секрета…
          </span>
        </div>
      ) : (
        <div className="col gap-4">
          <img
            alt="QR-код аутентификатора"
            className="rounded-md border border-border"
            height={240}
            src={setupData.qrDataUrl}
            width={240}
          />
          <CopyInput
            className="w-full"
            label="Не сканируется? Введите секрет вручную"
            value={setupData.secret}
          />
          <div className="col w-full gap-2">
            <Label className="mb-1">Код подтверждения</Label>
            <InputOTP
              disabled={enableMutation.isPending}
              maxLength={6}
              onChange={setCode}
              value={code}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button onClick={() => popModal()} variant="secondary">
          Отмена
        </Button>
        <Button
          disabled={code.length !== 6}
          loading={enableMutation.isPending}
          onClick={() => enableMutation.mutate({ code })}
        >
          Включить
        </Button>
      </DialogFooter>
    </ModalContent>
  );
}

function RecoveryCodesBlock({ codes }: { codes: string[] }) {
  return (
    <div className="col gap-2">
      <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-def-100 p-3 font-mono text-sm">
        {codes.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      <div className="row gap-2">
        <Button
          className="self-start"
          icon={DownloadIcon}
          onClick={() => {
            const blob = new Blob([codes.join('\n')], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'recovery-codes.txt';
            a.click();
            URL.revokeObjectURL(url);
          }}
          size="sm"
          variant="outline"
        >
          Скачать
        </Button>
        <Button
          className="self-start"
          onClick={() => {
            navigator.clipboard.writeText(codes.join('\n'));
            toast.success('Скопировано в буфер обмена');
          }}
          size="sm"
          variant="outline"
        >
          Копировать все
        </Button>
      </div>
    </div>
  );
}
