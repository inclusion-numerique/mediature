'use client';

import { Grid, Typography } from '@mui/material';
import { createContext, useContext } from 'react';

import { RetrievePasswordForm } from '@mediature/main/src/app/(visitor-only)/auth/password/retrieve/RetrievePasswordForm';
import { formTitleProps } from '@mediature/main/src/utils/form';
import { centeredFormContainerGridProps } from '@mediature/main/src/utils/grid';

export const ForgotPasswordPageContext = createContext({
  ContextualRetrievePasswordForm: RetrievePasswordForm,
});

export function ForgotPasswordPage() {
  const { ContextualRetrievePasswordForm } = useContext(ForgotPasswordPageContext);

  return (
    <Grid container {...centeredFormContainerGridProps}>
      <Typography component="h1" {...formTitleProps}>
        Mot de passe oublié ?
      </Typography>
      <ContextualRetrievePasswordForm />
    </Grid>
  );
}

export default ForgotPasswordPage;
