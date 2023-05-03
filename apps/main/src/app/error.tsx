'use client';

import { PublicLayout } from '@mediature/main/src/app/(public)/PublicLayout';
import { ErrorPage, error500Props } from '@mediature/ui/src/ErrorPage';

export function Error500({ error, reset }: { error: Error; reset: () => void }) {
  // TODO: integrate the Sentry report logic
  console.error(error);

  return (
    <>
      <PublicLayout>
        <ErrorPage {...error500Props} />
      </PublicLayout>
    </>
  );
}

export default Error500;
