'use client';

import { Alert, Grid, Typography } from '@mui/material';
import { notFound } from 'next/navigation';
import { createContext, useContext, useState } from 'react';

import { RequestCaseForm } from '@mediature/main/src/app/(public)/request/[authority]/RequestCaseForm';
import { trpc } from '@mediature/main/src/client/trpcClient';
import { centeredAlertContainerGridProps, mdCenteredFormContainerGridProps } from '@mediature/main/src/utils/grid';
import { ErrorAlert } from '@mediature/ui/src/ErrorAlert';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';

export const RequestCasePageContext = createContext({
  ContextualRequestCaseForm: RequestCaseForm,
});

export interface RequestCasePageProps {
  params: { authority: string };
}

export function RequestCasePage({ params: { authority: authoritySlug } }: RequestCasePageProps) {
  const { ContextualRequestCaseForm } = useContext(RequestCasePageContext);

  const [requestCommitted, setRequestCommitted] = useState<boolean>(false);

  const { data, error, isLoading, refetch } = trpc.getPublicFacingAuthority.useQuery({
    slug: authoritySlug,
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
      {requestCommitted ? (
        <>
          <Grid item xs={12}>
            <Alert severity="success">Votre demande a bien été prise en compte, un médiateur va prendre contact avec vous sous quelques jours.</Alert>
          </Grid>
        </>
      ) : (
        <>
          <Typography component="h2" variant="h6" align="center">
            {authority.name}
          </Typography>
          <Typography component="h1" variant="h5" align="center" gutterBottom sx={{ mb: 5 }}>
            Lancer ma démarche de médiation
          </Typography>
          <ContextualRequestCaseForm
            prefill={{
              authorityId: authority.id,
            }}
            onSuccess={async () => {
              setRequestCommitted(true);
            }}
          />
        </>
      )}
    </Grid>
  );
}
