'use client';

import { AgentListPage, AgentListPageProps } from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/agent/list/AgentListPage';

export default function Page(props: AgentListPageProps) {
  return <AgentListPage {...props} />;
}
