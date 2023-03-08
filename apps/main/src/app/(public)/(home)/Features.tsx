import { useColors } from '@codegouvfr/react-dsfr/useColors';
import GroupsIcon from '@mui/icons-material/Groups';
import HubIcon from '@mui/icons-material/Hub';
import MessageIcon from '@mui/icons-material/Message';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { Widget } from '@mediature/main/src/app/(public)/(home)/Widget';

export function Features() {
  const theme = useColors();

  return (
    <Container sx={{ py: { xs: 4, md: 8 } }}>
      <Typography
        component="h2"
        variant="h4"
        color={theme.decisions.text.title.blueFrance.default}
        sx={{ textAlign: 'center', mt: 1, mb: { xs: 2, sm: 4 } }}
      >
        Le service de médiature entre les usagers et les collectivités
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Widget icon={<HubIcon fontSize="small" />} title="Gestion centralisée de toutes les demandes">
            <Typography variant="body2" color="text.secondary">
              Toutes les demandes arrivent à un seul endroit. Attribuez-vous un dossier en un clic et traitez-le très facilement depuis votre
              interface.
            </Typography>
          </Widget>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Widget icon={<MessageIcon fontSize="small" />} title="Messagerie intégrée">
            <Typography variant="body2" color="text.secondary">
              Envoyez des mails directement depuis votre interface et accédez au fil de discussion entre vous et l&apos;usager.
              <br />
              <br />
              Vous pouvez également prendre des notes après chaque entretien téléphonique pour faciliter le déroulé du dossier.
            </Typography>
          </Widget>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Widget icon={<GroupsIcon fontSize="small" />} title="Gestion des équipes de médiateurs">
            <Typography variant="body2" color="text.secondary">
              En tant que responsable, vous pouvez ajouter des médiateurs, en supprimer, ou en modifier depuis votre interface. Vous pouvez consulter
              les dossiers de vos médiateurs et les réattribuer.
            </Typography>
          </Widget>
        </Grid>
      </Grid>
    </Container>
  );
}
