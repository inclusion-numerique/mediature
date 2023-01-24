'use client';

import { useColors } from '@codegouvfr/react-dsfr/useColors';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Button, Card, CardContent, Chip, Divider, Grid, Typography, alpha } from '@mui/material';
import { format } from 'date-fns';
import { useConfirm } from 'material-ui-confirm';
import ShowMoreText from 'react-show-more-text';

import { CaseSchemaType } from '@mediature/main/src/models/entities/case';
import { CitizenSchemaType } from '@mediature/main/src/models/entities/citizen';
import { isReminderSoon } from '@mediature/main/src/utils/business/reminder';
import { ulComponentResetStyles } from '@mediature/main/src/utils/grid';
import { CaseStatusChip } from '@mediature/ui/src/CaseStatusChip';

export interface UnassignedCaseSliderCardProps {
  case: CaseSchemaType;
  citizen: CitizenSchemaType;
  assignAction: (caseId: string) => Promise<void>;
}

export function UnassignedCaseSliderCard(props: UnassignedCaseSliderCardProps) {
  const reminderSoon: boolean = props.case.termReminderAt ? isReminderSoon(props.case.termReminderAt) : false;

  const theme = useColors();

  const askAssignmentConfirmation = useConfirm();

  const assignAction = async (caseId: string) => {
    try {
      await askAssignmentConfirmation({
        description: (
          <>
            Voulez-vous vous attribuer le dossier de{' '}
            <Typography component="span" sx={{ fontWeight: 'bold' }}>
              {props.citizen.firstname} {props.citizen.lastname}
            </Typography>{' '}
            ?
          </>
        ),
      });
    } catch (e) {
      return;
    }

    await props.assignAction(caseId);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        position: 'relative',
        overflow: 'visible',
        backgroundColor: reminderSoon ? alpha(theme.decisions.background.actionLow.redMarianne.hover, 0.3) : undefined,
      }}
    >
      <CardContent>
        <Grid container direction={'column'} spacing={2}>
          <Grid item xs={12}>
            <Button
              onClick={() => {
                assignAction(props.case.id);
              }}
              size="large"
              variant="contained"
              fullWidth
            >
              S&apos;attribuer le dossier
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Divider variant="fullWidth" sx={{ p: 0 }} />
          </Grid>
          {!!props.case.termReminderAt && (
            <Grid item xs={12}>
              <Typography color="error">
                <Grid container direction="row" alignItems="center">
                  <AccessTimeIcon sx={{ mr: '5px' }} />
                  <span>Échéance : {format(props.case.termReminderAt, 'P')}</span>
                </Grid>
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Grid container spacing={2} sx={{ justifyContent: 'space-between' }}>
              <Grid item xs="auto" sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="b" variant="h4">
                  {props.citizen.firstname} {props.citizen.lastname}
                </Typography>
              </Grid>
              <Grid item sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
                <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Dossier n°{props.case.humanId}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {/* TODO: reminder field */}
            <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Avancement du dossier :
            </Typography>
            <br />
            <CaseStatusChip status={props.case.status} />
          </Grid>
          <Grid item xs={12}>
            <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Adresse :
            </Typography>
            <Typography variant="body1">TODO</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Téléphone :
            </Typography>
            <Typography variant="body1">TODO</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Email :
            </Typography>
            <Typography variant="body1">{props.citizen.email}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider variant="fullWidth" sx={{ p: 0 }} />
          </Grid>
          <Grid item xs={12}>
            <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Premier recours à l&apos;amiable ?
            </Typography>
            <br />
            {/* TODO: bool */}
            <Chip label={props.case.alreadyRequestedInThePast} />
          </Grid>
          {props.case.alreadyRequestedInThePast && (
            <Grid item xs={12}>
              <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Réponse de l&apos;organisme ?
              </Typography>
              <br />
              {/* TODO: bool */}
              <Chip label={props.case.gotAnswerFromPreviousRequest} />
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Motif de la demande :
            </Typography>
            <Typography
              component="span"
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                // fontFamily: 'auto', // TODO: it does not render properly on Storybook at first render probably since fonts are not loaded fully when rendering. Need to check into Next.js and see if a workaround is needed or not. "auto" is for example becasue it sets a basic font but it works directly
              }}
            >
              <ShowMoreText lines={4} more="Voir plus" less="Voir moins">
                {props.case.description}
              </ShowMoreText>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Documents :
            </Typography>
            <Grid container component="ul" direction="row" spacing={1} sx={ulComponentResetStyles}>
              <Grid item component="li">
                <Chip label="TODO.pdf" />
              </Grid>
              <Grid item component="li">
                <Chip label="TODO.pdf" />
              </Grid>
              <Grid item component="li">
                <Chip label="TODO.pdf" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
