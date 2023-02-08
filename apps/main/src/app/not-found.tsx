'use client';

import { PublicLayout } from '@mediature/main/src/app/(public)/PublicLayout';
import { ErrorPage, error404Props } from '@mediature/ui/src/ErrorPage';

export function Error404({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <PublicLayout>
        <ErrorPage {...error404Props} />
      </PublicLayout>
    </>
  );
}

export default Error404;
