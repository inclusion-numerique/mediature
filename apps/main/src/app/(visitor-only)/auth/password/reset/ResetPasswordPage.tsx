'use client';

import { Grid, Typography } from '@mui/material';
import { createContext, useContext } from 'react';

import { ResetPasswordForm } from '@mediature/main/src/app/(visitor-only)/auth/password/reset/ResetPasswordForm';
import { formTitleProps } from '@mediature/main/src/utils/form';
import { centeredFormContainerGridProps } from '@mediature/main/src/utils/grid';

export const ResetPasswordPageContext = createContext({
  ContextualResetPasswordForm: ResetPasswordForm,
});

export function ResetPasswordPage() {
  const { ContextualResetPasswordForm } = useContext(ResetPasswordPageContext);

  return (
    <Grid container {...centeredFormContainerGridProps}>
      <Typography component="h1" {...formTitleProps}>
        Redéfinir votre mot de passe
      </Typography>
      <ContextualResetPasswordForm />
    </Grid>
  );
}
