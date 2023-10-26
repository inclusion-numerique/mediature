import { fr } from '@codegouvfr/react-dsfr';
import { useIsDark } from '@codegouvfr/react-dsfr/useIsDark';
import Box, { BoxProps } from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import * as React from 'react';

export const Root = (props: BoxProps) => (
  <Box
    {...props}
    sx={[
      {
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr',
          md: 'minmax(300px, 500px) minmax(600px, 1fr)',
        },
        gridTemplateRows: '1fr',
      },
      ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
    ]}
  />
);

export const SidePanel = (props: BoxProps) => (
  <Box
    component="nav"
    className="Navigation"
    {...props}
    sx={[
      {
        display: {
          xs: 'none',
          md: 'initial',
        },
        height: '100%',
        overflow: 'auto',
      },
      ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
    ]}
  />
);

export const Main = (props: BoxProps) => (
  <Box {...props} sx={[{ pl: 2, overflow: 'hidden' }, ...(Array.isArray(props.sx) ? props.sx : [props.sx])]} />
);

export const SideDrawer = ({ onClose, ...props }: BoxProps & { onClose: React.MouseEventHandler<HTMLDivElement> }) => {
  const { isDark } = useIsDark();
  const theme = fr.colors.getHex({ isDark });

  return (
    <Box
      {...props}
      sx={[
        {
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1200,
          width: '100%',
          height: '100%',
          bgcolor: () => alpha(isDark ? '#ffffff' : '#161616', 0.3), // Don't remember for now how to retrieve values from `theme.decisions` but by inverting light and dark theme (in a hurry sorry)
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    >
      <Box
        role="button"
        onClick={onClose}
        sx={{
          position: 'absolute',
          inset: 0,
        }}
      />
      <Paper
        sx={{
          minWidth: 256,
          width: 'max-content',
          maxWidth: '80vw',
          height: '100%',
          overflow: 'auto',
          p: 2,
        }}
      >
        {props.children}
      </Paper>
    </Box>
  );
};
