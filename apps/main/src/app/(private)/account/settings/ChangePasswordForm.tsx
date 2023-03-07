'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Button from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { BaseForm } from '@mediature/main/src/components/BaseForm';
import { ChangePasswordPrefillSchemaType, ChangePasswordSchema, ChangePasswordSchemaType } from '@mediature/main/src/models/actions/auth';

export interface ChangePasswordFormProps {
  prefill?: ChangePasswordPrefillSchemaType;
  onSuccess?: () => void;
}

export function ChangePasswordForm(props: ChangePasswordFormProps) {
  const changePassword = trpc.changePassword.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: props.prefill,
  });

  const onSubmit = async (input: ChangePasswordSchemaType) => {
    await changePassword.mutateAsync(input);

    reset();

    if (props.onSuccess) {
      props.onSuccess();
    }
  };

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const handleClickShowCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
  const handleMouseDownShowCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const handleClickShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const handleMouseDownShowNewPassword = () => setShowNewPassword(!showNewPassword);

  return (
    <BaseForm handleSubmit={handleSubmit} onSubmit={onSubmit} control={control} ariaLabel="changer son mot de passe">
      <Grid item xs={12}>
        <TextField
          type={showCurrentPassword ? 'text' : 'password'}
          label="Mot de passe actuel"
          {...register('currentPassword')}
          error={!!errors.currentPassword}
          helperText={errors?.currentPassword?.message}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="changer la visibilité du mot de passe"
                  onClick={handleClickShowCurrentPassword}
                  onMouseDown={handleMouseDownShowCurrentPassword}
                >
                  {showCurrentPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          type={showNewPassword ? 'text' : 'password'}
          label="Nouveau mot de passe"
          {...register('newPassword')}
          error={!!errors.newPassword}
          helperText={errors?.newPassword?.message}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="changer la visibilité du mot de passe"
                  onClick={handleClickShowNewPassword}
                  onMouseDown={handleMouseDownShowNewPassword}
                >
                  {showNewPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Button type="submit" loading={changePassword.isLoading} size="large" variant="contained" fullWidth>
          Changer
        </Button>
      </Grid>
    </BaseForm>
  );
}
