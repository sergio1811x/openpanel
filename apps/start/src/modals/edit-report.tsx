import { ButtonContainer } from '@/components/button-container';
import { InputWithLabel } from '@/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { popModal } from '.';
import { ModalContent, ModalHeader } from './Modal/Container';

const validator = z.object({
  name: z.string().min(1),
});

type IForm = z.infer<typeof validator>;

type EditReportProps = {
  form: IForm;
  onSubmit: SubmitHandler<IForm>;
};

export default function EditReport({ form, onSubmit }: EditReportProps) {
  const { register, handleSubmit, formState } = useForm<IForm>({
    resolver: zodResolver(validator),
    defaultValues: form,
  });

  return (
    <ModalContent>
      <ModalHeader title="Изменение отчёта" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputWithLabel label="Название" placeholder="Название" {...register('name')} />
        <ButtonContainer>
          <Button type="button" variant="outline" onClick={() => popModal()}>
            Отмена
          </Button>
          <Button type="submit" disabled={!formState.isDirty}>
            Обновить
          </Button>
        </ButtonContainer>
      </form>
    </ModalContent>
  );
}
