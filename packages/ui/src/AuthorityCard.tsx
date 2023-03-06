'use client';

import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import NextLink from 'next/link';

import { AgentSchemaType } from '@mediature/main/src/models/entities/agent';
import { AuthoritySchemaType } from '@mediature/main/src/models/entities/authority';
import { ulComponentResetStyles } from '@mediature/main/src/utils/grid';

export interface AuthorityCardProps {
  authority: AuthoritySchemaType;
  mainAgent: AgentSchemaType | null;
  agents: AgentSchemaType[] | null;
  openCases: number;
  closeCases: number;
  authorityAgentsManagementLink: string;
}

export function AuthorityCard(props: AuthorityCardProps) {
  const agentsExceptMainOne = props.agents ? props.agents.filter((agent) => agent.id !== props.mainAgent?.id) : null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Grid container direction={'column'} spacing={2}>
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={2}>
              {!!props.authority.logo && (
                <Grid item>
                  <Image src={props.authority.logo.url} alt="" width={50} height={30} style={{ objectFit: 'contain' }} />
                </Grid>
              )}
              <Grid item>
                <Link
                  component={NextLink}
                  href={props.authorityAgentsManagementLink}
                  variant="h5"
                  color="inherit"
                  underline="none"
                  style={{ fontWeight: 600 }}
                >
                  {props.authority.name}
                </Link>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Alert
              role="none"
              severity="info"
              icon={false}
              sx={{
                '& .MuiAlert-message': {
                  width: '100%',
                  textAlign: 'center',
                },
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  Dossiers en cours : {props.openCases}
                </Grid>
                <Grid item xs={12} sm={6}>
                  Dossiers clôs : {props.closeCases}
                </Grid>
              </Grid>
            </Alert>
          </Grid>
          <Grid item xs={12}>
            {!!props.mainAgent ? (
              <>
                <Typography sx={{ fontWeight: 'bold' }}>Médiateur principal :</Typography> {props.mainAgent.firstname} {props.mainAgent.lastname}
              </>
            ) : (
              <>Aucun médiateur principal</>
            )}
          </Grid>
          <Grid item xs={12}>
            {!!agentsExceptMainOne && agentsExceptMainOne.length ? (
              <>
                <Typography sx={{ fontWeight: 'bold' }}>Liste des médiateurs :</Typography>
                <Grid container component="ul" spacing={1} sx={ulComponentResetStyles}>
                  {agentsExceptMainOne.map((agent) => (
                    <Grid key={agent.id} item component="li" xs={12} sm={6}>
                      {agent.firstname} {agent.lastname}
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <>Aucun médiateur associé</>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
