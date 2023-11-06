'use client';

import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { Header, HeaderProps } from '@codegouvfr/react-dsfr/Header';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { FlashMessage } from '@mediature/main/src/components/FlashMessage';
import { LoadingArea } from '@mediature/main/src/components/LoadingArea';
import { useSession } from '@mediature/main/src/proxies/next-auth/react';
import { commonFooterAttributes, commonHeaderAttributes, userQuickAccessItem } from '@mediature/main/src/utils/dsfr';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';
import { hasPathnameThisMatch } from '@mediature/main/src/utils/url';
import { ContentWrapper } from '@mediature/ui/src/layouts/ContentWrapper';

export function PublicLayout(props: PropsWithChildren) {
  const sessionWrapper = useSession();
  const pathname = usePathname();

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

  const homeLink = linkRegistry.get('home', undefined);
  const featuresLink = linkRegistry.get('features', undefined);
  const aboutUsLink = linkRegistry.get('aboutUs', undefined);

  return (
    <>
      <Header
        {...commonHeaderAttributes}
        quickAccessItems={quickAccessItems}
        navigation={[
          {
            isActive: hasPathnameThisMatch(pathname, homeLink),
            linkProps: {
              href: homeLink,
              target: '_self',
            },
            text: 'Accueil',
          },
          {
            isActive: hasPathnameThisMatch(pathname, featuresLink),
            linkProps: {
              href: featuresLink,
              target: '_self',
            },
            text: 'Fonctionnalités',
          },
          {
            isActive: hasPathnameThisMatch(pathname, aboutUsLink),
            linkProps: {
              href: aboutUsLink,
              target: '_self',
            },
            text: 'Qui sommes-nous ?',
          },
        ]}
      />
      <FlashMessage appMode={process.env.NEXT_PUBLIC_APP_MODE} nodeEnv={process.env.NODE_ENV} />
      <ContentWrapper>{props.children}</ContentWrapper>
      <Footer {...commonFooterAttributes} />
    </>
  );
}
