'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createContext, useContext } from 'react';

import { CaseCompetentThirdPartyField } from '@mediature/main/src/components/CaseCompetentThirdPartyField';
import { CaseDomainField } from '@mediature/main/src/components/CaseDomainField';
import { centeredContainerGridProps } from '@mediature/main/src/utils/grid';

export const ComponentsEditPageContext = createContext({
  ContextualCaseDomainField: CaseDomainField,
  ContextualCaseCompetentThirdPartyField: CaseCompetentThirdPartyField,
});

export interface ComponentsEditPageProps {}

export function ComponentsEditPage(props: ComponentsEditPageProps) {
  const { ContextualCaseDomainField, ContextualCaseCompetentThirdPartyField } = useContext(ComponentsEditPageContext);

  return (
    <>
      <Grid container {...centeredContainerGridProps} alignContent="flex-start">
        <Grid item xs={12} sx={{ pb: 3 }}>
          <Typography component="h1" variant="h5">
            Listes dynamiques de la plateforme
          </Typography>
        </Grid>
        <Grid item xs={12} sx={{ pb: 3 }}>
          <Typography component="p">Vous pouvez gérer ci-dessous les catégories disponibles auprès de toutes les collectivités.</Typography>
          <Typography component="p" variant="body2" sx={{ fontStyle: 'italic', mt: 2 }}>
            N&apos;oubliez pas que chaque collectivité est en mesure d&apos;ajouter des catégories supplémentaires non-listées ici et que vous les
            retrouverez listées dans les statistiques générales de la plateforme.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ContextualCaseDomainField editMode={true} onChange={() => {}} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ContextualCaseCompetentThirdPartyField editMode={true} onChange={() => {}} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
