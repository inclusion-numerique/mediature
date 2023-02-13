'use client';

import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { Header } from '@codegouvfr/react-dsfr/Header';
import { MainNavigationProps } from '@codegouvfr/react-dsfr/MainNavigation';
import { MenuProps } from '@codegouvfr/react-dsfr/MainNavigation/Menu';
import { Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { signIn, useSession } from '@mediature/main/src/proxies/next-auth/react';
import { authoritySwichQuickAccessItem, commonFooterAttributes, commonHeaderAttributes, userQuickAccessItem } from '@mediature/main/src/utils/dsfr';
import { centeredAlertContainerGridProps } from '@mediature/main/src/utils/grid';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';
import { ErrorAlert } from '@mediature/ui/src/ErrorAlert';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';
import { ContentWrapper } from '@mediature/ui/src/layouts/ContentWrapper';

export function PrivateLayout(props: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const sessionWrapper = useSession();
  const [logoutCommitted, setLogoutCommitted] = useState(false);

  const { data, error, isLoading, refetch } = trpc.getInterfaceSession.useQuery({});

  const userInterfaceSession = data?.session;

  useEffect(() => {
    if (sessionWrapper.status === 'unauthenticated' && !logoutCommitted) {
      signIn();
    }
  }, [logoutCommitted, router, sessionWrapper.status]);

  if (isLoading || sessionWrapper.status !== 'authenticated') {
    return <LoadingArea ariaLabelTarget="contenu" />;
  } else if (error || !userInterfaceSession) {
    return (
      <Grid container {...centeredAlertContainerGridProps}>
        <ErrorAlert errors={[error]} refetchs={[refetch]} />
      </Grid>
    );
  }

  const currentAuthority = userInterfaceSession.agentOf.find((authority) => {
    const authorityPageBaseUrl = linkRegistry.get('authority', {
      authorityId: authority.id,
    });

    if (pathname?.startsWith(authorityPageBaseUrl)) {
      return true;
    }

    return false;
  });

  const navigation: MainNavigationProps.Item[] = [
    {
      text: 'Tableau de bord',
      linkProps: {
        href: linkRegistry.get('dashboard', undefined),
        target: '_self',
      },
    },
  ];

  if (currentAuthority) {
    navigation.push(
      ...[
        {
          text: 'Mes dossiers',
          linkProps: {
            href: linkRegistry.get('caseList', {
              authorityId: currentAuthority.id,
            }),
            target: '_self',
          },
        },
        {
          text: 'Dossiers non-assignés',
          linkProps: {
            href: linkRegistry.get('unassignedCaseList', {
              authorityId: currentAuthority.id,
            }),
            target: '_self',
          },
        },
        {
          text: 'Déposer une saisine',
          linkProps: {
            href: linkRegistry.get('requestToAuthority', {
              authority: currentAuthority.slug,
            }),
            target: '_self',
          },
        },
      ]
    );
  }

  if (userInterfaceSession.isAdmin || (currentAuthority && currentAuthority.isMainAgent)) {
    const menuLinks: MenuProps.Link[] = [];

    if (currentAuthority && currentAuthority.isMainAgent) {
      menuLinks.push(
        ...[
          {
            text: 'Gérer les médiateurs de la collectivité',
            linkProps: {
              href: linkRegistry.get('authorityAgentList', {
                authorityId: currentAuthority.id,
              }),
            },
          },
          {
            text: 'Voir tous les dossiers de la collectivité',
            linkProps: {
              href: linkRegistry.get('caseList', {
                authorityId: currentAuthority.id,
              }),
            },
          },
        ]
      );
    }

    if (userInterfaceSession.isAdmin) {
      menuLinks.push(
        ...[
          {
            text: 'Gérer les collectivités de la plateforme',
            linkProps: {
              href: linkRegistry.get('authorityList', undefined),
            },
          },
          {
            text: 'Gérer les utilisateurs de la plateforme',
            linkProps: {
              href: '#',
            },
          },
        ]
      );
    }

    navigation.push({
      text: 'Administration',
      // isActive: true,
      menuLinks: menuLinks,
    });
  }

  // TODO: isActive done automatically? Or we need to add "addActiveFlag(navigation)" to look at all href?

  const quickAccessItems = [userQuickAccessItem(sessionWrapper.data?.user)];

  if (userInterfaceSession.agentOf.length) {
    quickAccessItems.unshift(
      authoritySwichQuickAccessItem({
        authorities: userInterfaceSession.agentOf,
        currentAuthority: currentAuthority,
      })
    );
  }

  return (
    <>
      <Header {...commonHeaderAttributes} quickAccessItems={quickAccessItems} navigation={navigation} />
      <ContentWrapper>{props.children}</ContentWrapper>
      <Footer {...commonFooterAttributes} />
    </>
  );
}
