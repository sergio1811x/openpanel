import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { handleError, useTRPC } from '@/integrations/trpc/react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { popModal } from '.';
import { ModalContent, ModalHeader } from './Modal/Container';

const CONFIRMATION = 'DELETE';

export default function ConfirmDeleteAccount() {
  const trpc = useTRPC();
  const [confirmation, setConfirmation] = useState('');

  const mutation = useMutation(
    trpc.user.delete.mutationOptions({
      onError: handleError,
      onSuccess: () => {
        toast.success('Ваш аккаунт удалён');
        // The session is now gone server-side; send the user back to the start.
        window.location.href = '/';
      },
    }),
  );

  const canDelete = confirmation.trim() === CONFIRMATION;

  return (
    <ModalContent>
      <ModalHeader
        title="Удаление аккаунта"
        text="Ваш аккаунт и все персональные данные будут безвозвратно удалены. Организации, которые Вы создали и в которых нет других администраторов, также будут удалены вместе с их проектами и событиями. Это действие нельзя отменить."
      />
      <div className="col gap-2">
        <label className="text-sm font-medium" htmlFor="confirm-delete-account">
          Введите <span className="font-bold">{CONFIRMATION}</span> для
          подтверждения
        </label>
        <Input
          autoComplete="off"
          autoFocus
          id="confirm-delete-account"
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder={CONFIRMATION}
          value={confirmation}
        />
      </div>
      <DialogFooter>
        <Button onClick={() => popModal()} variant="secondary">
          Отмена
        </Button>
        <Button
          disabled={!canDelete}
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
          variant="destructive"
        >
          Удалить аккаунт
        </Button>
      </DialogFooter>
    </ModalContent>
  );
}
