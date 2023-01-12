import { headerFooterDisplayItem } from '@codegouvfr/react-dsfr/Display';
import { HeaderProps } from '@codegouvfr/react-dsfr/Header';
import type { DefaultColorScheme } from '@codegouvfr/react-dsfr/next-appdir';
import { EventEmitter } from 'eventemitter3';

import { HeaderUserItem } from '@mediature/main/src/components/HeaderUserItem';
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

export const logoutQuickAccessItem = (user: TokenUserSchemaType): HeaderProps.QuickAccessItem => {
  const eventEmitter = new EventEmitter();

  return {
    iconId: undefined as any,
    buttonProps: {
      onClick: (event) => {
        eventEmitter.emit('click', event);
      },
    },
    text: <HeaderUserItem user={user} eventEmitter={eventEmitter} />,
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
