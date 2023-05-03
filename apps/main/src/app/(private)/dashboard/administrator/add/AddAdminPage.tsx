'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createContext, useContext } from 'react';

import { InviteAdminForm } from '@mediature/main/src/app/(private)/dashboard/administrator/add/InviteAdminForm';
import { formTitleProps } from '@mediature/main/src/utils/form';
import { mdCenteredFormContainerGridProps } from '@mediature/main/src/utils/grid';

export const AddAdminPageContext = createContext({
  ContextualInviteAdminForm: InviteAdminForm,
});

export interface AddAdminPageProps {
  params: {};
}

export function AddAdminPage(props: AddAdminPageProps) {
  const { ContextualInviteAdminForm } = useContext(AddAdminPageContext);

  return (
    <Grid container {...mdCenteredFormContainerGridProps}>
      <Typography component="h1" {...formTitleProps}>
        Ajouter un administrateur à la plateforme
      </Typography>
      <ContextualInviteAdminForm prefill={{}} />
    </Grid>
  );
}
