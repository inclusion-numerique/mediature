'use client';

import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { Header } from '@codegouvfr/react-dsfr/Header';
import { HeaderProps } from '@codegouvfr/react-dsfr/Header';
import { MainNavigationProps } from '@codegouvfr/react-dsfr/MainNavigation';
import { MenuProps } from '@codegouvfr/react-dsfr/MainNavigation/Menu';
import Badge from '@mui/material/Badge';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { ErrorAlert } from '@mediature/main/src/components/ErrorAlert';
import { FlashMessage } from '@mediature/main/src/components/FlashMessage';
import { LoadingArea } from '@mediature/main/src/components/LoadingArea';
import { useLiveChat } from '@mediature/main/src/components/live-chat/useLiveChat';
import { UserInterfaceSessionProvider } from '@mediature/main/src/components/user-interface-session/UserInterfaceSessionProvider';
import { signIn, useSession } from '@mediature/main/src/proxies/next-auth/react';
import {
  authoritySwichQuickAccessItem,
  commonFooterAttributes,
  commonHeaderAttributes,
  unprocessedMessagesBadgeAttributes,
  userQuickAccessItem,
} from '@mediature/main/src/utils/dsfr';
import { centeredAlertContainerGridProps } from '@mediature/main/src/utils/grid';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';
import { hasPathnameThisMatch, hasPathnameThisRoot } from '@mediature/main/src/utils/url';
import { ContentWrapper } from '@mediature/ui/src/layouts/ContentWrapper';

export function PrivateLayout(props: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const sessionWrapper = useSession();
  const [logoutCommitted, setLogoutCommitted] = useState(false);

  const { data, error, isLoading, refetch } = trpc.getInterfaceSession.useQuery({});

  useEffect(() => {
    if (sessionWrapper.status === 'unauthenticated' && !logoutCommitted) {
      signIn();
    }
  }, [logoutCommitted, router, sessionWrapper.status]);

  const { showLiveChat } = useLiveChat();

  if (isLoading || sessionWrapper.status !== 'authenticated') {
    return <LoadingArea ariaLabelTarget="contenu" />;
  } else if (error) {
    return (
      <Grid container {...centeredAlertContainerGridProps}>
        <ErrorAlert errors={[error]} refetchs={[refetch]} />
      </Grid>
    );
  }

  const userInterfaceSession = data?.session;

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
    const caseListLink = linkRegistry.get('caseList', {
      authorityId: currentAuthority.id,
    });
    const unassignedCaseListLink = linkRegistry.get('unassignedCaseList', {
      authorityId: currentAuthority.id,
    });
    const requestToAuthorityLink = linkRegistry.get('requestToAuthority', {
      authority: currentAuthority.slug,
    });
    const authorityMetricsLink = linkRegistry.get('authorityMetrics', {
      authorityId: currentAuthority.id,
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
          text: (
            <span>
              Mes dossiers
              {!!currentAuthority.assignedUnprocessedMessages && currentAuthority.assignedUnprocessedMessages > 0 && (
                <Badge {...unprocessedMessagesBadgeAttributes} badgeContent={currentAuthority.assignedUnprocessedMessages} />
              )}
            </span>
          ),
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
          isActive: hasPathnameThisMatch(pathname, caseListLink),
          text: 'Tous les dossiers',
          linkProps: {
            href: caseListLink,
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
        {
          isActive: hasPathnameThisMatch(pathname, authorityMetricsLink),
          text: 'Statistiques',
          linkProps: {
            href: authorityMetricsLink,
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
      const authorityEditLink = linkRegistry.get('authorityEdit', {
        authorityId: currentAuthority.id,
      });
      const authorityComponentsEditLink = linkRegistry.get('authorityComponentsEdit', {
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
            isActive: hasPathnameThisMatch(pathname, authorityEditLink),
            text: 'Modifier les informations de la collectivité',
            linkProps: {
              href: authorityEditLink,
            },
          },
          {
            isActive: hasPathnameThisMatch(pathname, authorityComponentsEditLink),
            text: 'Modifier les listes dynamiques de la collectivité',
            linkProps: {
              href: authorityComponentsEditLink,
            },
          },
        ]
      );
    }

    if (userInterfaceSession.isAdmin) {
      const authorityListLink = linkRegistry.get('authorityList', undefined);
      const adminListLink = linkRegistry.get('adminList', undefined);
      const globalMetricsLink = linkRegistry.get('globalMetrics', undefined);
      const globalComponentsEditLink = linkRegistry.get('globalComponentsEdit', undefined);

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
          {
            isActive: hasPathnameThisMatch(pathname, globalComponentsEditLink),
            text: 'Modifier les listes dynamiques de la plateforme',
            linkProps: {
              href: globalComponentsEditLink,
            },
          },
          {
            isActive: hasPathnameThisMatch(pathname, globalMetricsLink),
            text: 'Voir les statistiques de la plateforme',
            linkProps: {
              href: globalMetricsLink,
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

  const quickAccessItems: HeaderProps.QuickAccessItem[] = [
    {
      iconId: 'fr-icon-questionnaire-line',
      buttonProps: {
        onClick: (event) => {
          showLiveChat();
        },
      },
      text: 'Support',
    },
    userQuickAccessItem(sessionWrapper.data?.user),
  ];

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
      <UserInterfaceSessionProvider session={userInterfaceSession}>
        <Header {...commonHeaderAttributes} quickAccessItems={quickAccessItems} navigation={navigation} />
        <FlashMessage appMode={process.env.NEXT_PUBLIC_APP_MODE} nodeEnv={process.env.NODE_ENV} />
        <ContentWrapper>{props.children}</ContentWrapper>
        <Footer {...commonFooterAttributes} />
      </UserInterfaceSessionProvider>
    </>
  );
}
