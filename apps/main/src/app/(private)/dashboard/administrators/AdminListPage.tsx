'use client';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { AdminList } from '@mediature/main/src/components/AdminList';
import { InvitationList } from '@mediature/main/src/components/InvitationList';
import { InvitationStatusSchema } from '@mediature/main/src/models/entities/invitation';
import { centeredAlertContainerGridProps, centeredContainerGridProps } from '@mediature/main/src/utils/grid';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';
import { AggregatedQueries } from '@mediature/main/src/utils/trpc';
import { ErrorAlert } from '@mediature/ui/src/ErrorAlert';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';

export interface AdminListPageProps {
  params: {};
}

export function AdminListPage(props: AdminListPageProps) {
  const listAdmins = trpc.listAdmins.useQuery({
    orderBy: {},
    filterBy: {},
  });

  const listAdminInvitations = trpc.listAdminInvitations.useQuery({
    orderBy: {},
    filterBy: {
      status: InvitationStatusSchema.Values.PENDING,
    },
  });

  const aggregatedQueries = new AggregatedQueries(listAdmins, listAdminInvitations);

  const admins = listAdmins.data?.admins || [];
  const invitations = listAdminInvitations.data?.invitations || [];

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
      <Grid container {...centeredContainerGridProps}>
        <Grid container spacing={1} sx={{ pb: 3 }}>
          <Grid item xs={12} md={7} sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography component="h1" variant="h5">
              Les administrateurs de la plateforme
            </Typography>
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
            <Button
              component={NextLink}
              href={linkRegistry.get('addAdmin', undefined)}
              size="large"
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
            >
              Ajouter un administrateur
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <AdminList admins={admins} />
        </Grid>
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
