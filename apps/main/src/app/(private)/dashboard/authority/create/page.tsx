'use client';

import { Grid, Typography } from '@mui/material';
import { createContext, useContext } from 'react';

import { formTitleProps } from '@mediature/main/src/utils/form';
import { centeredFormContainerGridProps } from '@mediature/main/src/utils/grid';

import { CreateAuthorityForm } from './CreateAuthorityForm';

export const CreateAuthorityPageContext = createContext({
  ContextualCreateAuthorityForm: CreateAuthorityForm,
});

export function CreateAuthorityPage() {
  const { ContextualCreateAuthorityForm } = useContext(CreateAuthorityPageContext);

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

export default CreateAuthorityPage;
