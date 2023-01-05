'use client';

import { startReactDsfr } from '@codegouvfr/react-dsfr/next-appdir';
import Link from 'next/link';

import { defaultColorScheme } from '@mediature/main/src/utils/dsfr';

declare module '@codegouvfr/react-dsfr/next-appdir' {
  interface RegisterLink {
    Link: typeof Link;
  }
}

startReactDsfr({ defaultColorScheme, Link });

export default function StartDsfr() {
  return null;
}
