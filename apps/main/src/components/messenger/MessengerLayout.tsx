import { useColors } from '@codegouvfr/react-dsfr/useColors';
import Box, { BoxProps } from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import * as React from 'react';

export const Root = (props: BoxProps) => (
  <Box
    {...props}
    sx={[
      {
        bgcolor: 'background.bodyEmail',
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr',
          md: 'minmax(300px, 500px) minmax(600px, 1fr)',
        },
        gridTemplateRows: '64px 1fr',
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
        // position: 'sticky',
        // top: '1rem',
        bgcolor: 'background.componentBg',
        display: {
          xs: 'none',
          md: 'initial',
        },
      },
      ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
    ]}
  />
);

export const Main = (props: BoxProps) => <Box {...props} sx={[{ pl: 2 }, ...(Array.isArray(props.sx) ? props.sx : [props.sx])]} />;

export const SideDrawer = ({ onClose, ...props }: BoxProps & { onClose: React.MouseEventHandler<HTMLDivElement> }) => {
  const theme = useColors();

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
          bgcolor: () => alpha(theme.isDark ? '#ffffff' : '#161616', 0.3), // Don't remember for now how to retrieve values from `theme.decisions` but by inverting light and dark theme (in a hurry sorry)
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
          p: 2,
          boxShadow: 'lg',
          bgcolor: 'background.componentBg',
        }}
      >
        {props.children}
      </Paper>
    </Box>
  );
};
