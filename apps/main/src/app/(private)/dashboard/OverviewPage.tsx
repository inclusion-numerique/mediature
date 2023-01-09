'use client';

import { Link, Skeleton, Typography } from '@mui/material';
import NextLink from 'next/link';

export function OverviewPage() {
  return (
    <div>
      <h1>Hola, vous êtes connecté :D</h1>
      <Typography color="textSecondary" variant="body2">
        <Link component={NextLink} href="/dashboard/authority/list" variant="subtitle2" underline="none" sx={{ m: 2 }}>
          Liste des collectivités
        </Link>
      </Typography>
      <h2>...</h2>
    </div>
  );
}
