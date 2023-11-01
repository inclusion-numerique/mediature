'use client';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Image from 'next/image';
import * as React from 'react';

import preview from '@mediature/main/public/assets/home/preview.jpeg';
import { Features } from '@mediature/main/src/app/(public)/(home)/Features';
import { Introduction } from '@mediature/main/src/app/(public)/(home)/Introduction';
import { Partners } from '@mediature/main/src/app/(public)/(home)/Partners';
import { Contact } from '@mediature/main/src/components/Contact';

export function HomePage() {
  return (
    <Grid
      container
      sx={{
        display: 'block',
        mx: 'auto',
      }}
    >
      <Introduction />
      <Features />
      <Partners />
      <Contact />
    </Grid>
  );
}
