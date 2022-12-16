'use client';

import { Grid } from '@mui/material';

import { CreateAuthorityForm } from './CreateAuthorityForm';

export default function AuthorityCreatePage() {
  return (
    <>
      <Grid container sx={{ maxWidth: 'md', mx: 'auto' }}>
        <h1>Ajouter une collectivité</h1>
        <CreateAuthorityForm />
      </Grid>
    </>
  );
}
