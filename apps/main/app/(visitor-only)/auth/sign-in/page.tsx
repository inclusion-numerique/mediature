'use client';

import { Box, Grid, Typography } from '@mui/material';
import React from 'react';

import { SignInForm } from '@mediature/main/app/(visitor-only)/auth/sign-in/SignInForm';

export default function SignInPage() {
  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flex: '1 1 auto',
      }}
    >
      <Grid container sx={{ flex: '1 1 auto' }}>
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
                <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
                  Connexion
                </Typography>
                <SignInForm />
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
    </Box>
  );
}
