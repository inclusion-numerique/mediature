'use client';

import { fr } from '@codegouvfr/react-dsfr';
import { useIsDark } from '@codegouvfr/react-dsfr/useIsDark';
import addressFormatter from '@fragaria/address-formatter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Alert from '@mui/material/Alert';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import ShowMoreText from 'react-show-more-text';

import { UiAttachmentSchemaType } from '@mediature/main/src/models/entities/attachment';
import { CaseSchemaType } from '@mediature/main/src/models/entities/case';
import { CitizenSchemaType } from '@mediature/main/src/models/entities/citizen';
import { isReminderSoon } from '@mediature/main/src/utils/business/reminder';
import { unprocessedMessagesBadgeAttributes } from '@mediature/main/src/utils/dsfr';
import { ulComponentResetStyles } from '@mediature/main/src/utils/grid';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';
import { CaseStatusChip } from '@mediature/ui/src/CaseStatusChip';
import { useSingletonConfirmationDialog } from '@mediature/ui/src/modal/useModal';
import { convertModelToGooglePhoneNumber } from '@mediature/ui/src/utils/phone';

const phoneNumberUtil = PhoneNumberUtil.getInstance();

export interface UnassignedCaseSliderCardProps {
  caseLink: string;
  case: CaseSchemaType;
  citizen: CitizenSchemaType;
  attachments: UiAttachmentSchemaType[];
  unprocessedMessages: number;
  similarCases: CaseSchemaType[];
  assignAction: (caseId: string) => Promise<void>;
}

export function UnassignedCaseSliderCard(props: UnassignedCaseSliderCardProps) {
  const { t } = useTranslation('common');

  const reminderSoon: boolean = props.case.termReminderAt ? isReminderSoon(props.case.termReminderAt) : false;

  const { isDark } = useIsDark();
  const theme = fr.colors.getHex({ isDark });

  const { showConfirmationDialog } = useSingletonConfirmationDialog();

  const assignAction = async (caseId: string) => {
    showConfirmationDialog({
      description: (
        <>
          Voulez-vous vous attribuer le dossier de{' '}
          <Typography component="span" sx={{ fontWeight: 'bold' }} data-sentry-mask>
            {props.citizen.firstname} {props.citizen.lastname}
          </Typography>{' '}
          ?
        </>
      ),
      onConfirm: async () => {
        await props.assignAction(caseId);
      },
    });
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
              <Typography component="div" color={isReminderSoon(props.case.termReminderAt) ? 'error' : 'primary'}>
                <Grid container direction="row" alignItems="center">
                  <AccessTimeIcon sx={{ mr: '5px' }} />
                  <span data-sentry-mask>Échéance : {t('date.short', { date: props.case.termReminderAt })}</span>
                </Grid>
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Grid container spacing={2} sx={{ justifyContent: 'space-between' }} data-sentry-mask>
              <Grid item xs="auto" sx={{ display: 'flex', alignItems: 'center' }}>
                <Link component={NextLink} href={props.caseLink} variant="h5" color="inherit" underline="none" style={{ fontWeight: 600 }}>
                  {props.citizen.firstname} {props.citizen.lastname}
                </Link>
              </Grid>
              <Grid item sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
                <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Dossier n°{props.case.humanId}
                  {!!props.unprocessedMessages && props.unprocessedMessages > 0 && (
                    <Badge {...unprocessedMessagesBadgeAttributes} badgeContent={props.unprocessedMessages} />
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {props.similarCases?.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t('components.UnassignedCaseSliderCard.case_has_similar', { count: props.similarCases.length })}
                <ul>
                  {props.similarCases.map((similarCase) => {
                    const similarCaseLink = linkRegistry.get('case', {
                      authorityId: similarCase.authorityId,
                      caseId: similarCase.id,
                    });

                    return (
                      <li key={similarCase.id}>
                        <Link
                          component={NextLink}
                          href={similarCaseLink}
                          target="_blank"
                          color="inherit"
                          underline="none"
                          style={{ fontWeight: 600 }}
                          data-sentry-mask
                        >
                          Dossier n°{similarCase.humanId}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Alert>
            )}
            {/* TODO: reminder field */}
            <Typography component="div" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Avancement du dossier :
            </Typography>
            <br />
            <CaseStatusChip status={props.case.status} />
          </Grid>
          <Grid item xs={12}>
            <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Adresse :
            </Typography>
            <Typography variant="body1" data-sentry-mask>
              {props.citizen.address
                ? addressFormatter.format({
                    street: props.citizen.address.street,
                    city: props.citizen.address.city,
                    postcode: props.citizen.address.postalCode,
                    state: props.citizen.address.subdivision,
                    countryCode: props.citizen.address.countryCode,
                  })
                : '-'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Téléphone :
            </Typography>
            <Typography variant="body1" data-sentry-mask>
              {props.citizen.phone ? phoneNumberUtil.format(convertModelToGooglePhoneNumber(props.citizen.phone), PhoneNumberFormat.NATIONAL) : '-'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Email :
            </Typography>
            <Typography variant="body1" data-sentry-mask>
              {props.citizen.email || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider variant="fullWidth" sx={{ p: 0 }} />
          </Grid>
          {props.case.alreadyRequestedInThePast !== null && (
            <Grid item xs={12}>
              <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Premier recours à l&apos;amiable ?
              </Typography>
              <br />
              <Chip label={props.case.alreadyRequestedInThePast ? t('boolean.true') : t('boolean.false')} data-sentry-mask />
            </Grid>
          )}
          {props.case.alreadyRequestedInThePast && props.case.gotAnswerFromPreviousRequest !== null && (
            <Grid item xs={12}>
              <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Réponse de l&apos;organisme ?
              </Typography>
              <br />
              <Chip label={props.case.gotAnswerFromPreviousRequest ? t('boolean.true') : t('boolean.false')} data-sentry-mask />
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Motif de la demande :
            </Typography>
            <Typography
              component="div"
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word', // Needed in case of word/sentence bigger than parent width
                // fontFamily: 'auto', // TODO: it does not render properly on Storybook at first render probably since fonts are not loaded fully when rendering. Need to check into Next.js and see if a workaround is needed or not. "auto" is for example becasue it sets a basic font but it works directly
              }}
              data-sentry-mask
            >
              <ShowMoreText lines={4} more="Voir plus" less="Voir moins">
                {props.case.description}
              </ShowMoreText>
            </Typography>
          </Grid>
          {props.attachments.length > 0 && (
            <Grid item xs={12}>
              <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Documents :
              </Typography>
              <Grid container component="ul" direction="row" spacing={1} sx={ulComponentResetStyles}>
                {props.attachments.map((attachment) => {
                  return (
                    <Grid key={attachment.id} item component="li">
                      <Chip label={attachment.name as string} data-sentry-mask />
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
