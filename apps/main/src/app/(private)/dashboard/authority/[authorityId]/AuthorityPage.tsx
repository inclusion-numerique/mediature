'use client';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

import agent1 from '@mediature/main/public/assets/dashboard/quick-access/agent_1.png';
import agent2 from '@mediature/main/public/assets/dashboard/quick-access/agent_2.png';
import agent3 from '@mediature/main/public/assets/dashboard/quick-access/agent_3.png';
import { trpc } from '@mediature/main/src/client/trpcClient';
import { centeredAlertContainerGridProps } from '@mediature/main/src/utils/grid';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';
import { ErrorAlert } from '@mediature/ui/src/ErrorAlert';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';
import { QuickAccessCard } from '@mediature/ui/src/QuickAccessCard';

export interface AuthorityPageProps {
  params: { authorityId: string };
}

export function AuthorityPage({ params: { authorityId } }: AuthorityPageProps) {
  const { data, error, isLoading, refetch } = trpc.getAuthority.useQuery({
    id: authorityId,
  });

  if (isLoading) {
    return <LoadingArea ariaLabelTarget="contenu" />;
  } else if (error) {
    return (
      <Grid container {...centeredAlertContainerGridProps}>
        <ErrorAlert errors={[error]} refetchs={[refetch]} />
      </Grid>
    );
  }

  const authority = data.authority;

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 3,
      }}
    >
      {!!authority.logo && (
        <Image
          src={authority.logo.url}
          width={300}
          height={100}
          alt="logo de la collectivité"
          style={{
            width: '100%',
            objectFit: 'contain',
            margin: '0 auto 20px',
          }}
        />
      )}
      <Typography component="h1" variant="h4" sx={{ textAlign: 'center', mt: 1, mb: { xs: 2, sm: 4 } }}>
        Que voulez-vous faire ?
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={10} sm={6} md={5} lg={4}>
          <QuickAccessCard
            image={agent1}
            imageAlt=""
            link={linkRegistry.get('requestToAuthority', {
              authority: authority.slug,
            })}
            text="Créer une demande"
          />
        </Grid>
        <Grid item xs={10} sm={6} md={5} lg={4}>
          <QuickAccessCard
            image={agent2}
            imageAlt=""
            link={linkRegistry.get('unassignedCaseList', {
              authorityId: authority.id,
            })}
            text="Attribuer un dossier"
          />
        </Grid>
        <Grid item xs={10} sm={6} md={5} lg={4}>
          <QuickAccessCard
            image={agent3}
            imageAlt=""
            link={linkRegistry.get('myCases', {
              authorityId: authority.id,
            })}
            text="Gérer mes dossiers"
          />
        </Grid>
      </Grid>
    </Container>
  );
}
