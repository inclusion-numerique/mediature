'use client';

import { Grid, Typography } from '@mui/material';

import { RetrievePasswordForm } from '@mediature/main/app/(visitor-only)/auth/password/retrieve/RetrievePasswordForm';
import { formTitleProps } from '@mediature/main/utils/form';
import { centeredFormContainerGridProps } from '@mediature/main/utils/grid';

export default function ForgotPasswordPage() {
  return (
    <Grid container {...centeredFormContainerGridProps}>
      <Typography component="h1" {...formTitleProps}>
        Mot de passe oublié ?
      </Typography>
      <RetrievePasswordForm />
    </Grid>
  );
}
