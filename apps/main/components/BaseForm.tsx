import { Box, Grid } from '@mui/material';
import { PropsWithChildren } from 'react';

export interface BaseFormProps {
  onSubmit: React.FormEventHandler<HTMLFormElement> | undefined;
}

export function BaseForm(props: PropsWithChildren<BaseFormProps>) {
  // When you want to debug a form, just uncomment the below line (I did not see the value to manage it through environment variable)

  return (
    <>
      {/* <DevTool control={control} /> */}

      <form onSubmit={props.onSubmit}>
        <Grid container spacing={2}>
          {props.children}
        </Grid>
      </form>
    </>
  );
}
