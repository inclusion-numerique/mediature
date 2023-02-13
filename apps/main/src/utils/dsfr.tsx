import { headerFooterDisplayItem } from '@codegouvfr/react-dsfr/Display';
import { HeaderProps } from '@codegouvfr/react-dsfr/Header';
import type { DefaultColorScheme } from '@codegouvfr/react-dsfr/next-appdir';
import { EventEmitter } from 'eventemitter3';

import { HeaderAuthoritySwitchItem, HeaderAuthoritySwitchItemProps } from '@mediature/main/src/components/HeaderAuthoritySwitchItem';
import { HeaderUserItem } from '@mediature/main/src/components/HeaderUserItem';
import { PublicFacingAuthoritySchemaType } from '@mediature/main/src/models/entities/authority';
import { TokenUserSchemaType } from '@mediature/main/src/models/entities/user';

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
