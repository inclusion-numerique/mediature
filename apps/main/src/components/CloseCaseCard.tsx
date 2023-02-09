'use client';

import { useColors } from '@codegouvfr/react-dsfr/useColors';
import { Button, Card, CardContent, Collapse, Grid, TextField, Tooltip, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { PropsWithChildren, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { UpdateCaseSchemaType } from '@mediature/main/src/models/actions/case';
import { CaseSchemaType } from '@mediature/main/src/models/entities/case';
import { useSingletonConfirmationDialog } from '@mediature/ui/src/modal/useModal';

export interface CloseCaseCardProps {
  case: CaseSchemaType;
  wrapperForm: UseFormReturn<UpdateCaseSchemaType>;
  closeAction: (value: boolean) => Promise<void>;
}

export function CloseCaseCard(props: PropsWithChildren<CloseCaseCardProps>) {
  const { t } = useTranslation('common');

  const [closeAreaExpanded, setCloseAreaExpanded] = useState<boolean>(!!props.case.closedAt);

  const { showConfirmationDialog } = useSingletonConfirmationDialog();

  const {
    register,
    formState: { errors },
  } = props.wrapperForm;

  const theme = useColors();

  return (
    <Card
      variant="outlined"
      sx={{
        backgroundColor: theme.decisions.background.alt.yellowMoutarde.default,
      }}
    >
      <CardContent>
        <Grid container direction={'column'} spacing={2}>
          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography component="span" variant="h6">
              Clôture du dossier
            </Typography>
            {!closeAreaExpanded && (
              <Button onClick={() => setCloseAreaExpanded(true)} size="large" variant="contained" sx={{ ml: 'auto' }}>
                Renseigner une conclusion
              </Button>
            )}
            {!!props.case.closedAt && (
              <Button
                onClick={async () => {
                  showConfirmationDialog({
                    description: (
                      <>
                        Êtes-vous vous sûr de vouloir réouvrir le dossier ?
                        <br />
                        <br />
                        <Typography component="span" sx={{ fontStyle: 'italic' }}>
                          Dans le cas d&apos;une simple modification de texte vous pouvez manipuler le dossier même s&apos;il est fermé.
                        </Typography>
                      </>
                    ),
                    onConfirm: async () => {
                      await props.closeAction(true);
                    },
                  });
                }}
                color="error"
                size="large"
                variant="text"
                sx={{ ml: 'auto' }}
              >
                Réouvrir le dossier
              </Button>
            )}
          </Grid>
          <Grid item xs={12}>
            <Collapse in={closeAreaExpanded}>
              <Grid container direction="column" spacing={2}>
                {!!props.case.closedAt && (
                  <Grid item xs={12}>
                    <Tooltip title={t('date.longWithTime', { date: props.case.closedAt })}>
                      <div>
                        <DatePicker
                          label="Date de clôture"
                          readOnly
                          value={props.case.closedAt}
                          onChange={(newValue) => {}}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                      </div>
                    </Tooltip>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    label="Raisons de la décision (note interne)"
                    {...register('finalConclusion')}
                    error={!!errors.finalConclusion}
                    helperText={errors?.finalConclusion?.message}
                    multiline
                    minRows={5}
                    maxRows={10}
                    fullWidth
                  />
                </Grid>
                {!props.case.closedAt && (
                  <Grid item xs={12}>
                    <Button
                      onClick={async () => {
                        showConfirmationDialog({
                          description: (
                            <>
                              Êtes-vous sûr de vouloir clôturer ce dossier ?
                              <br />
                              <br />
                              <Typography component="span" sx={{ fontStyle: 'italic' }}>
                                Le requérant sera notifié de la fermerture du dossier.
                              </Typography>
                            </>
                          ),
                          onConfirm: async () => {
                            await props.closeAction(true);
                          },
                        });
                      }}
                      size="large"
                      variant="contained"
                      fullWidth
                    >
                      Clôturer le dossier
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Collapse>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
