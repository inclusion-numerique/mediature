'use client';

import { Grid, Typography } from '@mui/material';
import React from 'react';

import { SignInForm } from '@mediature/main/src/app/(visitor-only)/auth/sign-in/SignInForm';
import { formTitleProps } from '@mediature/main/src/utils/form';
import { centeredFormContainerGridProps } from '@mediature/main/src/utils/grid';

export default function SignInPage() {
  return (
    <Grid container>
      <Grid item xs={12} lg={6} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Grid container {...centeredFormContainerGridProps}>
          <Typography component="h1" {...formTitleProps}>
            Connexion
          </Typography>
          <SignInForm />
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
