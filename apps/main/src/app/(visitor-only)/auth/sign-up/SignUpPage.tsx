'use client';

import { fr } from '@codegouvfr/react-dsfr';
import humanCooperation from '@gouvfr/dsfr/dist/artwork/pictograms/environment/human-cooperation.svg';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { createContext, useContext } from 'react';

import { SignUpForm } from '@mediature/main/src/app/(visitor-only)/auth/sign-up/SignUpForm';
import { trpc } from '@mediature/main/src/client/trpcClient';
import { ErrorAlert } from '@mediature/main/src/components/ErrorAlert';
import { LoadingArea } from '@mediature/main/src/components/LoadingArea';
import { SignUpPrefillSchema } from '@mediature/main/src/models/actions/auth';
import { formTitleProps } from '@mediature/main/src/utils/form';
import { centeredAlertContainerGridProps, centeredFormContainerGridProps } from '@mediature/main/src/utils/grid';

export const SignUpPageContext = createContext({
  ContextualSignUpForm: SignUpForm,
});

export function SignUpPage() {
  const { ContextualSignUpForm } = useContext(SignUpPageContext);

  const searchParams = useSearchParams();
  const invitationToken = searchParams!.get('token');

  if (!invitationToken) {
    const error = new Error(
      `Vous ne pouvez vous inscrire sans avoir être invité par un médiateur d'une collectivité déjà sur la plateforme. Merci de vous rapprocher de votre collectivité pour en savoir plus.`
    );

    return (
      <Grid container {...centeredAlertContainerGridProps}>
        <ErrorAlert errors={[error]} />
      </Grid>
    );
  }

  const { data, error, isLoading, refetch } = trpc.getPublicFacingInvitation.useQuery({
    token: invitationToken,
  });

  if (error) {
    return (
      <Grid container {...centeredAlertContainerGridProps}>
        <ErrorAlert errors={[error]} refetchs={[refetch]} />
      </Grid>
    );
  } else if (isLoading) {
    return <LoadingArea ariaLabelTarget="formulaire d'inscription" />;
  }

  const invitation = data.invitation;

  return (
    <Grid container>
      <Grid item xs={12} lg={6} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Grid container {...centeredFormContainerGridProps}>
          <Typography component="h1" {...formTitleProps}>
            Inscription
          </Typography>
          <Typography component="p" variant="subtitle1" sx={{ mb: 3 }}>
            Vous avez été invité à rejoindre la plateforme par{' '}
            <span data-sentry-mask>
              {invitation.issuer.firstname} {invitation.issuer.lastname}
            </span>
            . Vous pouvez modifier les informations ci-dessous qui ont été pré-renseignées.
          </Typography>
          <ContextualSignUpForm
            prefill={SignUpPrefillSchema.parse({
              invitationToken: invitationToken,
              email: invitation.inviteeEmail,
              firstname: invitation.inviteeFirstname,
              lastname: invitation.inviteeLastname,
            })}
          />
        </Grid>
      </Grid>
      <Grid
        item
        xs={12}
        lg={6}
        container
        direction={'column'}
        sx={{
          background: fr.colors.decisions.background.alt.blueFrance.default,
          px: 6,
          py: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          src={humanCooperation}
          alt=""
          style={{
            backgroundColor: '#f5f5fe', // [WORKAROUND] Simple hack since DSFR does not provide pictograms in dark mode
            width: '90%',
            height: 'auto',
            maxHeight: 250,
            objectFit: 'contain',
          }}
        />
        <Typography variant="body1" sx={{ pt: '40px' }}>
          <Typography sx={{ fontWeight: 'bold' }}>Les raisons de s&apos;inscrire sur la plateforme :</Typography>
          <ol>
            <li>Une meilleure collaboration avec vos collègues médiateurs</li>
            <li>Centraliser la gestion des saisines au sein d&apos;un seul outil</li>
            <li>Bénéficier d&apos;une messagerie centralisée</li>
            <li>Ne plus garder les documents sensibles sur votre ordinateur</li>
            <li>Utiliser un outil commun disponible à toutes les collectivités</li>
          </ol>
        </Typography>
      </Grid>
    </Grid>
  );
}
