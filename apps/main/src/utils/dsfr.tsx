import { headerFooterDisplayItem } from '@codegouvfr/react-dsfr/Display';
import { HeaderProps } from '@codegouvfr/react-dsfr/Header';
import type { DefaultColorScheme } from '@codegouvfr/react-dsfr/next-appdir';
import { BadgeProps } from '@mui/material/Badge';
import { EventEmitter } from 'eventemitter3';

import { HeaderAuthoritySwitchItem, HeaderAuthoritySwitchItemProps } from '@mediature/main/src/components/HeaderAuthoritySwitchItem';
import { HeaderUserItem } from '@mediature/main/src/components/HeaderUserItem';
import { PublicFacingAuthoritySchemaType } from '@mediature/main/src/models/entities/authority';
import { TokenUserSchemaType } from '@mediature/main/src/models/entities/user';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

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

export interface AuthoritySwitchQuickAccessItemOptions extends Omit<HeaderAuthoritySwitchItemProps, 'eventEmitter'> {}

export const authoritySwichQuickAccessItem = (props: AuthoritySwitchQuickAccessItemOptions): HeaderProps.QuickAccessItem => {
  const eventEmitter = new EventEmitter();

  return {
    iconId: undefined as any,
    buttonProps: {
      onClick: (event) => {
        eventEmitter.emit('click', event);
      },
    },
    text: <HeaderAuthoritySwitchItem eventEmitter={eventEmitter} {...props} />,
  };
};

export interface UserQuickAccessItemOptions {
  showDashboardMenuItem?: boolean;
}

export const userQuickAccessItem = (user: TokenUserSchemaType, options?: UserQuickAccessItemOptions): HeaderProps.QuickAccessItem => {
  const eventEmitter = new EventEmitter();

  // INFORMATION: this won't work on 5xx and 4xx error pages since there is an hydratation error due to Next.js (maybe fixed in the future)
  // `Warning: validateDOMNesting(...): <body> cannot appear as a child of <div>.`
  return {
    iconId: undefined as any,
    buttonProps: {
      onClick: (event) => {
        eventEmitter.emit('click', event);
      },
    },
    text: <HeaderUserItem user={user} eventEmitter={eventEmitter} showDashboardMenuItem={options?.showDashboardMenuItem} />,
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
  accessibilityLinkProps: {
    // TODO: waiting for the following to be solved https://github.com/zilch/type-route/issues/125
    // href: linkRegistry.get('accessibility', undefined),
    href: '/accessibilite',
  },
  brandTop: brandTop,
  contentDescription: 'Ce site est géré par les collectivités.',
  homeLinkProps: homeLinkProps,
  termsLinkProps: {
    // href: linkRegistry.get('legalNotice', undefined),
    href: '/mentions-legales',
  },
  // websiteMapLinkProps: {{
  //   href: '#',
  // }}
  bottomItems: [
    {
      iconId: undefined as any,
      linkProps: {
        // href: linkRegistry.get('privacyPolicy', undefined),
        href: '/politique-de-confidentialite',
      },
      text: 'Politique de confidentialité',
    },
    {
      iconId: undefined as any,
      linkProps: {
        // href: linkRegistry.get('termsOfUse', undefined),
        href: '/conditions-generales-d-utilisation',
      },
      text: `Conditions générales d'utilisation`,
    },
    headerFooterDisplayItem,
  ],
  license: (
    <>
      Sauf mention contraire, tous les contenus de ce site sont sous{' '}
      <a href="https://raw.githubusercontent.com/inclusion-numerique/mediature/main/LICENSE" target="_blank" rel="noreferrer">
        licence AGPL-3.0
      </a>{' '}
    </>
  ),
};

export const unprocessedMessagesBadgeAttributes: BadgeProps = {
  max: 99,
  title: 'Nombre de messages non-traités',
  color: 'error',
  sx: {
    display: 'inline-flex',
    alignItems: 'center',
    '& .MuiBadge-badge': {
      position: 'relative',
      transform: 'none',
      marginLeft: '0.5rem',
    },
  },
};
