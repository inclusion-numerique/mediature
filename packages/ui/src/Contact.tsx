import { useColors } from '@codegouvfr/react-dsfr/useColors';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import Button from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useLiveChat } from '@mediature/main/src/components/live-chat/useLiveChat';

export function Contact() {
  const theme = useColors();
  const { showLiveChat, isLiveChatLoading } = useLiveChat();

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        bgcolor: theme.decisions.background.alt.blueFrance.default,
        py: { xs: 3, md: 4 },
      }}
    >
      <Container>
        <Grid container rowSpacing={4} columnSpacing={12}>
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                pr: {
                  md: 6,
                },
                borderRight: {
                  md: `1px solid ${theme.decisions.border.default.blueFrance.default}`,
                },
              }}
            >
              <Typography component="h2" variant="h4">
                Nous sommes joignables !
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Si vous souhaitez en savoir plus sur le service ou rencontrez un problème, une messagerie est à votre disposition.
              </Typography>
              <Button onClick={showLiveChat} loading={isLiveChatLoading} size="large" variant="contained">
                Nous écrire
              </Button>
            </Box>
          </Grid>
          {/* <Divider orientation="vertical" flexItem sx={{ height: '50%', my: 'auto' }} /> */}
          {/* <Divider orientation="vertical" flexItem sx={{ mt: { xs: 3, md: 4 }, mx: 4 }} /> */}
          {/* <Grid item xs> */}
          <Grid item xs={12} md={4}>
            <Typography component="h2" variant="h4">
              Suivez-nous sur les réseaux sociaux
            </Typography>
            <Box>
              <Stack spacing={2} direction="row">
                <IconButton
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://twitter.com/AmctMediation"
                  aria-label="twitter"
                  title="Twitter"
                  size="large"
                  sx={{
                    pl: 0,
                    color: theme.decisions.text.actionHigh.blueFrance.default,
                    backgroundImage: 'none !important',
                    '&::after': {
                      display: 'none !important',
                    },
                  }}
                >
                  <TwitterIcon fontSize="large" />
                </IconButton>
                <IconButton
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.linkedin.com/company/association-des-m%C3%A9diateurs-des-collectivit%C3%A9s-territoriales"
                  aria-label="linkedin"
                  title="LinkedIn"
                  size="large"
                  sx={{
                    color: theme.decisions.text.actionHigh.blueFrance.default,
                    backgroundImage: 'none !important',
                    '&::after': {
                      display: 'none !important',
                    },
                  }}
                >
                  <LinkedInIcon fontSize="large" />
                </IconButton>
                <IconButton
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/inclusion-numerique/mediature"
                  aria-label="github"
                  title="GitHub"
                  size="large"
                  sx={{
                    color: theme.decisions.text.actionHigh.blueFrance.default,
                    backgroundImage: 'none !important',
                    '&::after': {
                      display: 'none !important',
                    },
                  }}
                >
                  <GitHubIcon fontSize="large" />
                </IconButton>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
}
