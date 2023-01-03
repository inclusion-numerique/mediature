import { headerFooterDisplayItem } from '@codegouvfr/react-dsfr/Display';
import { HeaderProps } from '@codegouvfr/react-dsfr/Header';
import type { DefaultColorScheme } from '@codegouvfr/react-dsfr/next-appdir';

import { TokenUserSchemaType } from '@mediature/main/models/entities/user';
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

export const logoutQuickAccessItem = (user: TokenUserSchemaType): HeaderProps.QuickAccessItem => {
  return {
    iconId: 'fr-icon-lock-line',
    buttonProps: {
      onClick: logout,
    },
    text: `Se déconnecter (${user.firstname})`,
  };
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
