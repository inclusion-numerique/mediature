import { Box, CircularProgress } from '@mui/material';
import * as React from 'react';

export interface LoadingAreaProps {
  minHeight?: string | null;
  height?: string | null;
  loaderSize?: number | 'medium' | 'large' | 'small';
}

export const LoadingArea = (props: LoadingAreaProps) => {
  let loaderSize: number;

  if (!props.loaderSize || props.loaderSize === 'medium') {
    loaderSize = 30;
  } else if (props.loaderSize === 'large') {
    loaderSize = 40;
  } else if (props.loaderSize === 'small') {
    loaderSize = 20;
  } else {
    throw new Error('wrong loader size provided');
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <CircularProgress size={loaderSize} />
    </Box>
  );
};
