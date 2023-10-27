import ReplayIcon from '@mui/icons-material/Replay';
import Alert, { AlertProps } from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import z from 'zod';

import { formatMessageFromIssue } from '@mediature/main/src/i18n';

// import { QueryObserverResult, RefetchOptions } from '@tansack/query-core';

export interface ErrorAlertProps extends Pick<AlertProps, 'sx'> {
  errors: (Error | any)[];
  // TODO: impossible to import types... why?
  // refetchs: (options?: RefetchOptions) => Promise<QueryObserverResult<unknown, unknown>>[];
  refetchs?: ((options?: any) => Promise<any>)[];
}

export function ErrorAlert(props: ErrorAlertProps) {
  const { t } = useTranslation('common');

  if (props.errors.length === 0) {
    return <></>;
  }

  const retry = props.refetchs
    ? ((refetchs: ((options?: any) => Promise<any>)[]) => {
        return async () => {
          await Promise.all(
            refetchs.map((refetch) => {
              return refetch();
            })
          );
        };
      })(props.refetchs)
    : null;

  let containsServerError: boolean = true;

  const errors = useMemo(() => {
    let errs: string[] = [];
    for (const error of props.errors) {
      if (error.data?.zodError) {
        // Format to benefit from all the typings
        const zodError = new z.ZodError(error.data?.zodError);

        for (const issue of zodError.issues) {
          // As fallback display the error message from the server, should be good enough but can be in another language
          errs.push(formatMessageFromIssue(issue) || issue.message);
        }
      } else if (error.data?.businessError) {
        // TODO:
      } else {
        // If not a validation error (`ZodError`), nor a business error (`BusinessError`), consider it as a server error that can be retried
        containsServerError = true;

        errs.push(error.message || 'unknown error');
      }
    }

    // Remove duplicates since it has no value
    return [...new Set(errs)];
  }, [props.errors]);

  return (
    <Alert
      severity="error"
      sx={{
        ...(props.sx || {}),
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
    >
      {errors.length === 1 ? (
        <>{errors[0]}</>
      ) : (
        <>
          Plusieurs erreurs ont été rencontrées :
          <br />
          <ul>
            {errors.map((error) => {
              return <li key={error}>{error}</li>;
            })}
          </ul>
        </>
      )}
      {retry && containsServerError && (
        <>
          <br />
          <Button
            onClick={retry}
            size="large"
            variant="contained"
            color="error"
            startIcon={<ReplayIcon />}
            sx={{
              display: 'flex',
              mt: 2,
              ml: 'auto',
              mr: 'auto',
            }}
          >
            Réessayer
          </Button>
        </>
      )}
    </Alert>
  );
}
