import { GridProps } from '@mui/material';

export const centeredFormContainerGridProps: GridProps = {
  direction: 'column',
  sx: {
    maxWidth: '460px',
    px: 3,
    py: 6,
    mx: 'auto',
    justifyContent: 'center',
  },
};

export const mdCenteredFormContainerGridProps = {
  ...centeredFormContainerGridProps,
  sx: {
    ...centeredFormContainerGridProps.sx,
    maxWidth: 'md',
  },
};
