'use client';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Button, Grid, Skeleton, Typography } from '@mui/material';
import NextLink from 'next/link';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { centeredContainerGridProps } from '@mediature/main/src/utils/grid';
import { AgentCard } from '@mediature/ui/src/AgentCard';

export interface AgentListPageProps {
  params: { authorityId: string };
}

export function AgentListPage({ params: { authorityId } }: AgentListPageProps) {
  const removeAgent = trpc.removeAgent.useMutation();

  const removeAgentAction = async (agentId: string) => {
    await removeAgent.mutateAsync({
      authorityId: authorityId,
      agentId: agentId,
    });

    // TODO: success message? And/or redirect?
  };

  const { data, error, isInitialLoading, isLoading } = trpc.listAgents.useQuery({
    orderBy: {},
    filterBy: {
      authorityIds: [authorityId],
    },
  });

  const agentsWrappers = data?.agentsWrappers || [];

  if (error) {
    return <span>Error TODO</span>;
  } else if (isInitialLoading) {
    return <span>Loading... TODO template</span>;
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
              href={`/dashboard/authority/${authorityId}/agent/add`}
              size="large"
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
            >
              Ajouter un médiateur
            </Button>
          </Grid>
        </Grid>
        {!isLoading ? (
          <Grid container spacing={3}>
            {agentsWrappers.map((agentWrapper) => (
              <Grid key={agentWrapper.agent.id} item xs={12} sm={6}>
                <AgentCard
                  agent={agentWrapper.agent}
                  openCases={agentWrapper.openCases}
                  closeCases={agentWrapper.closeCases}
                  removeAction={() => removeAgentAction(agentWrapper.agent.id)}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Skeleton />
        )}
      </Grid>
    </>
  );
}
