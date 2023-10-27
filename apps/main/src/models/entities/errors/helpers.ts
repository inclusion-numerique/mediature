import { CustomErrorInterface, CustomErrorProperties } from 'ts-custom-error';
import z, { IssueData } from 'zod';

export interface ZodIssueOptions {
  overridePath?: string[];
}

export function customErrorToZodIssue(customError: CustomErrorInterface & CustomErrorProperties, options?: ZodIssueOptions): IssueData {
  return {
    path: options?.overridePath || undefined,
    code: z.ZodIssueCode.custom,
    params: {
      type: customError.code,
    },
    message: customError.message,
  };
}
