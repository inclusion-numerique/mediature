'use client';

import { Grid, Typography } from '@mui/material';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createContext, useContext } from 'react';

import { RequestCaseForm } from '@mediature/main/src/app/(public)/request/[authority]/RequestCaseForm';
import { trpc } from '@mediature/main/src/client/trpcClient';
import { centeredFormContainerGridProps, mdCenteredFormContainerGridProps } from '@mediature/main/src/utils/grid';

export const RequestCasePageContext = createContext({
  ContextualRequestCaseForm: RequestCaseForm,
});

export function RequestCasePage({ params: { authority: authoritySlug } }: { params: { authority: string } }) {
  const { ContextualRequestCaseForm } = useContext(RequestCasePageContext);

  const { data, error, isLoading } = trpc.getPublicFacingAuthority.useQuery({
    slug: authoritySlug,
  });

  const authority = data?.authority;

  if (error) {
    return <span>Error TODO</span>;
  } else if (isLoading) {
    return <span>Loading... TODO template</span>;
  } else if (!authority) {
    // TODO: in case of error... do the right thing, "notFound() / error500..."
    // Error: <head> cannot appear as a child of <div>
    // notFound();
    return <span>Not found TODO</span>;
  }

  return (
    <Grid container {...mdCenteredFormContainerGridProps}>
      <Typography component="h2" variant="h6" align="center">
        {authority.name}
      </Typography>
      <Typography component="h1" variant="h5" align="center" gutterBottom sx={{ mb: 5 }}>
        Lancer ma démarche de médiation
      </Typography>
      <ContextualRequestCaseForm />
    </Grid>
  );
}

export default RequestCasePage;
