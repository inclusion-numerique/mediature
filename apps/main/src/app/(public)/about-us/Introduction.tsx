import Button from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import * as React from 'react';

import hero from '@mediature/main/public/assets/about-us/hero.png';
import { IntroductionContainer } from '@mediature/ui/src/IntroductionContainer';

export function Introduction() {
  return (
    <IntroductionContainer
      containerMaxHeight={{ xs: 300, sm: 350, xl: 400 }}
      left={
        <Box
          sx={{
            px: 4,
            py: 3,
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Typography component="h1" variant="h2" sx={{ my: 2, maxWidth: 500 }}>
            Qui sommes-nous ?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
            Plusieurs organisations sont derrière ce projet : l&apos;AMCT, l&apos;ANCT et beta.gouv
          </Typography>
          <Button onClick={() => {}} size="large" variant="contained" sx={{ mb: 3 }}>
            En parler avec nous
          </Button>
        </Box>
      }
      right={
        <Image
          src={hero}
          alt=""
          style={{
            width: '100%',
            maxHeight: '250px',
            objectFit: 'contain',
            objectPosition: 'left center',
          }}
        />
      }
    />
  );
}
