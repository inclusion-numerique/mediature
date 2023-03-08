import { useColors } from '@codegouvfr/react-dsfr/useColors';
import Box, { BoxProps } from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import * as React from 'react';

export function IntroductionContainer({
  left,
  right,
  rightRef,
  rightSx,
}: {
  left: React.ReactElement;
  right: React.ReactElement;
  rightRef?: React.MutableRefObject<HTMLDivElement | null>;
  rightSx?: BoxProps['sx'];
}) {
  const theme = useColors();

  return (
    <Box
      sx={{
        overflow: 'hidden',
        borderBottom: `1px solid ${theme.decisions.background.alt.grey.active}`,
      }}
    >
      <Container
        sx={{
          minHeight: 500,
          height: 'calc(100vh - 120px)',
          maxHeight: { xs: 500, sm: 600, xl: 700 },
          transition: '0.3s',
        }}
      >
        <Grid container alignItems="center" wrap="nowrap" sx={{ height: '100%', mx: 'auto' }}>
          <Grid item md={7} lg={6} sx={{ m: 'auto' }}>
            {left}
          </Grid>
          <Grid item md={5} lg={6} sx={{ maxHeight: '100%', display: { xs: 'none', md: 'initial' } }}>
            <Box
              ref={rightRef}
              id="introduction-container-right-area"
              aria-hidden="true"
              sx={[
                {
                  display: 'flex',
                  alignItems: 'center',
                  px: '3vw',
                  py: '20px',
                  bgcolor: theme.decisions.background.alt.grey.default,
                  minWidth: {
                    md: `${100 / (12 / 5)}vw`,
                    lg: `${100 / (12 / 6)}vw`,
                  },
                  minHeight: 500,
                  height: 'calc(100vh - 120px)',
                  maxHeight: { md: 600, xl: 700 },
                  transition: 'max-height 0.3s',
                },
                ...(Array.isArray(rightSx) ? rightSx : [rightSx]),
              ]}
            >
              {right}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
