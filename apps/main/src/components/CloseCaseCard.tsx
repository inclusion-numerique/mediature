'use client';

import { fr } from '@codegouvfr/react-dsfr';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PropsWithChildren, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { UpdateCaseSchemaType } from '@mediature/main/src/models/actions/case';
import { CaseOutcomeSchema, CaseOutcomeSchemaType, CaseSchemaType } from '@mediature/main/src/models/entities/case';
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
    setValue,
    control,
  } = props.wrapperForm;

  return (
    <Card
      variant="outlined"
      sx={{
        backgroundColor: fr.colors.decisions.background.alt.yellowMoutarde.default,
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
                        Êtes-vous sûr de vouloir réouvrir le dossier ?
                        <br />
                        <br />
                        <Typography component="span" sx={{ fontStyle: 'italic' }}>
                          Dans le cas d&apos;une simple modification de texte vous pouvez manipuler le dossier même s&apos;il est fermé.
                        </Typography>
                      </>
                    ),
                    onConfirm: async () => {
                      await props.closeAction(false);
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
                          slotProps={{
                            textField: {
                              fullWidth: true,
                            },
                          }}
                        />
                      </div>
                    </Tooltip>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Type de clôture"
                    defaultValue={control._defaultValues.outcome || ''}
                    onChange={(event) => {
                      setValue('outcome', event.target.value === '' ? null : (event.target.value as CaseOutcomeSchemaType), {
                        // shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    error={!!errors.outcome}
                    helperText={errors.outcome?.message}
                    fullWidth
                  >
                    <MenuItem value="">
                      <em>Non spécifié</em>
                    </MenuItem>
                    {Object.values(CaseOutcomeSchema.Values).map((outcome) => (
                      <MenuItem key={outcome} value={outcome}>
                        {t(`model.case.outcome.enum.${outcome}`)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Accord des parties ?"
                    defaultValue={control._defaultValues.collectiveAgreement || ''}
                    onChange={(event) => {
                      setValue('collectiveAgreement', event.target.value === '' ? null : event.target.value === 'true', {
                        // shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    error={!!errors.collectiveAgreement}
                    helperText={errors.collectiveAgreement?.message}
                    fullWidth
                  >
                    <MenuItem value="">
                      <em>Non spécifié</em>
                    </MenuItem>
                    <MenuItem value="true">{t('boolean.true')}</MenuItem>
                    <MenuItem value="false">{t('boolean.false')}</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Poursuite au tribunal administratif ?"
                    defaultValue={control._defaultValues.administrativeCourtNext || ''}
                    onChange={(event) => {
                      setValue('administrativeCourtNext', event.target.value === '' ? null : event.target.value === 'true', {
                        // shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    error={!!errors.administrativeCourtNext}
                    helperText={errors.administrativeCourtNext?.message}
                    fullWidth
                  >
                    <MenuItem value="">
                      <em>Non spécifié</em>
                    </MenuItem>
                    <MenuItem value="true">{t('boolean.true')}</MenuItem>
                    <MenuItem value="false">{t('boolean.false')}</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Résultat final (note interne)"
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
                                Le requérant sera notifié de la fermeture du dossier.
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
