'use client';

import { Link, Skeleton, Typography } from '@mui/material';
import { signIn, signOut, useSession } from 'next-auth/react';
import NextLink from 'next/link';
import { PropsWithChildren } from 'react';

export default function PublicLayout(props: PropsWithChildren) {
  const sessionWrapper = useSession();

  // TODO: factorize we other file that use this
  const logout = async () => {
    const result = await signOut({
      redirect: true,
      callbackUrl: '/auth/sign-in?session_end',
    });
  };

  if (sessionWrapper.status === 'loading') {
    return <Skeleton />;
  }

  // TODO: display a loading... maybe on the whole layout?
  let dynamicSection;
  if (sessionWrapper.status === 'authenticated') {
    dynamicSection = (
      <>
        <span>Bonjour {sessionWrapper.data?.user.firstname}</span>
        {/* TODO: component="button" does not have the same style, but a NextLink does not accept onClick... */}
        <Link component="button" onClick={logout} variant="subtitle2" underline="hover" sx={{ m: 2 }}>
          Se déconnecter
        </Link>
      </>
    );
  } else {
    dynamicSection = (
      <>
        <Link component={NextLink} href="/auth/sign-in" variant="subtitle2" underline="hover" sx={{ m: 2 }}>
          Connexion
        </Link>
        <Link component={NextLink} href="/auth/sign-up" variant="subtitle2" underline="hover" sx={{ m: 2 }}>
          (Inscription)
        </Link>
      </>
    );
  }

  return (
    <>
      <Typography color="textSecondary" variant="body2">
        <Link component={NextLink} href="/" variant="subtitle2" underline="hover" sx={{ m: 2 }}>
          Accueil
        </Link>
        {dynamicSection}
      </Typography>
      {props.children}
    </>
  );
}
