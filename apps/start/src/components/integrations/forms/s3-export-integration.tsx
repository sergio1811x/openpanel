import { InputWithLabel } from '@/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppParams } from '@/hooks/use-app-params';
import { useTRPC } from '@/integrations/trpc/react';
import type { RouterOutputs } from '@/trpc/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { zCreateS3ExportIntegration } from '@openpanel/validation';
import { useMutation } from '@tanstack/react-query';
import { path, mergeDeepRight } from 'ramda';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type IForm = z.infer<typeof zCreateS3ExportIntegration>;

const AWS_REGIONS = [
  'auto',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'eu-north-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'sa-east-1',
];

export function S3ExportIntegrationForm({
  defaultValues,
  onSuccess,
}: {
  defaultValues?: RouterOutputs['integration']['get'];
  onSuccess: () => void;
}) {
  const { projectId } = useAppParams();
  const form = useForm<IForm>({
    defaultValues: mergeDeepRight(
      {
        id: defaultValues?.id,
        projectId,
        name: '',
        config: {
          type: 's3_export' as const,
          bucket: '',
          prefix: 'openpanel-exports',
          region: 'us-east-1',
          format: 'jsonl_gzip' as const,
          authMode: 'iam_role' as const,
          roleArn: '',
          externalId: '',
          encryption: 'SSE-S3' as const,
          kmsKeyId: '',
        },
      },
      defaultValues ?? {},
    ),
    resolver: zodResolver(zCreateS3ExportIntegration),
  });
  const trpc = useTRPC();
  const mutation = useMutation(
    trpc.integration.createOrUpdateExport.mutationOptions({
      onSuccess,
      onError(error) {
        toast.error(error.message || 'Не удалось создать интеграцию');
      },
    }),
  );

  const testMutation = useMutation(
    trpc.integration.testExportConnection.mutationOptions({
      onSuccess(data) {
        if (data.success) {
          toast.success('Подключение успешно! Бакет доступен.');
        } else {
          toast.error(`Ошибка подключения: ${data.error}`);
        }
      },
      onError(error) {
        toast.error(error.message || 'Не удалось проверить подключение');
      },
    }),
  );

  const authMode = useWatch({ control: form.control, name: 'config.authMode' });
  const encryption = useWatch({ control: form.control, name: 'config.encryption' });

  const handleSubmit = (values: IForm) => {
    mutation.mutate(values);
  };

  const handleError = () => {
    toast.error('Исправьте ошибки валидации');
  };

  const handleTest = () => {
    const values = form.getValues();
    if (!values.config.bucket || !values.config.region) {
      return toast.error('Не указаны бакет и регион');
    }
    if (values.config.authMode === 'iam_role' && !values.config.roleArn) {
      return toast.error('Не указан IAM Role ARN');
    }
    if (values.config.authMode === 'access_key') {
      if (!values.config.accessKeyId || !values.config.secretAccessKey) {
        return toast.error('Не указаны Access Key ID и Secret Access Key');
      }
    }
    testMutation.mutate(values);
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit, handleError)}
      className="col gap-4"
    >
      <InputWithLabel
        label="Название"
        placeholder="Например, S3-экспорт продакшена"
        {...form.register('name')}
        error={form.formState.errors.name?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <InputWithLabel
          label="S3-бакет"
          placeholder="my-analytics-bucket"
          {...form.register('config.bucket')}
          error={path(['config', 'bucket', 'message'], form.formState.errors)}
        />
        <InputWithLabel
          label="Префикс"
          placeholder="openpanel-exports"
          {...form.register('config.prefix')}
          error={path(['config', 'prefix', 'message'], form.formState.errors)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col gap-1.5">
          <label className="text-sm font-medium">Регион</label>
          <Controller
            name="config.region"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите регион" />
                </SelectTrigger>
                <SelectContent>
                  {AWS_REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="col gap-1.5">
          <label className="text-sm font-medium">Формат</label>
          <Controller
            name="config.format"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите формат" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jsonl_gzip">JSONL (gzip)</SelectItem>
                  <SelectItem value="parquet" disabled>
                    Parquet (скоро)
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Auth Mode Selector */}
      <div className="col gap-1.5">
        <label className="text-sm font-medium">Режим аутентификации</label>
        <Controller
          name="config.authMode"
          control={form.control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите режим аутентификации" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iam_role">IAM-роль (AWS)</SelectItem>
                <SelectItem value="access_key">Ключи доступа (R2, MinIO, Spaces)</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-muted-foreground text-xs">
          {authMode === 'iam_role'
            ? 'Рекомендуется для AWS S3. Создайте IAM-роль, предоставляющую Openpanel RU доступ.'
            : 'Используйте ключи доступа для Cloudflare R2, MinIO, DigitalOcean Spaces или другого S3-совместимого хранилища.'}
        </p>
      </div>

      {/* IAM Role fields */}
      {authMode === 'iam_role' && (
        <>
          <InputWithLabel
            label="IAM Role ARN"
            placeholder="arn:aws:iam::123456789012:role/OpenpanelRUExportRole"
            {...form.register('config.roleArn')}
            error={path(['config', 'roleArn', 'message'], form.formState.errors)}
          />

          <InputWithLabel
            label="Внешний ID (необязательно)"
            placeholder="Необязательный внешний ID для доступа между аккаунтами"
            {...form.register('config.externalId')}
            error={path(['config', 'externalId', 'message'], form.formState.errors)}
          />
        </>
      )}

      {/* Access Key fields */}
      {authMode === 'access_key' && (
        <>
          <InputWithLabel
            label="URL эндпоинта (необязательно)"
            placeholder="https://your-account-id.r2.cloudflarestorage.com"
            {...form.register('config.endpoint')}
            error={path(['config', 'endpoint', 'message'], form.formState.errors)}
          />
          <p className="text-muted-foreground -mt-2 text-xs">
            Требуется для R2, MinIO и т.д. Для AWS S3 оставьте пустым.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <InputWithLabel
              label="Access Key ID"
              placeholder="AKIAIOSFODNN7EXAMPLE"
              {...form.register('config.accessKeyId')}
              error={path(['config', 'accessKeyId', 'message'], form.formState.errors)}
            />
            <InputWithLabel
              label="Secret Access Key"
              type="password"
              placeholder={
                defaultValues?.id
                  ? 'Оставьте пустым, чтобы сохранить текущий ключ'
                  : 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
              }
              // Stored secrets are never sent back to the browser, so an edit
              // starts blank and blank means "keep the stored key".
              {...form.register('config.secretAccessKey')}
              error={path(['config', 'secretAccessKey', 'message'], form.formState.errors)}
            />
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col gap-1.5">
          <label className="text-sm font-medium">Шифрование</label>
          <Controller
            name="config.encryption"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите шифрование" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SSE-S3">SSE-S3 (AES-256)</SelectItem>
                  <SelectItem value="SSE-KMS">SSE-KMS</SelectItem>
                  <SelectItem value="none">Нет</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {encryption === 'SSE-KMS' && (
          <InputWithLabel
            label="KMS Key ID"
            placeholder="arn:aws:kms:us-east-1:..."
            {...form.register('config.kmsKeyId')}
            error={path(
              ['config', 'kmsKeyId', 'message'],
              form.formState.errors,
            )}
          />
        )}
      </div>

      <div className="row gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleTest}
          disabled={testMutation.isPending}
        >
          {testMutation.isPending ? 'Проверка...' : 'Проверить подключение'}
        </Button>
        <Button type="submit" className="flex-1" disabled={mutation.isPending}>
          {mutation.isPending
            ? 'Сохранение...'
            : defaultValues?.id
              ? 'Обновить'
              : 'Создать'}
        </Button>
      </div>
    </form>
  );
}
