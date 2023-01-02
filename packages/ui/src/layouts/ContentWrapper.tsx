import { Box } from '@mui/material';
import { PropsWithChildren } from 'react';

export function ContentWrapper(props: PropsWithChildren) {
  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flex: '1 1 auto',
      }}
    >
      {props.children}
    </Box>
  );
}
