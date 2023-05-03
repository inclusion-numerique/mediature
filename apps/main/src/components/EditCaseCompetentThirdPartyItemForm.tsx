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
import {
  EditCaseCompetentThirdPartyItemPrefillSchemaType,
  EditCaseCompetentThirdPartyItemSchema,
  EditCaseCompetentThirdPartyItemSchemaType,
} from '@mediature/main/src/models/actions/case';
import { CaseCompetentThirdPartyItemSchemaType } from '@mediature/main/src/models/entities/case';

export interface EditCaseCompetentThirdPartyItemFormProps {
  availableParentItems: CaseCompetentThirdPartyItemSchemaType[];
  prefill?: EditCaseCompetentThirdPartyItemPrefillSchemaType;
  onSuccess?: () => void;
}

export function EditCaseCompetentThirdPartyItemForm(props: EditCaseCompetentThirdPartyItemFormProps) {
  const { t } = useTranslation('common');

  const editCaseCompetentThirdPartyItem = trpc.editCaseCompetentThirdPartyItem.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<EditCaseCompetentThirdPartyItemSchemaType>({
    resolver: zodResolver(EditCaseCompetentThirdPartyItemSchema),
    defaultValues: {
      parentId: null,
      ...props.prefill,
    },
  });

  const onSubmit = async (input: EditCaseCompetentThirdPartyItemSchemaType) => {
    const { item } = await editCaseCompetentThirdPartyItem.mutateAsync(input);

    props.onSuccess && props.onSuccess();
  };

  const sortedAvailableParentItems = useMemo(() => {
    return props.availableParentItems.sort((a, b) => a.name.localeCompare(b.name));
  }, [props.availableParentItems]);

  return (
    <BaseForm handleSubmit={handleSubmit} onSubmit={onSubmit} control={control} ariaLabel="éditer l'entité tierce compétente">
      <Grid item xs={12}>
        <TextField
          select
          label="Entité parent"
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
        <Button type="submit" loading={editCaseCompetentThirdPartyItem.isLoading} size="large" variant="contained" startIcon={<SaveIcon />} fullWidth>
          Sauvegarder
        </Button>
      </Grid>
    </BaseForm>
  );
}
