import { DevTool } from '@hookform/devtools';
import { Alert, Grid } from '@mui/material';
import { FormEventHandler, PropsWithChildren, useState } from 'react';
import { Control, FieldErrorsImpl, FieldValues, UseFormHandleSubmit } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { stopSubmitPropagation } from '../utils/form';

export interface BaseFormProps<FormSchemaType extends FieldValues> {
  handleSubmit: UseFormHandleSubmit<FormSchemaType>;
  onSubmit: (input: FormSchemaType) => Promise<void>;
  control: Control<any>;
  ariaLabel: string;
  preventParentFormTrigger?: boolean;
}

// When you want to debug a form, just uncomment the below line (I did not see the value to manage it through environment variable)
export function BaseForm<FormSchemaType extends FieldValues>(props: PropsWithChildren<BaseFormProps<FormSchemaType>>) {
  const { t } = useTranslation('common');
  const [errors, setErrors] = useState<Partial<FieldErrorsImpl<any>>>(props.control._formState.errors);

  // Some forms in dialogs need to force stopping submit propagation leakage on parent forms
  const onSubmit: FormEventHandler<HTMLFormElement> = (...args) => {
    const submitChain = props.handleSubmit(props.onSubmit, (errors) => {
      setErrors(errors);
    });

    (props.preventParentFormTrigger ? stopSubmitPropagation(submitChain) : submitChain).apply(null, args);
  };

  return (
    <>
      {/* <DevTool control={props.control} /> */}

      <form onSubmit={onSubmit} aria-label={props.ariaLabel}>
        <Grid container spacing={2}>
          {Object.keys(errors).length > 0 && (
            <Grid item xs={12}>
              <Alert severity="error">{t('components.BaseForm.form_contains_errors', { count: Object.keys(errors).length })}</Alert>
            </Grid>
          )}

          {props.children}
        </Grid>
      </form>
    </>
  );
}
