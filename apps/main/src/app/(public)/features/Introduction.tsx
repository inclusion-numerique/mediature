import Button from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import * as React from 'react';

import hero from '@mediature/main/public/assets/features/hero.png';
import { IntroductionContainer } from '@mediature/ui/src/IntroductionContainer';

export function Introduction() {
  return (
    <IntroductionContainer
      containerMaxHeight={{ xs: 350, sm: 375, xl: 400 }}
      left={
        <Box
          sx={{
            px: 4,
            py: 3,
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Typography component="h1" variant="h2" sx={{ my: 2, maxWidth: 500 }}>
            Une multitude de fonctionnalités
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
            Afin de faciliter le plus possible la gestion des dossiers de médiation entre les usagers et les collectivitités, nous avons créer des
            fonctionnalités clés pour votre service de médiation.
          </Typography>
          <Button onClick={() => {}} size="large" variant="contained" sx={{ mb: 3 }}>
            Demander une démonstration
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
