'use client';

import { fr } from '@codegouvfr/react-dsfr';
import { zodResolver } from '@hookform/resolvers/zod';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import SaveIcon from '@mui/icons-material/Save';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import Button from '@mui/lab/LoadingButton';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useMemo, useRef, useState } from 'react';
import { createContext, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AddNoteForm } from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/case/[caseId]/AddNoteForm';
import { trpc } from '@mediature/main/src/client/trpcClient';
import { BaseForm } from '@mediature/main/src/components/BaseForm';
import { CaseCompetentThirdPartyField } from '@mediature/main/src/components/CaseCompetentThirdPartyField';
import { CaseDomainField } from '@mediature/main/src/components/CaseDomainField';
import { CloseCaseCard } from '@mediature/main/src/components/CloseCaseCard';
import { FileList } from '@mediature/main/src/components/FileList';
import { NoteCard } from '@mediature/main/src/components/NoteCard';
import { Messenger } from '@mediature/main/src/components/messenger/Messenger';
import { Uploader } from '@mediature/main/src/components/uploader/Uploader';
import { UpdateCaseSchema, UpdateCaseSchemaType, updateCaseAttachmentsMax } from '@mediature/main/src/models/actions/case';
import { AttachmentKindSchema, UiAttachmentSchemaType } from '@mediature/main/src/models/entities/attachment';
import { CaseAttachmentTypeSchema, CasePlatformSchema, CaseStatusSchema, CaseStatusSchemaType } from '@mediature/main/src/models/entities/case';
import { CitizenGenderIdentitySchema, CitizenGenderIdentitySchemaType } from '@mediature/main/src/models/entities/citizen';
import { PhoneInputSchemaType, PhoneTypeSchema, PhoneTypeSchemaType } from '@mediature/main/src/models/entities/phone';
import { notFound } from '@mediature/main/src/proxies/next/navigation';
import { attachmentKindList } from '@mediature/main/src/utils/attachment';
import { isReminderSoon } from '@mediature/main/src/utils/business/reminder';
import { unprocessedMessagesBadgeAttributes } from '@mediature/main/src/utils/dsfr';
import { centeredAlertContainerGridProps, centeredContainerGridProps, ulComponentResetStyles } from '@mediature/main/src/utils/grid';
import { CaseStatusChip } from '@mediature/ui/src/CaseStatusChip';
import { ErrorAlert } from '@mediature/ui/src/ErrorAlert';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';
import { PhoneField, getDefaultPhoneValue } from '@mediature/ui/src/PhoneField';

export const CasePageContext = createContext({
  ContextualNoteCard: NoteCard,
  ContextualAddNoteForm: AddNoteForm,
  ContextualUploader: Uploader,
  ContextualCaseDomainField: CaseDomainField,
  ContextualCaseCompetentThirdPartyField: CaseCompetentThirdPartyField,
  ContextualMessenger: Messenger,
});

export interface CasePageProps {
  params: {
    authorityId: string;
    caseId: string;
  };
}

export function CasePage({ params: { authorityId, caseId } }: CasePageProps) {
  const { t } = useTranslation('common');
  const {
    ContextualNoteCard,
    ContextualAddNoteForm,
    ContextualUploader,
    ContextualCaseDomainField,
    ContextualCaseCompetentThirdPartyField,
    ContextualMessenger,
  } = useContext(CasePageContext);

  const { data, error, isInitialLoading, isLoading, refetch } = trpc.getCase.useQuery({
    id: caseId,
  });

  const caseWrapper = data?.caseWrapper;

  const updateCase = trpc.updateCase.useMutation();
  const addAttachmentToCase = trpc.addAttachmentToCase.useMutation();
  const removeAttachmentFromCase = trpc.removeAttachmentFromCase.useMutation();
  const generatePdfFromCase = trpc.generatePdfFromCase.useMutation();

  const form = useForm<UpdateCaseSchemaType>({
    resolver: zodResolver(UpdateCaseSchema),
    defaultValues: {},
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    control,
    reset,
    watch,
  } = form;

  useMemo(() => {
    // In case of a new getter fetch we adjust update to new values in case someone else modified the case
    // This will happen only if no change are pending

    if (isDirty) {
      return;
    }

    reset({
      caseId: caseWrapper?.case.id,
      initiatedFrom: caseWrapper?.case.initiatedFrom,
      close: !!caseWrapper?.case.closedAt,
      status: caseWrapper?.case.status,
      email: caseWrapper?.citizen.email,
      firstname: caseWrapper?.citizen.firstname,
      lastname: caseWrapper?.citizen.lastname,
      genderIdentity: caseWrapper?.citizen.genderIdentity,
      address: caseWrapper?.citizen.address
        ? {
            street: caseWrapper?.citizen.address.street,
            city: caseWrapper?.citizen.address.city,
            postalCode: caseWrapper?.citizen.address.postalCode,
          }
        : {
            street: '',
            city: '',
            postalCode: '',
          },
      phone: caseWrapper?.citizen.phone
        ? {
            phoneType: caseWrapper?.citizen.phone.phoneType,
            callingCode: caseWrapper?.citizen.phone.callingCode,
            countryCode: caseWrapper?.citizen.phone.countryCode,
            number: caseWrapper?.citizen.phone.number,
          }
        : getDefaultPhoneValue(),
      alreadyRequestedInThePast: caseWrapper?.case.alreadyRequestedInThePast,
      gotAnswerFromPreviousRequest: caseWrapper?.case.gotAnswerFromPreviousRequest,
      description: caseWrapper?.case.description,
      domainId: caseWrapper?.case.domain?.id || null,
      competent: caseWrapper?.case.competent,
      competentThirdPartyId: caseWrapper?.case.competentThirdParty?.id || null,
      units: caseWrapper?.case.units,
      termReminderAt: caseWrapper?.case.termReminderAt,
      faceToFaceMediation: caseWrapper?.case.faceToFaceMediation,
      outcome: caseWrapper?.case.outcome,
      collectiveAgreement: caseWrapper?.case.collectiveAgreement,
      administrativeCourtNext: caseWrapper?.case.administrativeCourtNext,
      finalConclusion: caseWrapper?.case.finalConclusion,
      nextRequirements: caseWrapper?.case.nextRequirements,
    });
  }, [caseWrapper, isDirty, reset]);

  const reminderAnchorRef = useRef<HTMLButtonElement | null>(null);
  const [reminderMinimumDate, setReminderMinimumDate] = useState<Date>(new Date());
  const [reminderPickerOpen, setReminderPickerOpen] = useState<boolean>(false);
  const mainContainerRef = useRef<HTMLDivElement | null>(null); // This is used to scroll to the error messages
  const [manualSubmitError, setManualSubmitError] = useState<Error | null>(null);
  const [pdfGenerationError, setPdfGenerationError] = useState<Error | null>(null);

  const [addNoteModalOpen, setAddNoteModalOpen] = useState<boolean>(false);
  const handeOpenAddNoteModal = () => {
    setAddNoteModalOpen(true);
  };
  const handleCloseAddNoteModal = () => {
    setAddNoteModalOpen(false);
  };

  const [messengerModalOpen, setMessengerModalOpen] = useState<boolean>(false);
  const handeOpenMessengerModal = () => {
    setMessengerModalOpen(true);
  };
  const handleCloseMessengerModal = () => {
    setMessengerModalOpen(false);
  };

  const assignCase = trpc.assignCase.useMutation();

  if (error) {
    return (
      <Grid container {...centeredAlertContainerGridProps}>
        <ErrorAlert errors={[error]} refetchs={[refetch]} />
      </Grid>
    );
  } else if (isInitialLoading) {
    return <LoadingArea ariaLabelTarget="page" />;
  } else if (!caseWrapper || caseWrapper.case.authorityId !== authorityId) {
    return notFound();
  }

  const targetedCase = caseWrapper.case;
  const citizen = caseWrapper.citizen;
  const notes = caseWrapper.notes;
  const attachments = caseWrapper.attachments;
  const unprocessedMessages = caseWrapper.unprocessedMessages;

  const updateCaseAction = async (input: UpdateCaseSchemaType) => {
    const { caseWrapper: updatedCaseWrapper } = await updateCase.mutateAsync(input);

    // Reset default values so the form is no longer dirty
    reset({
      caseId: updatedCaseWrapper.case.id,
      initiatedFrom: updatedCaseWrapper.case.initiatedFrom,
      close: !!updatedCaseWrapper.case.closedAt,
      status: updatedCaseWrapper.case.status,
      email: updatedCaseWrapper.citizen.email,
      firstname: updatedCaseWrapper.citizen.firstname,
      lastname: updatedCaseWrapper.citizen.lastname,
      genderIdentity: updatedCaseWrapper.citizen.genderIdentity,
      address: updatedCaseWrapper.citizen.address
        ? {
            street: updatedCaseWrapper.citizen.address.street,
            city: updatedCaseWrapper.citizen.address.city,
            postalCode: updatedCaseWrapper.citizen.address.postalCode,
          }
        : {
            street: '',
            city: '',
            postalCode: '',
          },
      phone: updatedCaseWrapper.citizen.phone
        ? {
            phoneType: updatedCaseWrapper.citizen.phone.phoneType,
            callingCode: updatedCaseWrapper.citizen.phone.callingCode,
            countryCode: updatedCaseWrapper.citizen.phone.countryCode,
            number: updatedCaseWrapper.citizen.phone.number,
          }
        : getDefaultPhoneValue(),
      alreadyRequestedInThePast: updatedCaseWrapper.case.alreadyRequestedInThePast,
      gotAnswerFromPreviousRequest: updatedCaseWrapper.case.gotAnswerFromPreviousRequest,
      description: updatedCaseWrapper.case.description,
      domainId: updatedCaseWrapper.case.domain?.id || null,
      competent: updatedCaseWrapper.case.competent,
      competentThirdPartyId: updatedCaseWrapper.case.competentThirdParty?.id || null,
      units: updatedCaseWrapper.case.units,
      termReminderAt: updatedCaseWrapper.case.termReminderAt,
      faceToFaceMediation: updatedCaseWrapper?.case.faceToFaceMediation,
      outcome: updatedCaseWrapper?.case.outcome,
      collectiveAgreement: updatedCaseWrapper?.case.collectiveAgreement,
      administrativeCourtNext: updatedCaseWrapper?.case.administrativeCourtNext,
      finalConclusion: updatedCaseWrapper.case.finalConclusion,
      nextRequirements: updatedCaseWrapper.case.nextRequirements,
    });
  };

  const onSubmit = async (input: UpdateCaseSchemaType) => {
    await updateCaseAction(input);
  };

  const submitOutsideBaseForm = async (input: UpdateCaseSchemaType) => {
    try {
      await updateCaseAction(input);

      setManualSubmitError(null);
    } catch (err) {
      setManualSubmitError(err as unknown as Error);
      mainContainerRef.current?.scrollIntoView({ behavior: 'smooth' });

      throw err;
    }
  };

  const downloadPdf = async () => {
    try {
      const result = await generatePdfFromCase.mutateAsync({
        caseId: targetedCase.id,
      });

      // Open a new tab we the PDF, from there the user will be able to save it
      if (window) {
        const newTab = window.open(result.attachment.url, '_blank');
        newTab && newTab.focus();
      }

      setPdfGenerationError(null);
    } catch (err) {
      setPdfGenerationError(err as unknown as Error);
      mainContainerRef.current?.scrollIntoView({ behavior: 'smooth' });

      throw err;
    }
  };

  const onClick = () => {};

  const watchedGenderIdentity = watch('genderIdentity');

  return (
    <>
      <Grid container {...centeredContainerGridProps} spacing={2} ref={mainContainerRef}>
        {!!manualSubmitError && (
          <Grid item xs={12} sx={{ py: 2 }}>
            <ErrorAlert errors={[manualSubmitError]} />
          </Grid>
        )}
        {!!pdfGenerationError && (
          <Grid item xs={12} sx={{ py: 2 }}>
            <ErrorAlert errors={[pdfGenerationError]} />
          </Grid>
        )}
        <Grid
          item
          xs={12}
          sx={{
            display: 'flex',
            alignItems: 'center',
            pb: 1,
          }}
        >
          <Typography component="b" variant="h4">
            {watchedGenderIdentity && <>{t(`model.citizen.genderIdentityPrefix.enum.${watchedGenderIdentity}`)} </>}
            {watch('firstname')} {watch('lastname')}
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ height: '50%', mx: 2, my: 'auto' }} />
          <Typography component="b" variant="subtitle1">
            Dossier n°{targetedCase.humanId}
          </Typography>
          <Box ref={reminderAnchorRef} sx={{ ml: 'auto' }}>
            <DatePicker
              open={reminderPickerOpen}
              label="Date de la demande"
              defaultValue={watch('termReminderAt') || null}
              minDate={reminderMinimumDate}
              closeOnSelect // Needed to have consistent behavior between desktop and mobile (ref: https://stackoverflow.com/questions/70041109/how-can-i-clear-material-ui-datepicker-input/75213269#75213269)
              onChange={() => {}}
              onClose={() => {
                setReminderPickerOpen(false);
              }}
              onAccept={async (newDate) => {
                setValue('termReminderAt', newDate, {
                  shouldDirty: false, // To keeping simple the isDirty for the manual part
                });

                try {
                  await submitOutsideBaseForm({
                    termReminderAt: control._formValues.termReminderAt,
                    status: control._formValues.status,
                    // Do not update values that need a form submit
                    initiatedFrom: control._defaultValues.initiatedFrom || targetedCase.initiatedFrom,
                    caseId: control._defaultValues.caseId || targetedCase.id,
                    email: control._defaultValues.email || citizen.email,
                    firstname: control._defaultValues.firstname || citizen.firstname,
                    lastname: control._defaultValues.lastname || citizen.lastname,
                    genderIdentity: control._defaultValues.genderIdentity || citizen.genderIdentity,
                    address: citizen.address
                      ? {
                          street: control._defaultValues.address?.street || citizen.address.street,
                          postalCode: control._defaultValues.address?.postalCode || citizen.address.postalCode,
                          city: control._defaultValues.address?.city || citizen.address.city,
                          subdivision: undefined as unknown as string,
                          countryCode: undefined as unknown as string,
                        }
                      : null,
                    phone: citizen.phone
                      ? {
                          phoneType: control._defaultValues.phone?.phoneType || citizen.phone.phoneType,
                          callingCode: control._defaultValues.phone?.callingCode || citizen.phone.callingCode,
                          countryCode: control._defaultValues.phone?.countryCode || citizen.phone.countryCode,
                          number: control._defaultValues.phone?.number || citizen.phone.number,
                        }
                      : null,
                    alreadyRequestedInThePast: control._defaultValues.alreadyRequestedInThePast || targetedCase.alreadyRequestedInThePast,
                    gotAnswerFromPreviousRequest: control._defaultValues.gotAnswerFromPreviousRequest || targetedCase.gotAnswerFromPreviousRequest,
                    description: control._defaultValues.description || targetedCase.description,
                    domainId: control._defaultValues.domainId || targetedCase.domain?.id || null,
                    competent: control._defaultValues.competent || targetedCase.competent,
                    competentThirdPartyId: control._defaultValues.competentThirdPartyId || targetedCase.competentThirdParty?.id || null,
                    units: control._defaultValues.units || targetedCase.units,
                    close: control._defaultValues.close || !!targetedCase.closedAt,
                    faceToFaceMediation: control._defaultValues.faceToFaceMediation || targetedCase.faceToFaceMediation,
                    outcome: control._defaultValues.outcome || targetedCase.outcome,
                    collectiveAgreement: control._defaultValues.collectiveAgreement || targetedCase.collectiveAgreement,
                    administrativeCourtNext: control._defaultValues.administrativeCourtNext || targetedCase.administrativeCourtNext,
                    finalConclusion: control._defaultValues.finalConclusion || targetedCase.finalConclusion,
                    nextRequirements: control._defaultValues.nextRequirements || targetedCase.nextRequirements,
                  });
                } catch (err) {
                  setValue('termReminderAt', control._defaultValues.termReminderAt || targetedCase.termReminderAt);
                }
              }}
              slots={{
                field: (params) => {
                  // TODO: aria labels from params?
                  return (
                    <Button
                      onClick={() => {
                        setReminderPickerOpen(!reminderPickerOpen);
                      }}
                      size="large"
                      variant="text"
                      color={targetedCase.termReminderAt && isReminderSoon(targetedCase.termReminderAt) ? 'error' : 'primary'}
                      startIcon={<AccessTimeIcon />}
                    >
                      {targetedCase.termReminderAt ? (
                        <span>Échéance : {t('date.short', { date: targetedCase.termReminderAt })}</span>
                      ) : (
                        <span>Définir une échéance</span>
                      )}
                    </Button>
                  );
                },
              }}
              slotProps={{
                actionBar: {
                  actions: ['clear'],
                },
                popper: {
                  anchorEl: reminderAnchorRef.current,
                },
              }}
            />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            display: 'flex',
            alignItems: 'center',
            pb: 1,
          }}
        >
          <Typography component="span" variant="subtitle1">
            Avancement du dossier :
            <br />
            <TextField
              select
              inputProps={{
                readOnly: !!targetedCase.closedAt, // Reopening is only able from the bottom page section
              }}
              aria-label="avancement du dossier"
              hiddenLabel={true}
              value={watch('status') || ''}
              onChange={async (event) => {
                const value = event.target.value as CaseStatusSchemaType;

                setValue('status', value, {
                  shouldDirty: false, // To keeping simple the isDirty for the manual part
                });

                try {
                  await submitOutsideBaseForm({
                    termReminderAt: control._formValues.termReminderAt,
                    status: control._formValues.status,
                    // Do not update values that need a form submit
                    initiatedFrom: control._defaultValues.initiatedFrom || targetedCase.initiatedFrom,
                    caseId: control._defaultValues.caseId || targetedCase.id,
                    email: control._defaultValues.email || citizen.email,
                    firstname: control._defaultValues.firstname || citizen.firstname,
                    lastname: control._defaultValues.lastname || citizen.lastname,
                    genderIdentity: control._defaultValues.genderIdentity || citizen.genderIdentity,
                    address: control._defaultValues.address
                      ? {
                          street: control._defaultValues.address.street || '',
                          postalCode: control._defaultValues.address.postalCode || '',
                          city: control._defaultValues.address.city || '',
                          subdivision: undefined as unknown as string,
                          countryCode: undefined as unknown as string,
                        }
                      : citizen.address
                      ? {
                          street: citizen.address.street,
                          postalCode: citizen.address.postalCode,
                          city: citizen.address.city,
                          subdivision: undefined as unknown as string,
                          countryCode: undefined as unknown as string,
                        }
                      : null,
                    phone: control._defaultValues.phone
                      ? {
                          phoneType: control._defaultValues.phone.phoneType as PhoneTypeSchemaType,
                          callingCode: control._defaultValues.phone.callingCode as string,
                          countryCode: control._defaultValues.phone.countryCode as string,
                          number: control._defaultValues.phone.number as string,
                        }
                      : citizen.phone
                      ? {
                          phoneType: citizen.phone.phoneType,
                          callingCode: citizen.phone.callingCode,
                          countryCode: citizen.phone.countryCode,
                          number: citizen.phone.number,
                        }
                      : getDefaultPhoneValue(),
                    alreadyRequestedInThePast: control._defaultValues.alreadyRequestedInThePast || targetedCase.alreadyRequestedInThePast,
                    gotAnswerFromPreviousRequest: control._defaultValues.gotAnswerFromPreviousRequest || targetedCase.gotAnswerFromPreviousRequest,
                    description: control._defaultValues.description || targetedCase.description,
                    domainId: control._defaultValues.domainId || targetedCase.domain?.id || null,
                    competent: control._defaultValues.competent || targetedCase.competent,
                    competentThirdPartyId: control._defaultValues.competentThirdPartyId || targetedCase.competentThirdParty?.id || null,
                    units: control._defaultValues.units || targetedCase.units,
                    close: control._defaultValues.close || !!targetedCase.closedAt,
                    faceToFaceMediation: control._defaultValues.faceToFaceMediation || targetedCase.faceToFaceMediation,
                    outcome: control._defaultValues.outcome || targetedCase.outcome,
                    collectiveAgreement: control._defaultValues.collectiveAgreement || targetedCase.collectiveAgreement,
                    administrativeCourtNext: control._defaultValues.administrativeCourtNext || targetedCase.administrativeCourtNext,
                    finalConclusion: control._defaultValues.finalConclusion || targetedCase.finalConclusion,
                    nextRequirements: control._defaultValues.nextRequirements || targetedCase.nextRequirements,
                  });
                } catch (err) {
                  setValue('status', control._defaultValues.status || targetedCase.status);
                }
              }}
              error={!!errors.status}
              helperText={errors.status?.message}
              margin="dense"
              fullWidth
            >
              {Object.values(CaseStatusSchema.Values)
                .filter((status) => {
                  // Display the close status only when it has been closed by the bottom page section
                  return !(!targetedCase.closedAt && status === CaseStatusSchema.Values.CLOSED);
                })
                .map((status) => (
                  <MenuItem key={status} value={status}>
                    <CaseStatusChip status={status} />
                  </MenuItem>
                ))}
            </TextField>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider variant="fullWidth" sx={{ p: 0 }} />
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="column">
            <Dialog open={messengerModalOpen} onClose={handleCloseMessengerModal} fullWidth maxWidth={false}>
              <DialogTitle>
                <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                  <Grid item xs="auto">
                    Messagerie pour le dossier n°{targetedCase.humanId}
                  </Grid>
                  <Grid item xs="auto">
                    <IconButton aria-label="fermer" onClick={handleCloseMessengerModal} size="small">
                      <CloseIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </DialogTitle>
              <DialogContent sx={{ height: '80vh' }}>
                <ContextualMessenger caseId={targetedCase.id} />
              </DialogContent>
            </Dialog>
            <BaseForm
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              control={control}
              style={{
                maxWidth: '100%', // This is needed otherwise the `nowrap` with long content into `NoteCard` makes the container expanding
              }}
              ariaLabel="modifier un dossier"
            >
              <Grid
                item
                xs={12}
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 450,
                  background: fr.colors.decisions.background.default.grey.default,
                  pb: 2,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs="auto" minWidth="33%">
                    <Button
                      onClick={() => {
                        handeOpenMessengerModal();
                      }}
                      size="large"
                      variant="contained"
                      fullWidth
                      startIcon={<MailOutlineIcon />}
                    >
                      Messagerie
                      {!!unprocessedMessages && unprocessedMessages > 0 && (
                        <Badge {...unprocessedMessagesBadgeAttributes} badgeContent={unprocessedMessages} />
                      )}
                    </Button>
                  </Grid>
                  {isDirty ? (
                    <Grid item xs>
                      <Button
                        type="submit"
                        loading={updateCase.isLoading}
                        size="large"
                        variant="contained"
                        color="warning"
                        fullWidth
                        startIcon={<SaveIcon />}
                      >
                        Enregistrer les modifications en cours
                      </Button>
                    </Grid>
                  ) : (
                    <>
                      <Grid item xs>
                        <Button
                          onClick={downloadPdf}
                          loading={generatePdfFromCase.isLoading}
                          size="large"
                          variant="contained"
                          fullWidth
                          startIcon={<DownloadIcon />}
                        >
                          Télécharger le dossier
                        </Button>
                      </Grid>
                      <Grid item xs>
                        {targetedCase.agentId ? (
                          <Button onClick={onClick} size="large" variant="contained" fullWidth startIcon={<TransferWithinAStationIcon />}>
                            {/* TODO: bind to API */}
                            Transférer le dossier
                          </Button>
                        ) : (
                          <Button
                            onClick={async () => {
                              try {
                                await assignCase.mutateAsync({
                                  caseId: caseId,
                                  myself: true,
                                });

                                setManualSubmitError(null);
                              } catch (err) {
                                setManualSubmitError(err as unknown as Error);
                                mainContainerRef.current?.scrollIntoView({ behavior: 'smooth' });

                                throw err;
                              }
                            }}
                            loading={assignCase.isLoading}
                            size="large"
                            variant="contained"
                            fullWidth
                            startIcon={<EmojiPeopleIcon />}
                          >
                            S&apos;attribuer le dossier
                          </Button>
                        )}
                      </Grid>
                    </>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12} sx={{ pt: 0 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Tooltip title={t('date.longWithTime', { date: targetedCase.createdAt })}>
                              <div>
                                <DatePicker
                                  label="Date de la demande"
                                  readOnly
                                  value={targetedCase.createdAt}
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
                          <Grid item xs={12} sm={6}>
                            <TextField
                              select
                              label="Mode de saisine"
                              defaultValue={control._defaultValues.initiatedFrom || ''}
                              inputProps={register('initiatedFrom')}
                              error={!!errors.initiatedFrom}
                              helperText={errors.initiatedFrom?.message}
                              margin="dense"
                              fullWidth
                              sx={{ m: 0 }}
                            >
                              {Object.values(CasePlatformSchema.Values).map((initiatedFrom) => (
                                <MenuItem key={initiatedFrom} value={initiatedFrom}>
                                  {t(`model.case.platform.enum.${initiatedFrom}`)}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography component="span" variant="h6">
                          Coordonnées
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          type="email"
                          label="Email"
                          {...register('email')}
                          error={!!errors.email}
                          helperText={errors?.email?.message}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={3.5}>
                        <TextField
                          select
                          label="Identité de genre"
                          defaultValue={control._defaultValues.genderIdentity || ''}
                          onChange={(event) => {
                            setValue('genderIdentity', event.target.value === '' ? null : (event.target.value as CitizenGenderIdentitySchemaType), {
                              // shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                          error={!!errors.genderIdentity}
                          helperText={errors.genderIdentity?.message}
                          fullWidth
                        >
                          <MenuItem value="">
                            <em>Non spécifié</em>
                          </MenuItem>
                          {Object.values(CitizenGenderIdentitySchema.Values).map((genderIdentity) => (
                            <MenuItem key={genderIdentity} value={genderIdentity}>
                              {t(`model.citizen.genderIdentity.enum.${genderIdentity}`)}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4.25}>
                        <TextField
                          label="Prénom"
                          {...register('firstname')}
                          error={!!errors.firstname}
                          helperText={errors?.firstname?.message}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={4.25}>
                        <TextField
                          label="Nom de famille"
                          {...register('lastname')}
                          error={!!errors.lastname}
                          helperText={errors?.lastname?.message}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Adresse"
                          placeholder="20 rue de la ..."
                          {...register('address.street')}
                          error={!!errors.address?.street}
                          helperText={errors?.address?.street?.message}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Code postal"
                          placeholder="75000"
                          {...register('address.postalCode')}
                          error={!!errors.address?.postalCode}
                          helperText={errors?.address?.postalCode?.message}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Ville"
                          placeholder="Paris"
                          {...register('address.city')}
                          error={!!errors.address?.city}
                          helperText={errors?.address?.city?.message}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <PhoneField
                          initialPhoneNumber={control._defaultValues.phone ? (control._defaultValues.phone as PhoneInputSchemaType) : undefined}
                          onGlobalChange={(phoneNumber) => {
                            setValue('phone', phoneNumber, {
                              // shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                          error={!!errors.phone}
                          helperText={errors?.phone?.message}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Divider variant="fullWidth" sx={{ p: 0 }} />
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container direction={'column'} spacing={2}>
                      <Grid item xs={12}>
                        <Typography component="span" variant="h6">
                          Demande
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Motif de la demande"
                          {...register('description')}
                          error={!!errors.description}
                          helperText={errors?.description?.message}
                          multiline
                          minRows={3}
                          maxRows={10}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl error={!!errors.alreadyRequestedInThePast}>
                          <FormLabel id="previous-request-radio-buttons-group-label">Premier recours à l&apos;amiable effectué ?</FormLabel>
                          <RadioGroup
                            defaultValue={control._defaultValues.alreadyRequestedInThePast?.toString()}
                            onChange={(event) => {
                              const value = event.target.value === 'true';

                              setValue('alreadyRequestedInThePast', value, {
                                shouldDirty: true,
                              });

                              if (!value) {
                                setValue('gotAnswerFromPreviousRequest', null, {
                                  shouldDirty: true,
                                });
                              }
                            }}
                            aria-labelledby="previous-request-radio-buttons-group-label"
                            aria-describedby="previous-request-helper-text"
                          >
                            <FormControlLabel value="true" control={<Radio />} label="Oui" />
                            <FormControlLabel value="false" control={<Radio />} label="Non" />
                          </RadioGroup>
                          <FormHelperText>{errors?.alreadyRequestedInThePast?.message}</FormHelperText>
                        </FormControl>
                      </Grid>
                      {watch('alreadyRequestedInThePast') && (
                        <Grid item xs={12}>
                          <FormControl error={!!errors.gotAnswerFromPreviousRequest}>
                            <FormLabel id="answer-from-previous-request--radio-buttons-group-label">
                              Suite au premier recours, réponse de l&apos;administration reçue ?
                            </FormLabel>
                            <RadioGroup
                              defaultValue={control._defaultValues.gotAnswerFromPreviousRequest?.toString()}
                              onChange={(event) => {
                                setValue('gotAnswerFromPreviousRequest', event.target.value === 'true', {
                                  shouldDirty: true,
                                });
                              }}
                              aria-labelledby="answer-from-previous-request--radio-buttons-group-label"
                            >
                              <FormControlLabel value="true" control={<Radio />} label="Oui" />
                              <FormControlLabel value="false" control={<Radio />} label="Non" />
                            </RadioGroup>
                            <FormHelperText>{errors?.gotAnswerFromPreviousRequest?.message}</FormHelperText>
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Divider variant="fullWidth" sx={{ p: 0 }} />
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container direction={'column'} spacing={2}>
                      <Grid item xs={12}>
                        <Typography component="span" variant="h6">
                          Compétences
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl error={!!errors.competent}>
                          <FormLabel id="competent-radio-buttons-group-label">
                            Est-ce que cette saisine entre dans le domaine de compétence de votre collectivité ?
                          </FormLabel>
                          <RadioGroup
                            defaultValue={control._defaultValues.competent?.toString()}
                            onChange={(event) => {
                              const value = event.target.value === 'true';

                              setValue('competent', value);

                              if (value) {
                                setValue('competentThirdPartyId', null);
                              } else {
                                setValue('domainId', null);
                              }
                            }}
                            aria-labelledby="competent-radio-buttons-group-label"
                          >
                            <FormControlLabel value="true" control={<Radio />} label="Oui" />
                            <FormControlLabel value="false" control={<Radio />} label="Non" />
                          </RadioGroup>
                          <FormHelperText>{errors?.competent?.message}</FormHelperText>
                        </FormControl>
                      </Grid>
                      {watch('competent') === true && (
                        <Grid item xs={12}>
                          <ContextualCaseDomainField
                            authorityId={targetedCase.authorityId}
                            value={targetedCase.domain}
                            onChange={(item) => {
                              setValue('domainId', item?.id || null, {
                                // shouldValidate: true,
                                shouldDirty: true,
                              });
                            }}
                            errorMessage={errors?.domainId?.message}
                          />
                        </Grid>
                      )}
                      {watch('competent') === false && (
                        <Grid item xs={12}>
                          <ContextualCaseCompetentThirdPartyField
                            authorityId={targetedCase.authorityId}
                            value={targetedCase.competentThirdParty}
                            onChange={(item) => {
                              setValue('competentThirdPartyId', item?.id || null, {
                                // shouldValidate: true,
                                shouldDirty: true,
                              });
                            }}
                            errorMessage={errors?.competentThirdPartyId?.message}
                          />
                        </Grid>
                      )}
                      {/* TODO: remove the following "units" field from the database? */}
                      {/* <Grid item xs={12}>
                        <TextField
                          label="Administration compétente"
                          {...register('units')}
                          error={!!errors.units}
                          helperText={errors?.units?.message}
                          fullWidth
                        />
                      </Grid> */}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Divider variant="fullWidth" sx={{ p: 0 }} />
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container direction={'column'} spacing={2}>
                      <Grid item xs={12}>
                        <Grid container spacing={1} justifyContent="space-between" alignItems="center">
                          <Grid item xs="auto">
                            <Typography component="span" variant="h6">
                              Notes
                            </Typography>
                          </Grid>
                          <Grid item xs="auto">
                            <Button onClick={handeOpenAddNoteModal} size="large" variant="contained" startIcon={<AddCircleOutlineIcon />}>
                              Ajouter une note
                            </Button>
                            <Dialog open={addNoteModalOpen} onClose={handleCloseAddNoteModal} fullWidth maxWidth="lg">
                              <DialogTitle>
                                <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                                  <Grid item xs="auto">
                                    Édition de note
                                  </Grid>
                                  <Grid item xs="auto">
                                    <IconButton aria-label="fermer" onClick={handleCloseAddNoteModal} size="small">
                                      <CloseIcon />
                                    </IconButton>
                                  </Grid>
                                </Grid>
                              </DialogTitle>
                              <DialogContent>
                                <ContextualAddNoteForm prefill={{ caseId: targetedCase.id }} onSuccess={handleCloseAddNoteModal} />
                              </DialogContent>
                            </Dialog>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sx={{
                          maxWidth: '100% !important', // This is needed otherwise the `nowrap` with long content into `NoteCard` makes the container expanding (need to be on `BaseForm` too)
                        }}
                      >
                        <Grid container component="ul" spacing={2} sx={ulComponentResetStyles}>
                          {notes &&
                            notes.map((note) => (
                              <Grid key={note.id} item component="li" xs={12} sm={6} md={4}>
                                <ContextualNoteCard note={note} />
                              </Grid>
                            ))}
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Divider variant="fullWidth" sx={{ p: 0 }} />
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container direction={'column'} spacing={2}>
                      <Grid item xs={12}>
                        <Typography component="span" variant="h6">
                          Documents
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <ContextualUploader
                          attachmentKindRequirements={attachmentKindList[AttachmentKindSchema.Values.CASE_DOCUMENT]}
                          maxFiles={updateCaseAttachmentsMax}
                          postUploadHook={async (internalId: string) => {
                            await addAttachmentToCase.mutateAsync({
                              caseId: targetedCase.id,
                              attachmentId: internalId,
                              transmitter: CaseAttachmentTypeSchema.Values.AGENT,
                            });
                          }}
                        />
                        {attachments && attachments.length > 0 && (
                          <>
                            <FileList
                              files={attachments}
                              onRemove={async (file) => {
                                await removeAttachmentFromCase.mutateAsync({
                                  caseId: targetedCase.id,
                                  attachmentId: file.id,
                                });
                              }}
                            />
                          </>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Divider variant="fullWidth" sx={{ p: 0 }} />
              </Grid>
              <Grid item xs={12}>
                <CloseCaseCard
                  case={targetedCase}
                  citizen={citizen}
                  wrapperForm={form}
                  closeAction={async (value: boolean) => {
                    setValue('close', value);

                    await submitOutsideBaseForm({
                      termReminderAt: control._formValues.termReminderAt,
                      status: control._formValues.status,
                      initiatedFrom: control._formValues.initiatedFrom,
                      caseId: control._formValues.caseId,
                      email: control._formValues.email,
                      firstname: control._formValues.firstname,
                      lastname: control._formValues.lastname,
                      genderIdentity: control._formValues.genderIdentity,
                      address: {
                        street: control._formValues.address.street,
                        postalCode: control._formValues.address.postalCode,
                        city: control._formValues.address.city,
                        subdivision: undefined as unknown as string,
                        countryCode: undefined as unknown as string,
                      },
                      phone: {
                        phoneType: control._formValues.phone.phoneType,
                        callingCode: control._formValues.phone.callingCode,
                        countryCode: control._formValues.phone.countryCode,
                        number: control._formValues.phone.number,
                      },
                      alreadyRequestedInThePast: control._formValues.alreadyRequestedInThePast,
                      gotAnswerFromPreviousRequest: control._formValues.gotAnswerFromPreviousRequest,
                      description: control._formValues.description,
                      domainId: control._formValues.domainId,
                      competent: control._formValues.competent,
                      competentThirdPartyId: control._formValues.competentThirdPartyId,
                      units: control._formValues.units,
                      close: control._formValues.close,
                      faceToFaceMediation: control._formValues.faceToFaceMediation,
                      outcome: control._formValues.outcome,
                      collectiveAgreement: control._formValues.collectiveAgreement,
                      administrativeCourtNext: control._formValues.administrativeCourtNext,
                      finalConclusion: control._formValues.finalConclusion,
                      nextRequirements: control._formValues.nextRequirements,
                    });
                  }}
                />
              </Grid>
            </BaseForm>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
