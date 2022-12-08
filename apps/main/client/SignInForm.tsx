'use client';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Button, IconButton, InputAdornment, Link, TextField, Typography } from '@mui/material';
import NextLink from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { trpc } from '@mediature/main/client/trpcClient';

export function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>();

  // For test
  trpc.greeting.useQuery();

  const onSubmit = async ({ email }: any) => {};

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField type="email" name="email" label="Email" {...register('email')} fullWidth />
      <TextField
        type={showPassword ? 'text' : 'password'}
        name="password"
        label="Password"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button onClick={onSubmit} size="large" sx={{ mt: 3 }} variant="contained" fullWidth>
        Se connecter
      </Button>
      <Typography color="textSecondary" variant="body2">
        <Link component={NextLink} href="/auth/password/retrieve" variant="subtitle2" underline="hover">
          Mot de passe oublié ?
        </Link>
      </Typography>
    </form>
  );
}
