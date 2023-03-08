'use client';

import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { Header, HeaderProps } from '@codegouvfr/react-dsfr/Header';
import { PropsWithChildren } from 'react';

import { useSession } from '@mediature/main/src/proxies/next-auth/react';
import { commonFooterAttributes, commonHeaderAttributes, userQuickAccessItem } from '@mediature/main/src/utils/dsfr';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';
import { ContentWrapper } from '@mediature/ui/src/layouts/ContentWrapper';

export function PublicLayout(props: PropsWithChildren) {
  const sessionWrapper = useSession();

  if (sessionWrapper.status === 'loading') {
    return <LoadingArea ariaLabelTarget="contenu" />;
  }

  // TODO: display a loading... maybe on the whole layout?
  let quickAccessItems: HeaderProps.QuickAccessItem[] | undefined;
  if (sessionWrapper.status === 'authenticated') {
    quickAccessItems = [
      userQuickAccessItem(sessionWrapper.data?.user, {
        showDashboardMenuItem: true,
      }),
    ];
  } else {
    quickAccessItems = [
      {
        iconId: 'fr-icon-lock-line',
        linkProps: {
          href: linkRegistry.get('signIn', undefined),
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
              href: linkRegistry.get('home', undefined),
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
              href: linkRegistry.get('aboutUs', undefined),
              target: '_self',
            },
            text: 'Qui sommes-nous ?',
          },
        ]}
      />
      <ContentWrapper>{props.children}</ContentWrapper>
      <Footer {...commonFooterAttributes} />
    </>
  );
}
