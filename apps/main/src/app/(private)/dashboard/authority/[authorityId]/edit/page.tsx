'use client';

import {
  AuthorityEditPage,
  AuthorityEditPageProps,
} from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/edit/AuthorityEditPage';

export default function Page(props: AuthorityEditPageProps) {
  return <AuthorityEditPage {...props} />;
}
