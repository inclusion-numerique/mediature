'use client';

import {
  AuthorityComponentsEditPage,
  AuthorityComponentsEditPageProps,
} from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/components/edit/AuthorityComponentsEditPage';

export default function Page(props: AuthorityComponentsEditPageProps) {
  return <AuthorityComponentsEditPage {...props} />;
}
