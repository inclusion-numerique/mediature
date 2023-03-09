'use client';

import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { Header } from '@codegouvfr/react-dsfr/Header';
import { MainNavigationProps } from '@codegouvfr/react-dsfr/MainNavigation';
import { MenuProps } from '@codegouvfr/react-dsfr/MainNavigation/Menu';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { signIn, useSession } from '@mediature/main/src/proxies/next-auth/react';
import { authoritySwichQuickAccessItem, commonFooterAttributes, commonHeaderAttributes, userQuickAccessItem } from '@mediature/main/src/utils/dsfr';
import { centeredAlertContainerGridProps } from '@mediature/main/src/utils/grid';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';
import { hasPathnameThisMatch, hasPathnameThisRoot } from '@mediature/main/src/utils/url';
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

  const dashboardLink = linkRegistry.get('dashboard', undefined);

  const navigation: MainNavigationProps.Item[] = [
    {
      isActive: hasPathnameThisMatch(pathname, dashboardLink),
      text: 'Tableau de bord',
      linkProps: {
        href: dashboardLink,
        target: '_self',
      },
    },
  ];

  if (currentAuthority) {
    const authorityLink = linkRegistry.get('authority', {
      authorityId: currentAuthority.id,
    });
    const myCasesLink = linkRegistry.get('myCases', {
      authorityId: currentAuthority.id,
    });
    const unassignedCaseListLink = linkRegistry.get('unassignedCaseList', {
      authorityId: currentAuthority.id,
    });
    const requestToAuthorityLink = linkRegistry.get('requestToAuthority', {
      authority: currentAuthority.slug,
    });

    navigation.push(
      ...[
        {
          isActive: hasPathnameThisMatch(pathname, authorityLink),
          text: 'Ma collectivité',
          linkProps: {
            href: authorityLink,
            target: '_self',
          },
        },
        {
          isActive: hasPathnameThisMatch(pathname, myCasesLink),
          text: 'Mes dossiers',
          linkProps: {
            href: myCasesLink,
            target: '_self',
          },
        },
        {
          isActive: hasPathnameThisMatch(pathname, unassignedCaseListLink),
          text: 'Dossiers non-assignés',
          linkProps: {
            href: unassignedCaseListLink,
            target: '_self',
          },
        },
        {
          isActive: hasPathnameThisMatch(pathname, requestToAuthorityLink),
          text: 'Déposer une saisine',
          linkProps: {
            href: requestToAuthorityLink,
            target: '_self',
          },
        },
      ]
    );
  }

  if (userInterfaceSession.isAdmin || (currentAuthority && currentAuthority.isMainAgent)) {
    const menuLinks: MenuProps.Link[] = [];

    if (currentAuthority && currentAuthority.isMainAgent) {
      const authorityAgentListLink = linkRegistry.get('authorityAgentList', {
        authorityId: currentAuthority.id,
      });
      const caseListLink = linkRegistry.get('caseList', {
        authorityId: currentAuthority.id,
      });

      menuLinks.push(
        ...[
          {
            isActive: hasPathnameThisMatch(pathname, authorityAgentListLink),
            text: 'Gérer les médiateurs de la collectivité',
            linkProps: {
              href: authorityAgentListLink,
            },
          },
          {
            isActive: hasPathnameThisMatch(pathname, caseListLink),
            text: 'Voir tous les dossiers de la collectivité',
            linkProps: {
              href: caseListLink,
            },
          },
        ]
      );
    }

    if (userInterfaceSession.isAdmin) {
      const authorityListLink = linkRegistry.get('authorityList', undefined);
      const adminListLink = linkRegistry.get('adminList', undefined);

      menuLinks.push(
        ...[
          {
            isActive: hasPathnameThisMatch(pathname, authorityListLink),
            text: 'Gérer les collectivités de la plateforme',
            linkProps: {
              href: authorityListLink,
            },
          },
          {
            isActive: hasPathnameThisMatch(pathname, adminListLink),
            text: 'Gérer les administrateurs de la plateforme',
            linkProps: {
              href: adminListLink,
            },
          },
        ]
      );
    }

    navigation.push({
      isActive: menuLinks.filter((link) => link.isActive).length > 0,
      text: 'Administration',
      menuLinks: menuLinks,
    });
  }

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
