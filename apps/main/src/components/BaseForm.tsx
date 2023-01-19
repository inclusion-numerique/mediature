import { DevTool } from '@hookform/devtools';
import { Grid } from '@mui/material';
import { PropsWithChildren } from 'react';
import { Control } from 'react-hook-form';

export interface BaseFormProps {
  onSubmit: React.FormEventHandler<HTMLFormElement> | undefined;
  control: Control<any>;
  ariaLabel: string;
}

export function BaseForm(props: PropsWithChildren<BaseFormProps>) {
  // When you want to debug a form, just uncomment the below line (I did not see the value to manage it through environment variable)

  return (
    <>
      {/* <DevTool control={props.control} /> */}

      <form onSubmit={props.onSubmit} aria-label={props.ariaLabel}>
        <Grid container spacing={2}>
          {props.children}
        </Grid>
      </form>
    </>
  );
}
