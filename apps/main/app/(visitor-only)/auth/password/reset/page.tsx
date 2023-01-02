'use client';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Box, Button, FormHelperText, Grid, IconButton, InputAdornment, Link, TextField, Typography } from '@mui/material';
import NextLink from 'next/link';
import React, { useState } from 'react';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  return (
    <Grid container>
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
                Redéfinir votre mot de passe
              </Typography>
              <form>
                <TextField
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  label="Password"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="changer la visibilité du mot de passe"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                        >
                          {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button type="submit" size="large" sx={{ mt: 3 }} variant="contained" fullWidth>
                  Valider
                </Button>
                <Typography color="textSecondary" variant="body2">
                  <Link component={NextLink} href="/auth/sign-in" variant="subtitle2" underline="none">
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
  );
}
