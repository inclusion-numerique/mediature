import { DevTool } from '@hookform/devtools';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import { Mutex } from 'locks';
import { FormEventHandler, PropsWithChildren, useRef, useState } from 'react';
import { Control, FieldErrorsImpl, FieldValues, UseFormHandleSubmit } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { stopSubmitPropagation } from '@mediature/main/src/utils/form';
import { ErrorAlert } from '@mediature/ui/src/ErrorAlert';

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
  const [validationErrors, setValidationErrors] = useState<Partial<FieldErrorsImpl<any>>>(props.control._formState.errors);
  const [onSubmitError, setOnSubmitError] = useState<Error | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null); // This is used to scroll to the error messages
  const [mutex] = useState<Mutex>(new Mutex());

  // Some forms in dialogs need to force stopping submit propagation leakage on parent forms
  const onSubmit: FormEventHandler<HTMLFormElement> = async (...args) => {
    // If it's already running, quit
    if (!mutex.tryLock()) {
      args[0].preventDefault();
      return;
    }

    try {
      const submitChain = props.handleSubmit(
        async (input: FormSchemaType) => {
          try {
            await props.onSubmit(input);
          } catch (err: unknown) {
            if (err instanceof Error) {
              setOnSubmitError(err);
            } else {
              setOnSubmitError(err as any); // The default case is good enough for now
            }

            formRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        },
        (errors) => {
          // Only triggered on inputs validation errors
          setValidationErrors(errors);

          formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      );

      await (props.preventParentFormTrigger ? stopSubmitPropagation(submitChain) : submitChain).apply(null, args);
    } finally {
      // Unlock to allow a new submit
      mutex.unlock();
    }
  };

  return (
    <>
      {/* <DevTool control={props.control} /> */}

      <form onSubmit={onSubmit} aria-label={props.ariaLabel}>
        <Grid container spacing={2} ref={formRef}>
          {!!onSubmitError && (
            <Grid item xs={12} sx={{ py: 2 }}>
              <ErrorAlert errors={[onSubmitError]} />
            </Grid>
          )}

          {Object.keys(validationErrors).length > 0 && (
            <Grid item xs={12} sx={{ py: 2 }}>
              <Alert severity="error">{t('components.BaseForm.form_contains_errors', { count: Object.keys(validationErrors).length })}</Alert>
            </Grid>
          )}

          {props.children}
        </Grid>
      </form>
    </>
  );
}
