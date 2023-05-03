'use client';

import {
  CaseAssignationPage,
  CaseAssignationPageProps,
} from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/cases/unassigned/CaseAssignationPage';

export default function Page(props: CaseAssignationPageProps) {
  return <CaseAssignationPage {...props} />;
}
