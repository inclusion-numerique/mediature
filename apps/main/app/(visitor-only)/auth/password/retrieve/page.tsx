'use client';

import { Grid, Typography } from '@mui/material';

import { RetrievePasswordForm } from '@mediature/main/app/(visitor-only)/auth/password/retrieve/RetrievePasswordForm';

export default function ForgotPasswordPage() {
  return (
    <Grid container sx={{ maxWidth: 'md', mx: 'auto' }}>
      <div>
        <Typography component="h1" variant="h4">
          Mot de passe oublié ?
        </Typography>
        <RetrievePasswordForm />
      </div>
    </Grid>
  );
}
