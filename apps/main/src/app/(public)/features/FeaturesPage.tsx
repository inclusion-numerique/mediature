'use client';

import { useColors } from '@codegouvfr/react-dsfr/useColors';
import Grid from '@mui/material/Grid';

import toReplace from '@mediature/main/public/assets/features/to_replace.png';
import { Feature } from '@mediature/main/src/app/(public)/features/Feature';
import { Introduction } from '@mediature/main/src/app/(public)/features/Introduction';
import { Contact } from '@mediature/ui/src/Contact';

export function FeaturesPage() {
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
      <Feature
        {...{
          image: toReplace,
          imageAlt: ``,
          name: `Gestion des dossiers et auto-complétion`,
          description: (
            <>
              <ul>
                <li>Gérez tous vos dossiers depuis un seul endroit ;</li>
                <li>Suivez leur avancement facilement avec la date d&apos;échéance et l&apos;étape à laquelle est le dossier ;</li>
                <li>Complétez les dossiers grâce à des champs préremplis pour vous aider et pour aller plus vite dans la résolution du dossier.</li>
              </ul>
            </>
          ),
        }}
      />
      <Feature
        {...{
          bgcolor: theme.decisions.background.alt.grey.default,
          reverseItems: true,
          image: toReplace,
          imageAlt: ``,
          name: `Gestion d'équipe et collectivité`,
          description: (
            <>
              <ul>
                <li>Gérez vos équipes : ajoutez des médiateurs, supprimez-en, modifiez leurs profils ;</li>
                <li>En tant que responsable, vous pouvez accéder aux dossiers des médiateurs de votre collectivité ;</li>
                <li>Personnalisez aussi votre collectivité avec votre logo, votre lien...</li>
              </ul>
            </>
          ),
        }}
      />
      <Feature
        {...{
          image: toReplace,
          imageAlt: ``,
          name: `Échanges d'emails intégrés et prises de notes`,
          description: (
            <>
              <ul>
                <li>
                  Envoyez des emails et accédez aux réponses directement depuis notre outil. Tous vos échanges sont organisés dans un fil de
                  discussion pour vous éviter de les chercher ;
                </li>
                <li>Prenez des notes pour suivre plus facilement vos dossiers lors de vos appels téléphoniques.</li>
              </ul>
            </>
          ),
        }}
      />
      <Contact />
    </Grid>
  );
}
