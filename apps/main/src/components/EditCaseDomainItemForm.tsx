'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import Button from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { BaseForm } from '@mediature/main/src/components/BaseForm';
import { EditCaseDomainItemPrefillSchemaType, EditCaseDomainItemSchema, EditCaseDomainItemSchemaType } from '@mediature/main/src/models/actions/case';
import { CaseDomainItemSchemaType } from '@mediature/main/src/models/entities/case';

export interface EditCaseDomainItemFormProps {
  availableParentItems: CaseDomainItemSchemaType[];
  prefill?: EditCaseDomainItemPrefillSchemaType;
  onSuccess?: () => void;
}

export function EditCaseDomainItemForm(props: EditCaseDomainItemFormProps) {
  const { t } = useTranslation('common');

  const editCaseDomainItem = trpc.editCaseDomainItem.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<EditCaseDomainItemSchemaType>({
    resolver: zodResolver(EditCaseDomainItemSchema),
    defaultValues: {
      parentId: null,
      ...props.prefill,
    },
  });

  const onSubmit = async (input: EditCaseDomainItemSchemaType) => {
    const { item } = await editCaseDomainItem.mutateAsync(input);

    props.onSuccess && props.onSuccess();
  };

  const sortedAvailableParentItems = useMemo(() => {
    return props.availableParentItems.sort((a, b) => a.name.localeCompare(b.name));
  }, [props.availableParentItems]);

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
          {sortedAvailableParentItems.map((availableParentItem) => (
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
        <Button type="submit" loading={editCaseDomainItem.isLoading} size="large" variant="contained" startIcon={<SaveIcon />} fullWidth>
          Sauvegarder
        </Button>
      </Grid>
    </BaseForm>
  );
}
