'use client';

import { Grid, Typography } from '@mui/material';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createContext, useContext } from 'react';

import { InviteAgentForm } from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/agent/add/InviteAgentForm';
import { trpc } from '@mediature/main/src/client/trpcClient';
import { formTitleProps } from '@mediature/main/src/utils/form';
import { centeredFormContainerGridProps, mdCenteredFormContainerGridProps } from '@mediature/main/src/utils/grid';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';

export const AddAgentPageContext = createContext({
  ContextualInviteAgentForm: InviteAgentForm,
});

export interface AddAgentPageProps {
  params: { authorityId: string };
}

export function AddAgentPage({ params: { authorityId } }: AddAgentPageProps) {
  const { ContextualInviteAgentForm } = useContext(AddAgentPageContext);

  const { data, error, isLoading } = trpc.getAuthority.useQuery({
    id: authorityId,
  });

  const authority = data?.authority;

  if (error) {
    return <span>Error TODO</span>;
  } else if (isLoading) {
    return <LoadingArea ariaLabelTarget="page" />;
  } else if (!authority) {
    // TODO: in case of error... do the right thing, "notFound() / error500..."
    // Error: <head> cannot appear as a child of <div>
    // notFound();
    return <span role="alert">Not found TODO</span>;
  }

  return (
    <Grid container {...mdCenteredFormContainerGridProps}>
      <Typography component="h1" {...formTitleProps}>
        Ajouter un médiateur à &quot;{authority.name}&quot;
      </Typography>
      <ContextualInviteAgentForm />
    </Grid>
  );
}
