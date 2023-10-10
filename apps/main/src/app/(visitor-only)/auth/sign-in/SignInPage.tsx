'use client';

import { fr } from '@codegouvfr/react-dsfr';
import locationFrance from '@gouvfr/dsfr/dist/artwork/pictograms/map/location-france.svg';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { createContext, useContext } from 'react';

import { SignInForm } from '@mediature/main/src/app/(visitor-only)/auth/sign-in/SignInForm';
import { formTitleProps } from '@mediature/main/src/utils/form';
import { centeredFormContainerGridProps } from '@mediature/main/src/utils/grid';

export const SignInPageContext = createContext({
  ContextualSignInForm: SignInForm,
});

export function SignInPage() {
  const { ContextualSignInForm } = useContext(SignInPageContext);

  return (
    <Grid container>
      <Grid item xs={12} lg={6} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Grid container {...centeredFormContainerGridProps}>
          <Typography component="h1" {...formTitleProps}>
            Connexion
          </Typography>
          <ContextualSignInForm />
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
          src={locationFrance}
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
          <Typography sx={{ fontWeight: 'bold', textAlign: 'center' }}>D&apos;autres collectivités utilisent la plateforme !</Typography>
          <br />
          <p>
            Donc si vous rencontrez des difficultés ou avez des idées d&apos;évolution, n&apos;hésitez pas à le partager avec le support en
            choisissant dans le menu de votre compte{' '}
            <Typography component="span" sx={{ fontStyle: 'italic' }}>
              &quot;Obtenir de l&apos;aide&quot;
            </Typography>
            . Cela permettra à l&apos;ensemble des collectivités d&apos;en bénéficier.
          </p>
        </Typography>
      </Grid>
    </Grid>
  );
}
