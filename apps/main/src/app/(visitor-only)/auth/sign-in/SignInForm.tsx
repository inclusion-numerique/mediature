'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Button from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Mutex } from 'locks';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { BaseForm } from '@mediature/main/src/components/BaseForm';
import { ErrorAlert } from '@mediature/main/src/components/ErrorAlert';
import { SignInPrefillSchemaType, SignInSchema, SignInSchemaType } from '@mediature/main/src/models/actions/auth';
import {
  BusinessError,
  authCredentialsRequiredError,
  authFatalError,
  authNoCredentialsMatchError,
  authRetriableError,
} from '@mediature/main/src/models/entities/errors';
import { signIn } from '@mediature/main/src/proxies/next-auth/react';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

function errorCodeToError(errorCode: string): BusinessError | null {
  let error: BusinessError | null;

  switch (errorCode) {
    case authCredentialsRequiredError.code:
      error = authCredentialsRequiredError;
      break;
    case authNoCredentialsMatchError.code:
      error = authNoCredentialsMatchError;
      break;
    case 'undefined':
      error = null;
      break;
    default:
      error = authRetriableError;
      break;
  }

  return error;
}

export function SignInForm({ prefill }: { prefill?: SignInPrefillSchemaType }) {
  const { t } = useTranslation('common');
  const router = useRouter();

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const attemptErrorCode = searchParams.get('error');
  const loginHint = searchParams.get('login_hint');
  const sessionEnd = searchParams.has('session_end');
  const registered = searchParams.has('registered');

  const [showSessionEndBlock, setShowSessionEndBlock] = useState<boolean>(sessionEnd);
  const [showRegisteredBlock, setShowRegisteredBlock] = useState<boolean>(registered);

  const [error, setError] = useState<BusinessError | null>(() => {
    return attemptErrorCode ? errorCodeToError(attemptErrorCode) : null;
  });
  const [mutex] = useState<Mutex>(new Mutex());

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

  const enhancedHandleSubmit: typeof handleSubmit = (...args) => {
    // Hide messages set by any query parameter (we trying replacing the URL to remove them but it takes around 200ms, it was not smooth enough)
    setShowSessionEndBlock(false);
    setShowRegisteredBlock(false);

    return handleSubmit(...args);
  };

  const onSubmit = async ({ email, password, rememberMe }: any) => {
    // If it's already running, quit
    if (!mutex.tryLock()) {
      return;
    }

    try {
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
      } else if (result && result.ok) {
        setError(null);

        router.push(linkRegistry.get('dashboard', undefined));
      } else {
        setError(authFatalError);
      }
    } finally {
      // Unlock to allow a new submit
      mutex.unlock();
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  return (
    <BaseForm handleSubmit={enhancedHandleSubmit} onSubmit={onSubmit} control={control} ariaLabel="se connecter">
      {(!!error || showSessionEndBlock || showRegisteredBlock) && (
        <Grid item xs={12}>
          {!!error && <ErrorAlert errors={[error]} />}
          {showSessionEndBlock && <Alert severity="success">Vous avez bien été déconnecté</Alert>}
          {showRegisteredBlock && (
            <Alert severity="success">
              Votre inscription a bien été prise en compte. Vous pouvez dès à présent vous connecter pour accéder au tableau de bord.
            </Alert>
          )}
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
        <Button type="submit" loading={mutex.isLocked} size="large" variant="contained" fullWidth>
          Se connecter
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Typography color="textSecondary" variant="body2">
          <Link component={NextLink} href={linkRegistry.get('forgottenPassword', undefined)} variant="subtitle2" underline="none">
            Mot de passe oublié ?
          </Link>
        </Typography>
      </Grid>
    </BaseForm>
  );
}
