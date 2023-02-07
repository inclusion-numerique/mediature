'use client';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Button, Grid, Typography } from '@mui/material';
import NextLink from 'next/link';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { centeredAlertContainerGridProps, centeredContainerGridProps, ulComponentResetStyles } from '@mediature/main/src/utils/grid';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';
import { AgentCard } from '@mediature/ui/src/AgentCard';
import { ErrorAlert } from '@mediature/ui/src/ErrorAlert';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';

export interface AgentListPageProps {
  params: { authorityId: string };
}

export function AgentListPage({ params: { authorityId } }: AgentListPageProps) {
  const removeAgent = trpc.removeAgent.useMutation();

  const removeAgentAction = async (agentId: string) => {
    const result = await removeAgent.mutateAsync({
      authorityId: authorityId,
      agentId: agentId,
    });
  };

  const { data, error, isInitialLoading, isLoading, refetch } = trpc.listAgents.useQuery({
    orderBy: {},
    filterBy: {
      authorityIds: [authorityId],
    },
  });

  const agentsWrappers = data?.agentsWrappers || [];

  if (error) {
    return (
      <Grid container {...centeredAlertContainerGridProps}>
        <ErrorAlert errors={[error]} refetchs={[refetch]} />
      </Grid>
    );
  } else if (isLoading) {
    return <LoadingArea ariaLabelTarget="page" />;
  }

  return (
    <>
      <Grid container {...centeredContainerGridProps}>
        <Grid container spacing={1} sx={{ pb: 3 }}>
          <Grid item xs={12} md={7} sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography component="h1" variant="h5">
              Mon équipe de médiateurs
            </Typography>
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
            <Button
              component={NextLink}
              href={linkRegistry.get('addAgentToAuthority', { authorityId: authorityId })}
              size="large"
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
            >
              Ajouter un médiateur
            </Button>
          </Grid>
        </Grid>
        <Grid container component="ul" spacing={3} sx={ulComponentResetStyles}>
          {agentsWrappers.map((agentWrapper) => (
            <Grid key={agentWrapper.agent.id} item component="li" xs={12} sm={6}>
              <AgentCard
                agent={agentWrapper.agent}
                openCases={agentWrapper.openCases}
                closeCases={agentWrapper.closeCases}
                removeAction={() => removeAgentAction(agentWrapper.agent.id)}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </>
  );
}
