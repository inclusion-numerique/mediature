import ReplayIcon from '@mui/icons-material/Replay';
import Alert, { AlertProps } from '@mui/material/Alert';
import Button from '@mui/material/Button';

// import { QueryObserverResult, RefetchOptions } from '@tansack/query-core';

export interface ErrorAlertProps extends Pick<AlertProps, 'sx'> {
  errors: (Error | any)[];
  // TODO: impossible to import types... why?
  // refetchs: (options?: RefetchOptions) => Promise<QueryObserverResult<unknown, unknown>>[];
  refetchs?: ((options?: any) => Promise<any>)[];
}

export function ErrorAlert(props: ErrorAlertProps) {
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

  // TODO: if an error has a 5xx HTTP code we allow retrying
  const containsServerError: boolean = true;

  let errors: string[] = props.errors.map((error) => {
    // TODO: if there is a code error, try to translate
    return error.toString();
  });

  // Remove duplicates since it has no value
  errors = [...new Set(errors)];

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
