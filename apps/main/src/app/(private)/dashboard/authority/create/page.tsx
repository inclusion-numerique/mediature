'use client';

import { Grid, Typography } from '@mui/material';

import { formTitleProps } from '@mediature/main/src/utils/form';
import { centeredFormContainerGridProps } from '@mediature/main/src/utils/grid';

import { CreateAuthorityForm } from './CreateAuthorityForm';

export default function AuthorityCreatePage() {
  return (
    <Grid container {...centeredFormContainerGridProps}>
      <Typography component="h1" {...formTitleProps}>
        Ajouter une collectivité
      </Typography>
      <CreateAuthorityForm />
    </Grid>
  );
}
