import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { popModal } from '.';
import { ModalContent, ModalHeader } from './Modal/Container';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useTRPC } from '@/integrations/trpc/react';

export default function RegenerateRecoveryCodes() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [newCodes, setNewCodes] = useState<string[] | null>(null);

  const mutation = useMutation(
    trpc.auth.totpRegenerateRecoveryCodes.mutationOptions({
      onSuccess: (data) => {
        setNewCodes(data.recoveryCodes);
        queryClient.invalidateQueries(trpc.auth.totpStatus.pathFilter());
      },
      onError: (error) => {
        toast.error(error.message);
        setCode('');
      },
    })
  );

  if (newCodes) {
    return (
      <ModalContent>
        <ModalHeader
          text="Ваши старые коды восстановления больше недействительны."
          title="Новые коды восстановления"
        />
        <div className="col gap-2">
          <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-def-100 p-3 font-mono text-sm">
            {newCodes.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <Button
            className="self-start"
            onClick={() => {
              navigator.clipboard.writeText(newCodes.join('\n'));
              toast.success('Скопировано в буфер обмена');
            }}
            size="sm"
            variant="outline"
          >
            Копировать все
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={() => popModal()}>Готово</Button>
        </DialogFooter>
      </ModalContent>
    );
  }

  return (
    <ModalContent>
      <ModalHeader
        text="Введите код из приложения-аутентификатора, чтобы сгенерировать новый набор кодов восстановления."
        title="Перегенерация кодов восстановления"
      />
      <div className="col items-center gap-2">
        <InputOTP maxLength={6} onChange={setCode} value={code}>
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
      <DialogFooter>
        <Button onClick={() => popModal()} variant="secondary">
          Отмена
        </Button>
        <Button
          disabled={code.length !== 6}
          loading={mutation.isPending}
          onClick={() => mutation.mutate({ code })}
        >
          Сгенерировать заново
        </Button>
      </DialogFooter>
    </ModalContent>
  );
}
