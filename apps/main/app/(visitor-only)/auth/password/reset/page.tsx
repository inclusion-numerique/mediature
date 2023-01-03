'use client';

import { Grid, Typography } from '@mui/material';
import { useState } from 'react';

import { ResetPasswordForm } from '@mediature/main/app/(visitor-only)/auth/password/reset/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Grid container sx={{ maxWidth: 'md', mx: 'auto' }}>
      <div>
        <Typography component="h1" variant="h4">
          Redéfinir votre mot de passe
        </Typography>
        <ResetPasswordForm />
      </div>
    </Grid>
  );
}
