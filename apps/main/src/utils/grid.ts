import { GridProps } from '@mui/material';

export const centeredContainerGridProps: GridProps = {
  sx: {
    maxWidth: 'lg',
    mx: 'auto',
    px: 3,
    py: 6,
  },
};

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

export const ulComponentResetStyles = {
  listStyle: 'none',
  paddingInlineStart: 0,
  marginBlockStart: 0,
  marginBlockEnd: 0,
};
