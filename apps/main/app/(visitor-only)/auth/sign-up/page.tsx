'use client';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import NextLink from 'next/link';
import React, { useState } from 'react';

export default function SignUpPage() {
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
                  Inscription
                </Typography>
                <Typography component="p" variant="subtitle1" sx={{ mb: 1 }}>
                  Vous avez été invité par XXXXX.
                </Typography>
                <form>
                  <TextField type="email" name="email" label="Email" fullWidth />
                  <TextField name="firstname" label="Prénom" fullWidth />
                  <TextField name="lastname" label="Nom" fullWidth />
                  <TextField
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    label="Password"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
                            {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl>
                    <FormControlLabel
                      label={
                        <span>
                          J&apos;accepte les&nbsp;
                          <Link href="/terms-of-use" variant="subtitle2" underline="hover">
                            conditions générales d&apos;utilisation
                          </Link>
                        </span>
                      }
                      control={<Checkbox defaultChecked />}
                    />
                  </FormControl>
                  <Button type="submit" size="large" sx={{ mt: 3 }} variant="contained" fullWidth>
                    S&apos;enregistrer
                  </Button>
                  <Typography color="textSecondary" variant="body2">
                    Vous possédez déjà un compte ?&nbsp;
                    <Link component={NextLink} href="/auth/sign-in" variant="subtitle2" underline="hover">
                      Se connecter
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
