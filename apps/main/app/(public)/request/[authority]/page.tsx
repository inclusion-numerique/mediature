'use client';

import { Grid, Typography } from '@mui/material';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { RequestCaseForm } from '@mediature/main/app/(public)/request/[authority]/RequestCaseForm';

export default function RequestPage({ params: { authority } }: { params: { authority: string } }) {
  return (
    <>
      <Grid item xs={12}>
        {/* <Image src="https://beta.gouv.fr/img/logo_twitter_image-2019.jpg" width={200} height={100} alt="Logo de la collectivité XXX TODO" /> */}
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
