'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useSearchParams } from 'next/navigation';
import { createContext, useContext } from 'react';

import { SignUpForm } from '@mediature/main/src/app/(visitor-only)/auth/sign-up/SignUpForm';
import { SignUpPrefillSchema } from '@mediature/main/src/models/actions/auth';
import { formTitleProps } from '@mediature/main/src/utils/form';
import { centeredFormContainerGridProps } from '@mediature/main/src/utils/grid';

export const SignUpPageContext = createContext({
  ContextualSignUpForm: SignUpForm,
});

export function SignUpPage() {
  const { ContextualSignUpForm } = useContext(SignUpPageContext);

  const searchParams = useSearchParams();
  const invitationToken = searchParams.get('token');

  // TODO: use getter to check invitation is still valid and adjust what's here, and to display issuer info
  // prefill names with invitation info?

  if (!invitationToken) {
    return (
      <span role="alert">
        Vous ne pouvez vous inscrire sans avoir être invité par un agent d&apos;une collectivité déjà sur la plateforme. Merci de vous rapprocher de
        votre collectivité pour en savoir plus.
      </span>
    );
  }

  return (
    <Grid container>
      <Grid item xs={12} lg={6} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Grid container {...centeredFormContainerGridProps}>
          <Typography component="h1" {...formTitleProps}>
            Inscription
          </Typography>
          <Typography component="p" variant="subtitle1">
            Vous avez été invité par XXXXX.
          </Typography>
          <ContextualSignUpForm
            prefill={SignUpPrefillSchema.parse({
              invitationToken: invitationToken,
            })}
          />
        </Grid>
      </Grid>
      <Grid
        item
        xs={12}
        lg={6}
        container
        direction={'column'}
        sx={{
          background: 'radial-gradient(50% 50% at 50% 50%, #122647 0%, #090E23 100%)',
          color: 'white',
          px: 3,
          py: 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body1" align="center">
          Cet espace est réservé aux agents des collectivités ... TODO
        </Typography>
      </Grid>
    </Grid>
  );
}
