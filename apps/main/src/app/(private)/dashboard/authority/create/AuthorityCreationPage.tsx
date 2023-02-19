'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createContext, useContext } from 'react';

import { CreateAuthorityForm } from '@mediature/main/src/app/(private)/dashboard/authority/create/CreateAuthorityForm';
import { formTitleProps } from '@mediature/main/src/utils/form';
import { centeredFormContainerGridProps } from '@mediature/main/src/utils/grid';

export const AuthorityCreationPageContext = createContext({
  ContextualCreateAuthorityForm: CreateAuthorityForm,
});

export function AuthorityCreationPage() {
  const { ContextualCreateAuthorityForm } = useContext(AuthorityCreationPageContext);

  // Check the user is an admin

  return (
    <Grid container {...centeredFormContainerGridProps}>
      <Typography component="h1" {...formTitleProps}>
        Ajouter une collectivité
      </Typography>
      <ContextualCreateAuthorityForm />
    </Grid>
  );
}
