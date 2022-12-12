'use client';

import { PropsWithChildren } from 'react';

export default function PublicLayout(props: PropsWithChildren) {
  return <>{props.children}</>;
}
