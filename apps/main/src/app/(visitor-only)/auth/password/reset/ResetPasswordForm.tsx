'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Button, Grid, IconButton, InputAdornment, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { BaseForm } from '@mediature/main/src/components/BaseForm';
import { ResetPasswordPrefillSchemaType, ResetPasswordSchema, ResetPasswordSchemaType } from '@mediature/main/src/models/actions/auth';

export function ResetPasswordForm({ prefill }: { prefill?: ResetPasswordPrefillSchemaType }) {
  const resetPassword = trpc.resetPassword.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: prefill,
  });

  const onSubmit = async (input: ResetPasswordSchemaType) => {
    await resetPassword.mutateAsync(input);

    // TODO: success message? And/or redirect?
  };

  // TODO: add condition if no token

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  return (
    <BaseForm onSubmit={handleSubmit(onSubmit)} control={control} ariaLabel="redéfinir son mot de passe">
      <Grid item xs={12}>
        <TextField
          type={showPassword ? 'text' : 'password'}
          label="Nouveau mot de passe"
          {...register('password')}
          error={!!errors.password}
          helperText={errors?.password?.message}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="changer la visibilité du mot de passe"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                >
                  {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Button type="submit" size="large" variant="contained" fullWidth>
          Mettre à jour
        </Button>
      </Grid>
    </BaseForm>
  );
}
