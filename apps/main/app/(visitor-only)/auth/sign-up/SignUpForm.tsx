'use client';

import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import NextLink from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { trpc } from '@mediature/main/client/trpcClient';
import { SignUpPrefillSchemaType, SignUpSchema, SignUpSchemaType } from '@mediature/main/models/actions/auth';

export function SignUpForm({ prefill }: { prefill?: SignUpPrefillSchemaType }) {
  const signUp = trpc.signUp.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: prefill,
  });

  const onSubmit = async (input: SignUpSchemaType) => {
    await signUp.mutateAsync(input);

    // TODO: success message? And/or redirect?
  };

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  return (
    <>
      <DevTool control={control} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField type="email" label="Email" {...register('email')} error={!!errors.email} helperText={errors?.email?.message} fullWidth />
        <TextField
          type="firstname"
          label="Prénom"
          {...register('firstname')}
          error={!!errors.firstname}
          helperText={errors?.firstname?.message}
          fullWidth
        />
        <TextField type="lastname" label="Nom" {...register('lastname')} error={!!errors.lastname} helperText={errors?.lastname?.message} fullWidth />
        <TextField
          type={showPassword ? 'text' : 'password'}
          label="Mot de passe"
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
        <FormControl error={!!errors.termsAccepted}>
          <FormControlLabel
            label={
              <span>
                J&apos;accepte les&nbsp;
                <Link href="/terms-of-use" variant="subtitle2" underline="hover">
                  conditions générales d&apos;utilisation
                </Link>
              </span>
            }
            control={<Checkbox {...register('termsAccepted')} defaultChecked={!!control._defaultValues.termsAccepted} />}
          />
          <FormHelperText>{errors?.termsAccepted?.message}</FormHelperText>
        </FormControl>
        <Button type="submit" size="large" sx={{ mt: 3 }} variant="contained" fullWidth>
          S&apos;enregistrer
        </Button>
        <Typography color="textSecondary" variant="body2">
          Vous possédez déjà un compte ?&nbsp;
          <Link component={NextLink} href="/auth/sign-in" variant="subtitle2" underline="hover">
            Se connecter
          </Link>
        </Typography>
      </form>
    </>
  );
}
