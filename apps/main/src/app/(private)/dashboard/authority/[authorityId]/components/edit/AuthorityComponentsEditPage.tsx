'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createContext, useContext } from 'react';

import { CaseCompetentThirdPartyField } from '@mediature/main/src/components/CaseCompetentThirdPartyField';
import { CaseDomainField } from '@mediature/main/src/components/CaseDomainField';
import { centeredContainerGridProps } from '@mediature/main/src/utils/grid';

export const AuthorityComponentsEditPageContext = createContext({
  ContextualCaseDomainField: CaseDomainField,
  ContextualCaseCompetentThirdPartyField: CaseCompetentThirdPartyField,
});

export interface AuthorityComponentsEditPageProps {
  params: { authorityId: string };
}

export function AuthorityComponentsEditPage(props: AuthorityComponentsEditPageProps) {
  const { ContextualCaseDomainField, ContextualCaseCompetentThirdPartyField } = useContext(AuthorityComponentsEditPageContext);

  return (
    <>
      <Grid container {...centeredContainerGridProps} alignContent="flex-start">
        <Grid item xs={12} sx={{ pb: 3 }}>
          <Typography component="h1" variant="h5">
            Listes dynamiques de la collectivité
          </Typography>
        </Grid>
        <Grid item xs={12} sx={{ pb: 3 }}>
          <Typography component="p">
            Il peut arriver que les catégories proposées par la plateforme ne suffisent pas dans le cadre de votre collectivité. Nous vous laissons la
            possibilité d&apos;ajouter de nouvelles catégories ci-dessous.
          </Typography>
          <Typography component="p" variant="body2" sx={{ fontStyle: 'italic', mt: 2 }}>
            À noter que vous ne pouvez pas supprimer celles définies par la plateforme car celles-ci permettent de faire des statistiques au niveau
            national. Créer de nouvelles catégories pour votre collectivité doit être exceptionnel, n&apos;hésitez pas à contacter le support pour en
            discuter, peut-être que votre démarche est légitime et peut être généralisée à toutes les collectivités de la plateforme.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ContextualCaseDomainField authorityId={props.params.authorityId} editMode={true} onChange={() => {}} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ContextualCaseCompetentThirdPartyField authorityId={props.params.authorityId} editMode={true} onChange={() => {}} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
