import { DevTool } from '@hookform/devtools';
import { Grid } from '@mui/material';
import { PropsWithChildren } from 'react';
import { Control } from 'react-hook-form';

import { stopSubmitPropagation } from '../utils/form';

export interface BaseFormProps {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  control: Control<any>;
  ariaLabel: string;
  preventParentFormTrigger?: boolean;
}

export function BaseForm(props: PropsWithChildren<BaseFormProps>) {
  // When you want to debug a form, just uncomment the below line (I did not see the value to manage it through environment variable)

  // Some forms in dialogs need to force stopping submit propagation leakage on parent forms
  const onSubmit = props.preventParentFormTrigger ? stopSubmitPropagation(props.onSubmit) : props.onSubmit;

  return (
    <>
      {/* <DevTool control={props.control} /> */}

      <form onSubmit={onSubmit} aria-label={props.ariaLabel}>
        <Grid container spacing={2}>
          {props.children}
        </Grid>
      </form>
    </>
  );
}
