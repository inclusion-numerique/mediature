'use client';

import { PropsWithChildren } from 'react';

import { PrivateLayout } from '@mediature/main/src/app/(private)/PrivateLayout';

export default function Layout(props: PropsWithChildren) {
  return <PrivateLayout>{props.children}</PrivateLayout>;
}
