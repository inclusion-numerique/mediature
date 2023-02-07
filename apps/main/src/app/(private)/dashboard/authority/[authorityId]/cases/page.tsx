'use client';

import { CaseListPage, CaseListPageProps } from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/cases/CaseListPage';

export default function Page(props: CaseListPageProps) {
  return <CaseListPage {...props} />;
}
