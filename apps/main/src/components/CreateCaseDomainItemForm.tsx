'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import Button from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { BaseForm } from '@mediature/main/src/components/BaseForm';
import {
  CreateCaseDomainItemPrefillSchemaType,
  CreateCaseDomainItemSchema,
  CreateCaseDomainItemSchemaType,
} from '@mediature/main/src/models/actions/case';
import { CaseDomainItemSchemaType } from '@mediature/main/src/models/entities/case';

export interface CreateCaseDomainItemFormProps {
  availableParentItems: CaseDomainItemSchemaType[];
  prefill?: CreateCaseDomainItemPrefillSchemaType;
  onSuccess?: () => void;
}

export function CreateCaseDomainItemForm(props: CreateCaseDomainItemFormProps) {
  const { t } = useTranslation('common');

  const createCaseDomainItem = trpc.createCaseDomainItem.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<CreateCaseDomainItemSchemaType>({
    resolver: zodResolver(CreateCaseDomainItemSchema),
    defaultValues: {
      authorityId: null,
      parentId: null,
      ...props.prefill,
    },
  });

  const onSubmit = async (input: CreateCaseDomainItemSchemaType) => {
    const { item } = await createCaseDomainItem.mutateAsync(input);

    props.onSuccess && props.onSuccess();
  };

  return (
    <BaseForm handleSubmit={handleSubmit} onSubmit={onSubmit} control={control} ariaLabel="créer une domaine">
      <Grid item xs={12}>
        <TextField
          select
          label="Domaine parent"
          defaultValue={control._defaultValues.parentId || ''}
          onChange={(event) => {
            if (event.target.value === '') {
              setValue('parentId', null);
            } else {
              setValue('parentId', event.target.value);
            }
          }}
          error={!!errors.parentId}
          helperText={errors.parentId?.message}
          fullWidth
        >
          <MenuItem value="">
            <em>Aucun</em>
          </MenuItem>
          {props.availableParentItems.map((availableParentItem) => (
            <MenuItem key={availableParentItem.id} value={availableParentItem.id}>
              {availableParentItem.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <TextField type="name" label="Nom" {...register('name')} error={!!errors.name} helperText={errors?.name?.message} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <Button type="submit" loading={createCaseDomainItem.isLoading} size="large" variant="contained" startIcon={<SaveIcon />} fullWidth>
          Sauvegarder
        </Button>
      </Grid>
    </BaseForm>
  );
}
