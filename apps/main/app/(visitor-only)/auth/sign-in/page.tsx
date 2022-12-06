'use client';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Box, Button, FormHelperText, Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

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
                  Connexion
                </Typography>
                <form>
                  <TextField type="email" name="email" label="Email" fullWidth />
                  <TextField
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    label="Password"
                    fullWidth
                    InputProps={{
                      // <-- This is where the toggle button is added.
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
                            {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button size="large" sx={{ mt: 3 }} variant="contained" fullWidth>
                    Se connecter
                  </Button>
                  <Button size="large" sx={{ mt: 3 }} fullWidth>
                    Mot de passe oublié ?
                  </Button>
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
