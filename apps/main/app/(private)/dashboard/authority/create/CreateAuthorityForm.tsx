'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import { Button, Grid, MenuItem, Select, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { trpc } from '@mediature/main/client/trpcClient';
import { BaseForm } from '@mediature/main/components/BaseForm';
import { CreateAuthorityPrefillSchemaType, CreateAuthoritySchema, CreateAuthoritySchemaType } from '@mediature/main/models/actions/authority';
import { AuthorityTypeSchema } from '@mediature/main/models/entities/authority';

export function CreateAuthorityForm({ prefill }: { prefill?: CreateAuthorityPrefillSchemaType }) {
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
    await createAuthority.mutateAsync(input);

    // TODO: success message? And/or redirect?
  };

  return (
    <BaseForm onSubmit={handleSubmit(onSubmit)}>
      {/* TODO: 2 columns, set logo on the right */}
      <input type="hidden" {...register('logoAttachmentId')} value="d58ac4a3-7672-403c-ad04-112f5927e2be"></input>
      <Grid item>
        <TextField
          select
          label="Type de collectivité"
          defaultValue={control._defaultValues.type || ''}
          inputProps={register('type')}
          error={!!errors.type}
          helperText={errors.type?.message}
          fullWidth
        >
          {Object.keys(AuthorityTypeSchema.Values).map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem> // TODO: should use i18n for proper display (instead of hard values)
          ))}
        </TextField>
      </Grid>
      <Grid item>
        <TextField type="name" label="Nom" {...register('name')} error={!!errors.name} helperText={errors?.name?.message} fullWidth />
      </Grid>
      <Grid item>
        <TextField
          type="slug"
          label="Identifiant technique (slug)"
          {...register('slug')}
          error={!!errors.slug}
          helperText={errors?.slug?.message}
          fullWidth
        />
      </Grid>
      <Grid item>
        <Button type="submit" size="large" variant="contained" startIcon={<SaveIcon />} fullWidth>
          Sauvegarder
        </Button>
      </Grid>
    </BaseForm>
  );
}
