'use client';

import { Grid, Typography } from '@mui/material';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { RequestCaseForm } from '@mediature/main/app/(public)/request/[authority]/RequestCaseForm';
import { trpc } from '@mediature/main/client/trpcClient';

export default function RequestPage({ params: { authority: authoritySlug } }: { params: { authority: string } }) {
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
    <>
      <Grid item xs={12}>
        {/* <Image src="https://beta.gouv.fr/img/logo_twitter_image-2019.jpg" width={200} height={100} alt="Logo de la collectivité XXX TODO" /> */}
        <Typography component="h2" variant="h6" align="center">
          {authority.name}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Lancer ma démarche de médiation
        </Typography>
      </Grid>
      <Grid container sx={{ maxWidth: 'sm', mx: 'auto' }}>
        <RequestCaseForm />
      </Grid>
    </>
  );
}
