'use client';

import { Typography } from '@mui/material';

export interface AuthorityPageProps {
  params: { authorityId: string };
}

export function AuthorityPage({ params: { authorityId } }: AuthorityPageProps) {
  return (
    <div>
      <h1>Page de la collectivité {authorityId.substring(0, 6)}...</h1>
      <Typography color="textSecondary" variant="body2">
        Page en construction... merci de naviguer via le menu :) !
      </Typography>
      <h2>...</h2>
    </div>
  );
}
