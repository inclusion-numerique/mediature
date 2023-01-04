'use client';

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
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { BaseForm } from '@mediature/main/components/BaseForm';
import { SignInPrefillSchemaType, SignInSchema, SignInSchemaType } from '@mediature/main/models/actions/auth';
import { signIn } from '@mediature/main/proxies/next-auth/react';

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

export function SignInForm({ prefill }: { prefill?: SignInPrefillSchemaType }) {
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
    control,
  } = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: prefill ?? {
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
    <BaseForm onSubmit={handleSubmit(onSubmit)}>
      {(!!error || !!sessionEnd) && (
        <Grid item xs={12}>
          {!!error && <Alert severity="error">{error}</Alert>}
          {!!sessionEnd && <Alert severity="success">Vous avez bien été déconnecté</Alert>}
        </Grid>
      )}
      <Grid item xs={12}>
        <TextField type="email" label="Email" {...register('email')} error={!!errors.email} helperText={errors?.email?.message} fullWidth />
      </Grid>
      <Grid item xs={12}>
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
      </Grid>
      <Grid item xs={12}>
        <FormControl error={!!errors.rememberMe}>
          {/* TODO: really manage "rememberMe" */}
          <FormControlLabel label="Rester connecté" control={<Checkbox {...register('rememberMe')} defaultChecked />} />
          <FormHelperText>{errors?.rememberMe?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Button type="submit" size="large" variant="contained" fullWidth>
          Se connecter
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Typography color="textSecondary" variant="body2">
          <Link component={NextLink} href="/auth/password/retrieve" variant="subtitle2" underline="none">
            Mot de passe oublié ?
          </Link>
        </Typography>
      </Grid>
    </BaseForm>
  );
}
