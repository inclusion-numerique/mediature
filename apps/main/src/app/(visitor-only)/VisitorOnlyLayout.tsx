'use client';

import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';

import { PublicLayout } from '@mediature/main/src/app/(public)/PublicLayout';
import { useSession } from '@mediature/main/src/proxies/next-auth/react';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';

export function VisitorOnlyLayout(props: PropsWithChildren) {
  const sessionWrapper = useSession();
  const router = useRouter();

  useEffect(() => {
    if (sessionWrapper.status === 'authenticated') {
      // TODO: this shows the children during a few ms... maybe the condition should be inside the useEffect too?
      // or find a better hook than triggers ASAP without making React throwing error because it's currently rendering
      // ... for now I just fixed it by forcing skeleton also when "authenticated" is true in the re-render
      router.push(linkRegistry.get('dashboard', undefined));
    }
  }, [router, sessionWrapper.status]);

  if (sessionWrapper.status !== 'unauthenticated') {
    return <LoadingArea ariaLabelTarget="contenu" />;
  }

  // Take as layout the public one
  return (
    <>
      <PublicLayout>{props.children}</PublicLayout>
    </>
  );
}
