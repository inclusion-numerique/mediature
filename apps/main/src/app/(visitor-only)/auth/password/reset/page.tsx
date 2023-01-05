'use client';

import { Grid, Typography } from '@mui/material';

import { ResetPasswordForm } from '@mediature/main/src/app/(visitor-only)/auth/password/reset/ResetPasswordForm';
import { formTitleProps } from '@mediature/main/src/utils/form';
import { centeredFormContainerGridProps } from '@mediature/main/src/utils/grid';

export default function ResetPasswordPage() {
  return (
    <Grid container {...centeredFormContainerGridProps}>
      <Typography component="h1" {...formTitleProps}>
        Redéfinir votre mot de passe
      </Typography>
      <ResetPasswordForm />
    </Grid>
  );
}
