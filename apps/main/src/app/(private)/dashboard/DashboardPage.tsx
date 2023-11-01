'use client';

import Button from '@mui/lab/LoadingButton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import admin1 from '@mediature/main/public/assets/dashboard/quick-access/admin_1.png';
import admin2 from '@mediature/main/public/assets/dashboard/quick-access/admin_2.png';
import agent1 from '@mediature/main/public/assets/dashboard/quick-access/agent_1.png';
import { trpc } from '@mediature/main/src/client/trpcClient';
import { ErrorAlert } from '@mediature/main/src/components/ErrorAlert';
import { LoadingArea } from '@mediature/main/src/components/LoadingArea';
import { QuickAccessCard } from '@mediature/main/src/components/QuickAccessCard';
import { useLiveChat } from '@mediature/main/src/components/live-chat/useLiveChat';
import { centeredAlertContainerGridProps } from '@mediature/main/src/utils/grid';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

export interface DashboardPageProps {}

export function DashboardPage(props: DashboardPageProps) {
  const { showLiveChat, isLiveChatLoading } = useLiveChat();

  const { data, error, isLoading, refetch } = trpc.getInterfaceSession.useQuery({});

  if (isLoading) {
    return <LoadingArea ariaLabelTarget="contenu" />;
  } else if (error) {
    return (
      <Grid container {...centeredAlertContainerGridProps}>
        <ErrorAlert errors={[error]} refetchs={[refetch]} />
      </Grid>
    );
  }

  const userInterfaceSession = data.session;

  // Give priority if any authority bound... if also an admin he still has the menu to navigate
  if (userInterfaceSession.agentOf.length) {
    return (
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 3,
        }}
      >
        <Typography component="h1" variant="h4" sx={{ textAlign: 'center', mt: 1, mb: { xs: 2, sm: 4 } }}>
          Quelle collectivité voulez-vous gérer ?
        </Typography>
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          {userInterfaceSession.agentOf.map((authority) => {
            return (
              <Grid key={authority.id} item xs={10} sm={6} md={5} lg={4}>
                <QuickAccessCard
                  image={authority.logo?.url || agent1}
                  imageAlt=""
                  link={linkRegistry.get('authority', {
                    authorityId: authority.id,
                  })}
                  text={authority.name}
                />
              </Grid>
            );
          })}
        </Grid>
      </Container>
    );
  } else if (userInterfaceSession.isAdmin) {
    return (
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 3,
        }}
      >
        <Typography component="h1" variant="h4" sx={{ textAlign: 'center', mt: 1, mb: { xs: 2, sm: 4 } }}>
          Que voulez-vous administrer ?
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={10} sm={6} md={5} lg={4}>
            <QuickAccessCard image={admin1} imageAlt="" link={linkRegistry.get('authorityList', undefined)} text="Gérer les collectivités" />
          </Grid>
          <Grid item xs={10} sm={6} md={5} lg={4}>
            <QuickAccessCard image={admin2} imageAlt="" link={linkRegistry.get('authorityCreation', undefined)} text="Ajouter une collectivité" />
          </Grid>
        </Grid>
      </Container>
    );
  } else {
    // Simple user no longer agent nor admin but still has access
    return (
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 3,
        }}
      >
        <Grid container sx={{ justifyContent: 'center' }}>
          <Typography component="h1" variant="h4" sx={{ textAlign: 'center', py: 2 }}>
            Bienvenue sur la plateforme !
          </Typography>
          <Typography component="p" variant="body2" sx={{ textAlign: 'center', py: 2 }}>
            Vous n&apos;avez actuellement aucun accès spécifique à la plateforme. Veuillez vous rapprocher de votre médiateur principal ou nous
            contacter par la messagerie.
          </Typography>
          <Button onClick={showLiveChat} loading={isLiveChatLoading} size="large" variant="contained">
            Ouvrir la messagerie
          </Button>
        </Grid>
      </Container>
    );
  }
}
