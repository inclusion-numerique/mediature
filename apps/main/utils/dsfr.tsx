import { headerFooterDisplayItem } from '@codegouvfr/react-dsfr/Display';
import type { DefaultColorScheme } from '@codegouvfr/react-dsfr/next-appdir';

import { logout } from '@mediature/main/utils/auth';

export const defaultColorScheme: DefaultColorScheme = 'system';

export const brandTop = (
  <>
    COLLECTIVITÉS
    <br />
    FRANÇAISES
  </>
);

export const homeLinkProps = {
  href: '/',
  title: 'Accueil - Médiature',
};

// export const logoutQuickAccessItem = (user: Session.user) => {
// TODO: remove "any"
export const logoutQuickAccessItem = (user: any) => {
  return {
    iconId: 'fr-icon-lock-line',
    buttonProps: {
      onClick: logout,
    },
    text: `Se déconnecter (${user.firstname})`,
  } as any;
};

export const commonHeaderAttributes = {
  brandTop: brandTop,
  homeLinkProps: homeLinkProps,
  serviceTitle: 'Médiature',
  serviceTagline: 'Service public de médiation',
};

export const commonFooterAttributes = {
  accessibility: 'non compliant' as any,
  brandTop: brandTop,
  contentDescription: 'Ce site est géré par les collectivités.',
  cookiesManagementLinkProps: {
    // TODO
    href: '#',
  },
  homeLinkProps: homeLinkProps,
  personalDataLinkProps: {
    href: '#', // TODO
  },
  termsLinkProps: {
    href: '#', // TODO
  },
  // websiteMapLinkProps: {{
  //   href: '#',
  // }}
  bottomItems: [headerFooterDisplayItem],
};
