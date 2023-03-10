import Button from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import * as React from 'react';

import hero from '@mediature/main/public/assets/home/hero.png';
import { useLiveChat } from '@mediature/main/src/components/live-chat/useLiveChat';
import { IntroductionContainer } from '@mediature/ui/src/IntroductionContainer';

export function Introduction() {
  const { showLiveChat, isLiveChatLoading } = useLiveChat();

  return (
    <IntroductionContainer
      left={
        <Box
          sx={{
            px: 4,
            py: 3,
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Typography component="h1" variant="h2" sx={{ my: 2, maxWidth: 500 }}>
            Le service de médiature entre les usagers et les collectivités
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
            Médiature est un service destiné aux médiateurs pour faciliter les démarches entre les usagers et les collectivités.
          </Typography>
          <Button onClick={showLiveChat} loading={isLiveChatLoading} size="large" variant="contained" sx={{ mb: 3 }}>
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
            maxHeight: '350px',
            objectFit: 'contain',
            objectPosition: 'left center',
          }}
        />
      }
    />
  );
}
