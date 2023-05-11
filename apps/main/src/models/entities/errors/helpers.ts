import { CustomErrorInterface, CustomErrorProperties } from 'ts-custom-error';
import z, { IssueData } from 'zod';

export function customErrorToZodIssue(customError: CustomErrorInterface & CustomErrorProperties): IssueData {
  return {
    code: z.ZodIssueCode.custom,
    params: {
      type: customError.code,
    },
    message: customError.message,
  };
}
