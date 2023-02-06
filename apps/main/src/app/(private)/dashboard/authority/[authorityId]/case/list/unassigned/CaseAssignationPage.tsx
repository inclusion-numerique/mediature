'use client';

import { Grid, Typography } from '@mui/material';
import { createContext, useContext } from 'react';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { UnassignedCaseSlider } from '@mediature/main/src/components/UnassignedCaseSlider';
import { wideContainerGridProps } from '@mediature/main/src/utils/grid';

export const CaseAssignationPageContext = createContext({
  ContextualUnassignedCaseSlider: UnassignedCaseSlider,
});

export interface CaseAssignationPageProps {
  params: { authorityId: string };
}

export function CaseAssignationPage({ params: { authorityId } }: CaseAssignationPageProps) {
  const { ContextualUnassignedCaseSlider } = useContext(CaseAssignationPageContext);

  const assignCase = trpc.assignCase.useMutation();

  const assignCaseAction = async (caseId: string) => {
    await assignCase.mutateAsync({
      caseId: caseId,
      agentIds: ['TODO'], // TODO: from here we should have the agentId of this user for this specific collectivity
    });

    // TODO: success message?
  };

  return (
    <>
      <Grid container sx={{ ...wideContainerGridProps.sx, px: 0 }}>
        <Grid
          container
          sx={{
            ...wideContainerGridProps.sx,
            py: 0,
            maxWidth: 'lg',
            mx: 'auto',
          }}
        >
          <Grid item xs={12} sx={{ pb: 3 }}>
            <Typography component="h1" variant="h5">
              Dossiers à attribuer
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <ContextualUnassignedCaseSlider authorityId={authorityId} assignAction={(caseId) => assignCaseAction(caseId)} />
        </Grid>
      </Grid>
    </>
  );
}
