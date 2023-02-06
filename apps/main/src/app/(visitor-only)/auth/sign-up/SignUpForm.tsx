'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
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
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { BaseForm } from '@mediature/main/src/components/BaseForm';
import { SignUpPrefillSchemaType, SignUpSchema, SignUpSchemaType } from '@mediature/main/src/models/actions/auth';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

export function SignUpForm({ prefill }: { prefill?: SignUpPrefillSchemaType }) {
  const router = useRouter();

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

    router.push(linkRegistry.get('signIn', undefined));
  };

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  return (
    <BaseForm handleSubmit={handleSubmit} onSubmit={onSubmit} control={control} ariaLabel="s'inscrire">
      <Grid item xs={12}>
        <TextField type="email" label="Email" {...register('email')} error={!!errors.email} helperText={errors?.email?.message} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <TextField
          type="firstname"
          label="Prénom"
          {...register('firstname')}
          error={!!errors.firstname}
          helperText={errors?.firstname?.message}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField type="lastname" label="Nom" {...register('lastname')} error={!!errors.lastname} helperText={errors?.lastname?.message} fullWidth />
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
        <FormControl error={!!errors.termsAccepted}>
          <FormControlLabel
            label={
              <span>
                J&apos;accepte les&nbsp;
                <Link href={linkRegistry.get('termsOfUse', undefined)} variant="subtitle2" underline="none">
                  conditions générales d&apos;utilisation
                </Link>
              </span>
            }
            control={<Checkbox {...register('termsAccepted')} defaultChecked={!!control._defaultValues.termsAccepted} />}
          />
          <FormHelperText>{errors?.termsAccepted?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Button type="submit" size="large" variant="contained" fullWidth>
          S&apos;enregistrer
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Typography color="textSecondary" variant="body2">
          Vous possédez déjà un compte ?&nbsp;
          <Link component={NextLink} href={linkRegistry.get('signIn', undefined)} variant="subtitle2" underline="none">
            Se connecter
          </Link>
        </Typography>
      </Grid>
    </BaseForm>
  );
}
