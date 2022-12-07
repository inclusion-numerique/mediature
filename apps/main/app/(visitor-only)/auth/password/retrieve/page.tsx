'use client';

import { Box, Button, FormHelperText, Grid, Link, TextField, Typography } from '@mui/material';
import NextLink from 'next/link';
import React from 'react';

export default function ForgotPasswordPage() {
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
            backgroundColor: 'neutral.50',
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
                  Mot de passe oublié ?
                </Typography>
                <form>
                  <TextField type="email" name="email" label="Email" fullWidth />
                  <Button size="large" sx={{ mt: 3 }} variant="contained" fullWidth>
                    Valider
                  </Button>
                  <Typography color="textSecondary" variant="body2">
                    <Link component={NextLink} href="/auth/sign-in" variant="subtitle2" underline="hover">
                      Retourner à la page de connexion
                    </Link>
                  </Typography>
                </form>
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
