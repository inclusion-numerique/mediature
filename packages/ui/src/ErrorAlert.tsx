import ReplayIcon from '@mui/icons-material/Replay';
import Alert, { AlertProps } from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { TRPCClientErrorLike } from '@trpc/client';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import z from 'zod';

import { formatMessageFromIssue } from '@mediature/main/src/i18n';
import { CustomError, internalServerErrorError, unexpectedErrorError } from '@mediature/main/src/models/entities/errors';
import { capitalizeFirstLetter, formatMessageFromCustomError } from '@mediature/main/src/models/entities/errors/helpers';
import { AppRouter } from '@mediature/main/src/server/app-router';

// import { QueryObserverResult, RefetchOptions } from '@tansack/query-core';

export interface ErrorAlertProps extends Pick<AlertProps, 'sx'> {
  errors: (TRPCClientErrorLike<AppRouter> | Error)[]; // Errors can be from the network (tRPC most of the time) or local
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
      if (error instanceof Error && error.name === 'TRPCClientError') {
        const trpcError = error as unknown as TRPCClientErrorLike<AppRouter>;

        if (trpcError.data?.zodError) {
          // Format to benefit from all the typings
          const zodError = new z.ZodError(trpcError.data?.zodError);

          for (const issue of zodError.issues) {
            // As fallback display the error message from the server, should be good enough but can be in another language
            errs.push(formatMessageFromIssue(issue) || issue.message);
          }
        } else if (trpcError.data?.customError) {
          const customErrorPayload = trpcError.data.customError as CustomError;
          const customError = new CustomError(customErrorPayload.code, customErrorPayload.message);

          errs.push(formatMessageFromCustomError(customError) || customError.message);
        } else {
          // If not a validation error (`ZodError`), nor a business error (`BusinessError`), consider it as a server error that can be retried
          containsServerError = true;

          // The API is supposed to hide details so show internal server error translation
          errs.push(t(`errors.custom.${internalServerErrorError.code as 'internalServerError'}`));
        }
      } else if (error instanceof CustomError) {
        // Custom error can also occur from frontend directly
        errs.push(formatMessageFromCustomError(error) || error.message);
      } else {
        console.error(error);

        // The error is not formatted to be displayed so using a generic message
        errs.push(t(`errors.custom.${unexpectedErrorError.code as 'unexpectedError'}`));
      }
    }

    // Remove duplicates since it has no value
    // and uppercase the first letter of each since our errors are lowercase by default to combine them as we want
    return [...new Set(errs)].map((err) => capitalizeFirstLetter(err));
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
