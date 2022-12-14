'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Grid, Link, TextField, Typography } from '@mui/material';
import NextLink from 'next/link';
import React from 'react';
import { useForm } from 'react-hook-form';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { BaseForm } from '@mediature/main/src/components/BaseForm';
import { RequestNewPasswordPrefillSchemaType, RequestNewPasswordSchema, RequestNewPasswordSchemaType } from '@mediature/main/src/models/actions/auth';

export function RetrievePasswordForm({ prefill }: { prefill?: RequestNewPasswordPrefillSchemaType }) {
  const requestNewPassword = trpc.requestNewPassword.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<RequestNewPasswordSchemaType>({
    resolver: zodResolver(RequestNewPasswordSchema),
    defaultValues: prefill,
  });

  const onSubmit = async (input: RequestNewPasswordSchemaType) => {
    await requestNewPassword.mutateAsync(input);

    // TODO: success message? And/or redirect?
  };

  return (
    <BaseForm onSubmit={handleSubmit(onSubmit)} control={control}>
      <Grid item xs={12}>
        <TextField type="email" label="Email" {...register('email')} error={!!errors.email} helperText={errors?.email?.message} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <Button type="submit" size="large" variant="contained" fullWidth>
          Valider
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Typography color="textSecondary" variant="body2">
          <Link component={NextLink} href="/auth/sign-in" variant="subtitle2" underline="none">
            Retourner à la page de connexion
          </Link>
        </Typography>
      </Grid>
    </BaseForm>
  );
}
