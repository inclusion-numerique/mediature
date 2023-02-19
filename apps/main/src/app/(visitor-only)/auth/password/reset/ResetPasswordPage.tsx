'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useSearchParams } from 'next/navigation';
import { createContext, useContext } from 'react';

import { ResetPasswordForm } from '@mediature/main/src/app/(visitor-only)/auth/password/reset/ResetPasswordForm';
import { ResetPasswordPrefillSchema } from '@mediature/main/src/models/actions/auth';
import { formTitleProps } from '@mediature/main/src/utils/form';
import { centeredFormContainerGridProps } from '@mediature/main/src/utils/grid';

export const ResetPasswordPageContext = createContext({
  ContextualResetPasswordForm: ResetPasswordForm,
});

export function ResetPasswordPage() {
  const { ContextualResetPasswordForm } = useContext(ResetPasswordPageContext);

  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token');

  if (!resetToken) {
    return (
      <span role="alert">Le jeton de réinitialisation de mot de passe n&apos;est pas détecté, merci de bien copier le lien depuis l&apos;email.</span>
    );
  }

  return (
    <Grid container {...centeredFormContainerGridProps}>
      <Typography component="h1" {...formTitleProps}>
        Redéfinir votre mot de passe
      </Typography>
      <ContextualResetPasswordForm
        prefill={ResetPasswordPrefillSchema.parse({
          token: resetToken,
        })}
      />
    </Grid>
  );
}
