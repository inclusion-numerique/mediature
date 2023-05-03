'use client';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { InvitationList } from '@mediature/main/src/components/InvitationList';
import { InvitationStatusSchema } from '@mediature/main/src/models/entities/invitation';
import { centeredAlertContainerGridProps, centeredContainerGridProps, ulComponentResetStyles } from '@mediature/main/src/utils/grid';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';
import { AggregatedQueries } from '@mediature/main/src/utils/trpc';
import { AgentCard } from '@mediature/ui/src/AgentCard';
import { ErrorAlert } from '@mediature/ui/src/ErrorAlert';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';

export interface AgentListPageProps {
  params: { authorityId: string };
}

export function AgentListPage({ params: { authorityId } }: AgentListPageProps) {
  const removeAgent = trpc.removeAgent.useMutation();
  const grantMainAgent = trpc.grantMainAgent.useMutation();

  const removeAgentAction = async (agentId: string) => {
    await removeAgent.mutateAsync({
      authorityId: authorityId,
      agentId: agentId,
    });
  };

  const grantMainAgentAction = async (agentId: string) => {
    await grantMainAgent.mutateAsync({
      authorityId: authorityId,
      agentId: agentId,
    });
  };

  const listAgents = trpc.listAgents.useQuery({
    orderBy: {},
    filterBy: {
      authorityIds: [authorityId],
    },
  });

  const listAgentInvitations = trpc.listAgentInvitations.useQuery({
    orderBy: {},
    filterBy: {
      authorityIds: [authorityId],
      status: InvitationStatusSchema.Values.PENDING,
    },
  });

  const aggregatedQueries = new AggregatedQueries(listAgents, listAgentInvitations);

  const agentsWrappers = listAgents.data?.agentsWrappers || [];
  const invitations = listAgentInvitations.data?.invitations || [];

  if (aggregatedQueries.hasError) {
    return (
      <Grid container {...centeredAlertContainerGridProps}>
        <ErrorAlert errors={aggregatedQueries.errors} refetchs={aggregatedQueries.refetchs} />
      </Grid>
    );
  } else if (aggregatedQueries.isLoading) {
    return <LoadingArea ariaLabelTarget="page" />;
  }

  return (
    <>
      <Grid container {...centeredContainerGridProps} alignContent="flex-start">
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
        {agentsWrappers.length ? (
          <Grid container component="ul" spacing={3} sx={ulComponentResetStyles}>
            {agentsWrappers.map((agentWrapper) => (
              <Grid key={agentWrapper.agent.id} item component="li" xs={12} sm={6}>
                <AgentCard
                  agent={agentWrapper.agent}
                  openCases={agentWrapper.openCases}
                  closeCases={agentWrapper.closeCases}
                  removeAction={() => removeAgentAction(agentWrapper.agent.id)}
                  grantMainAgentAction={() => grantMainAgentAction(agentWrapper.agent.id)}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Typography variant="body2">Aucun médiateur n&apos;est pour l&apos;instant dans cette collectivité</Typography>
          </Grid>
        )}
        {!!invitations.length && (
          <>
            <Grid item xs={12} sx={{ py: 3 }}>
              <Typography component="h2" variant="h6">
                Invitations en cours
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <InvitationList invitations={invitations} />
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
}
