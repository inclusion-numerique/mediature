'use client';

import { Alert, Card, CardContent, Grid, Typography } from '@mui/material';
import Image from 'next/image';

import { AgentSchemaType } from '@mediature/main/src/models/entities/agent';
import { AuthoritySchemaType } from '@mediature/main/src/models/entities/authority';

export interface AuthorityCardProps {
  authority: AuthoritySchemaType;
  mainAgent: AgentSchemaType | null;
  agents: AgentSchemaType[] | null;
  openCases: number;
  closeCases: number;
}

export function AuthorityCard(props: AuthorityCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Grid container direction={'column'} spacing={2}>
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={2}>
              {!!props.authority.logo && (
                <Grid item>
                  <Image src={props.authority.logo} alt="" width={50} height={30} style={{ objectFit: 'contain' }} />
                </Grid>
              )}
              <Grid item>
                <Typography variant="h4">{props.authority.name}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Alert severity="info" icon={false}>
              <Grid container spacing={2}>
                {/* TODO: the subcomponent of the alert should be "width: 100%" */}
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
                <Typography sx={{ fontWeight: 'bold' }}>Responsable médiateur :</Typography> {props.mainAgent.firstname} {props.mainAgent.lastname}
              </>
            ) : (
              <>Aucun responsable médiateur</>
            )}
          </Grid>
          <Grid item xs={12}>
            {!!props.agents && props.agents.length ? (
              <>
                <Typography sx={{ fontWeight: 'bold' }}>Liste des médiateurs :</Typography>
                <Grid container spacing={1}>
                  {props.agents.map((agent) => (
                    <Grid item xs={12} sm={6}>
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
