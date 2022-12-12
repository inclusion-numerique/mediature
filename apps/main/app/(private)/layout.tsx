'use client';

import { Button, Skeleton } from '@mui/material';
import { useSession } from 'next-auth/react';
import { signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';

export default function PrivateLayout(props: PropsWithChildren) {
  const router = useRouter();
  const sessionWrapper = useSession();
  const [logoutCommitted, setLogoutCommitted] = useState(false);

  useEffect(() => {
    if (sessionWrapper.status === 'unauthenticated' && !logoutCommitted) {
      signIn();
    }
  }, [logoutCommitted, router, sessionWrapper.status]);

  // TODO: should be moved into the header when the UI is up
  const onLogout = async () => {
    const result = await signOut({
      redirect: false,
      callbackUrl: '/auth/sign-in?session_end',
    });

    setLogoutCommitted(true);

    router.push(result.url);
  };

  if (sessionWrapper.status !== 'authenticated') {
    return <Skeleton />;
  } else {
    return (
      <>
        <Button onClick={onLogout} variant="outlined">
          Log out
        </Button>

        <div>{props.children}</div>
      </>
    );
  }
}
