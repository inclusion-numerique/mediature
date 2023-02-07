'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import { Button, Grid, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { BaseForm } from '@mediature/main/src/components/BaseForm';
import { CreateAuthorityPrefillSchemaType, CreateAuthoritySchema, CreateAuthoritySchemaType } from '@mediature/main/src/models/actions/authority';
import { AuthorityTypeSchema } from '@mediature/main/src/models/entities/authority';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

export function CreateAuthorityForm({ prefill }: { prefill?: CreateAuthorityPrefillSchemaType }) {
  const { t } = useTranslation('common');
  const router = useRouter();

  const createAuthority = trpc.createAuthority.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateAuthoritySchemaType>({
    resolver: zodResolver(CreateAuthoritySchema),
    defaultValues: prefill,
  });

  const onSubmit = async (input: CreateAuthoritySchemaType) => {
    const result = await createAuthority.mutateAsync(input);

    router.push(linkRegistry.get('authorityList', undefined));
  };

  return (
    <BaseForm handleSubmit={handleSubmit} onSubmit={onSubmit} control={control} ariaLabel="créer une collectivité">
      {/* TODO: 2 columns, set logo on the right */}
      <input type="hidden" {...register('logoAttachmentId')} value="d58ac4a3-7672-403c-ad04-112f5927e2be"></input>
      <Grid item xs={12}>
        <TextField
          select
          label="Type de collectivité"
          defaultValue={control._defaultValues.type || ''}
          inputProps={register('type')}
          error={!!errors.type}
          helperText={errors.type?.message}
          fullWidth
        >
          {Object.values(AuthorityTypeSchema.Values).map((type) => (
            <MenuItem key={type} value={type}>
              {t(`model.authority.type.enum.${type}`)}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <TextField type="name" label="Nom" {...register('name')} error={!!errors.name} helperText={errors?.name?.message} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <TextField
          type="slug"
          label="Identifiant technique (slug)"
          {...register('slug')}
          error={!!errors.slug}
          helperText={errors?.slug?.message}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Button type="submit" size="large" variant="contained" startIcon={<SaveIcon />} fullWidth>
          Sauvegarder
        </Button>
      </Grid>
    </BaseForm>
  );
}
