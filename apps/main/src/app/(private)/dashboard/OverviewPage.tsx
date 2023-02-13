'use client';

import { Link, Typography } from '@mui/material';
import NextLink from 'next/link';

import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

export function OverviewPage() {
  return (
    <div>
      <h1>Hola, vous êtes connecté :D</h1>
      <Typography color="textSecondary" variant="body2">
        Page en construction... merci de naviguer via le menu :) !
      </Typography>
      <h2>...</h2>
    </div>
  );
}
