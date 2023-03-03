'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useSearchParams } from 'next/navigation';
import { createContext, useContext } from 'react';

import { SignUpForm } from '@mediature/main/src/app/(visitor-only)/auth/sign-up/SignUpForm';
import { trpc } from '@mediature/main/src/client/trpcClient';
import { SignUpPrefillSchema } from '@mediature/main/src/models/actions/auth';
import { formTitleProps } from '@mediature/main/src/utils/form';
import { centeredAlertContainerGridProps, centeredFormContainerGridProps } from '@mediature/main/src/utils/grid';
import { ErrorAlert } from '@mediature/ui/src/ErrorAlert';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';

export const SignUpPageContext = createContext({
  ContextualSignUpForm: SignUpForm,
});

export function SignUpPage() {
  const { ContextualSignUpForm } = useContext(SignUpPageContext);

  const searchParams = useSearchParams();
  const invitationToken = searchParams.get('token');

  if (!invitationToken) {
    const error = new Error(
      `Vous ne pouvez vous inscrire sans avoir être invité par un agent d'une collectivité déjà sur la plateforme. Merci de vous rapprocher de votre collectivité pour en savoir plus.`
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
            Vous avez été invité à rejoindre la plateforme par {invitation.issuer.firstname} {invitation.issuer.lastname}. Vous pouvez modifier les
            informations ci-dessous qui ont été pré-renseignées.
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
          background: 'radial-gradient(50% 50% at 50% 50%, #122647 0%, #090E23 100%)',
          color: 'white',
          px: 3,
          py: 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body1" align="center">
          Cet espace est réservé aux agents des collectivités ... TODO
        </Typography>
      </Grid>
    </Grid>
  );
}
