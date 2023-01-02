'use client';

import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { Header, HeaderProps } from '@codegouvfr/react-dsfr/Header';
import { Skeleton } from '@mui/material';
import { PropsWithChildren } from 'react';

import { useSession } from '@mediature/main/proxies/next-auth/react';
import { commonFooterAttributes, commonHeaderAttributes, logoutQuickAccessItem } from '@mediature/main/utils/dsfr';
import { ContentWrapper } from '@mediature/ui/src/layouts/ContentWrapper';

export default function PublicLayout(props: PropsWithChildren) {
  const sessionWrapper = useSession();

  if (sessionWrapper.status === 'loading') {
    return <Skeleton />;
  }

  // TODO: display a loading... maybe on the whole layout?
  let quickAccessItems: HeaderProps.QuickAccessItem[] | undefined;
  if (sessionWrapper.status === 'authenticated') {
    quickAccessItems = [logoutQuickAccessItem(sessionWrapper.data?.user)];
  } else {
    quickAccessItems = [
      {
        iconId: 'fr-icon-lock-line',
        linkProps: {
          href: '/auth/sign-in',
        },
        text: 'Se connecter',
      },
    ];
  }

  return (
    <>
      <Header
        {...commonHeaderAttributes}
        quickAccessItems={quickAccessItems}
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
