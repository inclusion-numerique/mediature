'use client';

import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Alert,
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
import { signIn } from 'next-auth/react';
import NextLink from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { SignInSchema, SignInSchemaType } from '@mediature/main/models/actions/auth';

function errorCodeToError(errorCode: string): string {
  let error: string;

  switch (errorCode) {
    case 'credentials_required':
      error = 'Vous devez fournir vos informations de connexion pour poursuivre';
      break;
    case 'no_credentials_match':
      error = 'Les informations de connexion fournies sont incorrectes';
      break;
    default:
      error = 'Une erreur est survenue, veuillez retenter';
      break;
  }

  return error;
}

export function SignInForm() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const attemptErrorCode = searchParams.get('error');
  const loginHint = searchParams.get('login_hint');
  const sessionEnd = searchParams.has('session_end');

  const [error, setError] = useState<string | null>(() => {
    return attemptErrorCode ? errorCodeToError(attemptErrorCode) : null;
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: loginHint ?? undefined,
    },
  });

  const onSubmit = async ({ email, password, rememberMe }: any) => {
    // TODO: should remove the "session_end" from the URL... or to be simpler the logout page should be elsewhere?

    const result = await signIn(
      'credentials',
      {
        redirect: false,
        callbackUrl: callbackUrl || undefined,
        email,
        password,
      },
      {
        prompt: rememberMe === true ? 'none' : 'login',
        login_hint: email,
      }
    );

    if (result && !result.ok && result.error) {
      setError(errorCodeToError(result.error));
    } else if (result && result.ok && result.url) {
      setError(null);

      router.push(result.url);
    } else {
      setError('default');
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  return (
    <>
      {/* <DevTool control={control} /> */}

      <form onSubmit={handleSubmit(onSubmit)}>
        {!!error && <Alert severity="error">{error}</Alert>}
        {!!sessionEnd && <Alert severity="success">Vous avez bien été déconnecté</Alert>}
        <TextField type="email" label="Email" {...register('email')} error={!!errors.email} helperText={errors?.email?.message} fullWidth />
        <TextField
          type={showPassword ? 'text' : 'password'}
          label="Password"
          {...register('password')}
          error={!!errors.password}
          helperText={errors?.password?.message}
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
        <FormControl error={!!errors.rememberMe}>
          <FormControlLabel label="Rester connecté" control={<Checkbox {...register('rememberMe')} defaultChecked />} />
          <FormHelperText>{errors?.rememberMe?.message}</FormHelperText>
        </FormControl>
        <Button type="submit" size="large" sx={{ mt: 3 }} variant="contained" fullWidth>
          Se connecter
        </Button>
        <Typography color="textSecondary" variant="body2">
          <Link component={NextLink} href="/auth/password/retrieve" variant="subtitle2" underline="hover">
            Mot de passe oublié ?
          </Link>
        </Typography>
      </form>
    </>
  );
}
