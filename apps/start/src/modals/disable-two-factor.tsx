import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { popModal } from '.';
import { ModalContent, ModalHeader } from './Modal/Container';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useTRPC } from '@/integrations/trpc/react';

export default function DisableTwoFactor() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');

  const mutation = useMutation(
    trpc.auth.totpDisable.mutationOptions({
      onSuccess: () => {
        toast.success('Двухфакторная аутентификация отключена');
        queryClient.invalidateQueries(trpc.auth.totpStatus.pathFilter());
        popModal();
      },
      onError: (error) => {
        toast.error(error.message);
        setCode('');
      },
    })
  );

  return (
    <ModalContent>
      <ModalHeader
        text="Введите код из приложения-аутентификатора или код восстановления для подтверждения."
        title="Отключение двухфакторной аутентификации"
      />
      <Input
        autoCapitalize="characters"
        autoFocus
        onChange={(e) => setCode(e.target.value)}
        placeholder="123456 or ABCDE-FGHIJ"
        value={code}
      />
      <DialogFooter>
        <Button onClick={() => popModal()} variant="secondary">
          Отмена
        </Button>
        <Button
          disabled={!code.trim()}
          loading={mutation.isPending}
          onClick={() => mutation.mutate({ code })}
          variant="destructive"
        >
          Отключить
        </Button>
      </DialogFooter>
    </ModalContent>
  );
}
