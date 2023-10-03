import { fr } from '@codegouvfr/react-dsfr';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid, { GridProps } from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import NextLink from 'next/link';
import { ImgHTMLAttributes } from 'react';

import amct from '@mediature/main/public/assets/partners/amct.png';
import anct from '@mediature/main/public/assets/partners/anct.png';
import betagouv from '@mediature/main/public/assets/partners/betagouv.png';

export const gridItemProps: GridProps = {
  xs: 6,
  sm: 4,
  sx: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export const imageProps: ImgHTMLAttributes<HTMLImageElement> = {
  style: {
    width: 'auto',
    maxHeight: '100px',
    objectFit: 'contain',
  },
};

export function Partners() {
  return (
    <Container sx={{ pt: 1, pb: { xs: 4, sm: 5, md: 6 } }}>
      <Typography
        component="h2"
        variant="h4"
        color={fr.colors.decisions.text.title.blueFrance.default}
        sx={{ textAlign: 'center', mt: 1, mb: { xs: 2, sm: 4 } }}
      >
        Nos partenaires
      </Typography>
      <Box sx={{ minHeight: { xs: 236, sm: 144, md: 52 } }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item {...gridItemProps}>
            <Link
              component={NextLink}
              href="https://www.amct-mediation.fr"
              target="_blank"
              underline="none"
              sx={{
                ml: 2,
                backgroundImage: 'none !important',
                '&::after': {
                  display: 'none !important',
                },
              }}
            >
              <Image src={amct} alt="logo de l'AMCT" style={{ ...imageProps.style }} />
            </Link>
          </Grid>
          <Grid item {...gridItemProps}>
            <Link
              component={NextLink}
              href="https://agence-cohesion-territoires.gouv.fr"
              target="_blank"
              underline="none"
              sx={{
                backgroundImage: 'none !important',
                '&::after': {
                  display: 'none !important',
                },
              }}
            >
              <Image src={anct} alt="logo de l'ANCT" style={{ ...imageProps.style }} />
            </Link>
          </Grid>
          <Grid item {...gridItemProps}>
            <Link
              component={NextLink}
              href="https://beta.gouv.fr"
              target="_blank"
              underline="none"
              sx={{
                ml: 2,
                backgroundImage: 'none !important',
                '&::after': {
                  display: 'none !important',
                },
              }}
            >
              <Image src={betagouv} alt="logo de beta.gouv" style={{ ...imageProps.style, height: '70%' }} />
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
