'use client';

import { Grid, Typography } from '@mui/material';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createContext, useContext } from 'react';

import { InviteAgentForm } from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/agent/add/InviteAgentForm';
import { trpc } from '@mediature/main/src/client/trpcClient';
import { formTitleProps } from '@mediature/main/src/utils/form';
import { centeredAlertContainerGridProps, mdCenteredFormContainerGridProps } from '@mediature/main/src/utils/grid';
import { ErrorAlert } from '@mediature/ui/src/ErrorAlert';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';

export const AddAgentPageContext = createContext({
  ContextualInviteAgentForm: InviteAgentForm,
});

export interface AddAgentPageProps {
  params: { authorityId: string };
}

export function AddAgentPage({ params: { authorityId } }: AddAgentPageProps) {
  const { ContextualInviteAgentForm } = useContext(AddAgentPageContext);

  const { data, error, isLoading, refetch } = trpc.getAuthority.useQuery({
    id: authorityId,
  });

  const authority = data?.authority;

  if (error) {
    return (
      <Grid container {...centeredAlertContainerGridProps}>
        <ErrorAlert errors={[error]} refetchs={[refetch]} />
      </Grid>
    );
  } else if (isLoading) {
    return <LoadingArea ariaLabelTarget="page" />;
  } else if (!authority) {
    return notFound();
  }

  return (
    <Grid container {...mdCenteredFormContainerGridProps}>
      <Typography component="h1" {...formTitleProps}>
        Ajouter un médiateur à &quot;{authority.name}&quot;
      </Typography>
      <ContextualInviteAgentForm
        prefill={{
          authorityId: authority.id,
        }}
      />
    </Grid>
  );
}
