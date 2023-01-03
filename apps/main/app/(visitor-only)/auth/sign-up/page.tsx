'use client';

import { Box, Grid, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';

import { SignUpForm } from '@mediature/main/app/(visitor-only)/auth/sign-up/SignUpForm';
import { SignUpPrefillSchema } from '@mediature/main/models/actions/auth';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get('token');

  // TODO: use getter to check invitation is still valid and adjust what's here, and to display issuer info
  // prefill names with invitation info?

  if (!invitationToken) {
    return (
      <span>
        Vous ne pouvez vous inscrire sans avoir être invité par un agent d&apos;une collectivité déjà sur la plateforme. Merci de vous rapprocher de
        votre collectivité pour en savoir plus.
      </span>
    );
  }

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        lg={6}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            flex: '1 1 auto',
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              maxWidth: 500,
              px: 3,
              py: '100px',
              width: '100%',
            }}
          >
            <div>
              <Typography component="h1" variant="h4">
                Inscription
              </Typography>
              <Typography component="p" variant="subtitle1">
                Vous avez été invité par XXXXX.
              </Typography>
              <SignUpForm
                prefill={SignUpPrefillSchema.parse({
                  invitationToken: 'abc',
                })}
              />
            </div>
          </Box>
        </Box>
      </Grid>
      <Grid
        item
        xs={12}
        lg={6}
        sx={{
          alignItems: 'center',
          background: 'radial-gradient(50% 50% at 50% 50%, #122647 0%, #090E23 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography align="center" variant="body1">
            Cet espace est réservé aux agents des collectivités ... TODO
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}
