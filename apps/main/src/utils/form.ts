import { TypographyProps } from '@mui/material';
import { RegisterOptions } from 'react-hook-form';

export function forceHtmlRadioOutputToBeBoolean(value: string | null): boolean | null {
  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  } else if (value === null) {
    // Sometimes the radio group can be optional, allow this case
    return null;
  } else {
    throw new Error(`this radio group is supposed to only manage string boolean values ("true", "false"), or can optionally be null.`);
  }
}

export const reactHookFormBooleanRadioGroupRegisterOptions = {
  setValueAs: forceHtmlRadioOutputToBeBoolean,
} as RegisterOptions;

export const formTitleProps: TypographyProps<'h1'> = {
  variant: 'h4',
  sx: {
    mb: 2,
  },
};
