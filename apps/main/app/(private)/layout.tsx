'use client';

import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { Header } from '@codegouvfr/react-dsfr/Header';
import { Skeleton } from '@mui/material';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';

import { signIn, useSession } from '@mediature/main/proxies/next-auth/react';
import { commonFooterAttributes, commonHeaderAttributes, logoutQuickAccessItem } from '@mediature/main/utils/dsfr';
import { ContentWrapper } from '@mediature/ui/src/layouts/ContentWrapper';

export default function PrivateLayout(props: PropsWithChildren) {
  const router = useRouter();
  const sessionWrapper = useSession();
  const [logoutCommitted, setLogoutCommitted] = useState(false);

  useEffect(() => {
    if (sessionWrapper.status === 'unauthenticated' && !logoutCommitted) {
      signIn();
    }
  }, [logoutCommitted, router, sessionWrapper.status]);

  if (sessionWrapper.status !== 'authenticated') {
    return <Skeleton />;
  } else {
    return (
      <>
        <Header
          {...commonHeaderAttributes}
          quickAccessItems={[logoutQuickAccessItem(sessionWrapper.data?.user)]}
          navigation={[
            {
              linkProps: {
                href: '#',
                target: '_self',
              },
              text: 'Accueil',
            },
            {
              isActive: true, // TODO: should depends on the pathname
              linkProps: {
                href: '#',
                target: '_self',
              },
              text: 'Le service',
            },
            {
              linkProps: {
                href: '#',
                target: '_self',
              },
              text: 'Contact',
            },
          ]}
        />
        <ContentWrapper>{props.children}</ContentWrapper>
        <Footer {...commonFooterAttributes} />
      </>
    );
  }
}
