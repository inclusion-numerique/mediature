'use client';

import { Alert, Grid, Typography } from '@mui/material';
import { createContext, useContext, useState } from 'react';

import { RetrievePasswordForm } from '@mediature/main/src/app/(visitor-only)/auth/password/retrieve/RetrievePasswordForm';
import { formTitleProps } from '@mediature/main/src/utils/form';
import { centeredFormContainerGridProps } from '@mediature/main/src/utils/grid';

export const ForgottenPasswordPageContext = createContext({
  ContextualRetrievePasswordForm: RetrievePasswordForm,
});

export function ForgottenPasswordPage() {
  const { ContextualRetrievePasswordForm } = useContext(ForgottenPasswordPageContext);

  const [requestCommitted, setRequestCommitted] = useState<boolean>(false);

  return (
    <Grid container {...centeredFormContainerGridProps}>
      {requestCommitted ? (
        <>
          <Grid item xs={12}>
            <Alert severity="success">Nous venons de vous envoyer un email pour réinitialiser votre mot de passe.</Alert>
          </Grid>
        </>
      ) : (
        <>
          <Typography component="h1" {...formTitleProps}>
            Mot de passe oublié ?
          </Typography>
          <ContextualRetrievePasswordForm
            onSuccess={async () => {
              setRequestCommitted(true);
            }}
          />
        </>
      )}
    </Grid>
  );
}
