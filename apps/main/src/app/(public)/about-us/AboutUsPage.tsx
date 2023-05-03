'use client';

import { useColors } from '@codegouvfr/react-dsfr/useColors';
import Grid from '@mui/material/Grid';

import amct from '@mediature/main/public/assets/partners/amct.png';
import anct from '@mediature/main/public/assets/partners/anct.png';
import betagouv from '@mediature/main/public/assets/partners/betagouv.png';
import { Introduction } from '@mediature/main/src/app/(public)/about-us/Introduction';
import { Partner } from '@mediature/main/src/app/(public)/about-us/Partner';

export function AboutUsPage() {
  const theme = useColors();

  return (
    <Grid
      container
      sx={{
        display: 'block',
        mx: 'auto',
      }}
    >
      <Introduction />
      <Partner
        {...{
          link: 'https://www.amct-mediation.fr',
          image: amct,
          imageAlt: `logo de l'AMCT`,
          name: `L'AMCT`,
          description: (
            <>
              L&apos;Association des Médiateurs des Collectivités Territoriales regroupe les médiateurs des villes et de leurs groupements, ainsi que
              les médiateurs des départements et des régions, quel que soit leur statut (fonctionnaire territorial, contractuel, vacataire ou
              prestataire), dès lorsqu&apos;ils ont pour seule charge de régler les litiges entre les services publics municipaux, intercommunaux,
              départementaux, régionaux et les usagers de ces services.
            </>
          ),
        }}
      />
      <Partner
        {...{
          bgcolor: theme.decisions.background.alt.grey.default,
          link: 'https://beta.gouv.fr',
          image: betagouv,
          imageAlt: `logo de beta.gouv`,
          name: `beta.gouv`,
          description: (
            <>
              beta.gouv est un programme d&apos;incubation qui aide les administrations publiques à construire des services numériques utiles,
              simples, faciles à utiliser et qui répondent vraiment aux besoins des gens.
            </>
          ),
        }}
      />
      <Partner
        {...{
          link: 'https://agence-cohesion-territoires.gouv.fr',
          image: anct,
          imageAlt: `logo de l'ANCT`,
          name: `L'ANCT`,
          description: (
            <>
              L&apos;agence nationale de la cohésion des territoires (ANCT), anciennement le commissariat général à l&apos;égalité des territoires
              (CGET) est un service de l&apos;État placé sous l&apos;autorité du ministre de la Cohésion des territoires et des Relations avec les
              collectivités territoriales.
              <br />
              <br />
              Il appuie le gouvernement dans la lutte contre les inégalités territoriales et le soutien aux dynamiques territoriales, en concevant et
              animant les politiques de la ville et d&apos;aménagement du territoire avec les acteurs locaux et les citoyens.
            </>
          ),
        }}
      />
    </Grid>
  );
}
