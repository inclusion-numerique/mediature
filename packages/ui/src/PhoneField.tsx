import { Button, Divider, InputAdornment, ListItemIcon, Menu, MenuItem, StandardTextFieldProps, TextField, Typography } from '@mui/material';
import { PhoneNumberUtil } from 'google-libphonenumber';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { IMaskInput } from 'react-imask';

import { PhoneInputSchemaType, PhoneTypeSchema } from '@mediature/main/src/models/entities/phone';
import { menuPaperProps } from '@mediature/ui/src/utils/menu';
import {
  CountryCallingCode,
  convertModelToGooglePhoneNumber,
  countryCallingCodes,
  getCountryCallingCode,
  getE164Number,
  transformPhoneNumberPlaceholderToMask,
} from '@mediature/ui/src/utils/phone';

const phoneNumberUtil = PhoneNumberUtil.getInstance();

interface CustomTextMaskInputProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

function createCustomTextMaskInput(numberMask: string) {
  return React.forwardRef<HTMLElement, CustomTextMaskInputProps>(function TextMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask={numberMask}
        definitions={{
          '#': /[0-9]/,
        }}
        inputRef={ref as any}
        onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
        overwrite
      />
    );
  });
}

// Set the PhoneField as customizable as TextField can be except for props we need
export interface PhoneFieldProps extends Omit<StandardTextFieldProps, 'value' | 'InputProps' | 'placeholder' | 'onChange'> {
  initialPhoneNumber?: PhoneInputSchemaType;
  onGlobalChange: (phone: PhoneInputSchemaType) => void;
}

export function PhoneField({ onGlobalChange, initialPhoneNumber, ...props }: PhoneFieldProps) {
  const { initialCountryCallingCode, initialFormattedNumber } = useMemo(() => {
    if (initialPhoneNumber && initialPhoneNumber.callingCode !== '' && initialPhoneNumber.countryCode !== '' && initialPhoneNumber.number !== '') {
      const countryCallingCode = getCountryCallingCode(initialPhoneNumber.callingCode, initialPhoneNumber.countryCode);
      if (countryCallingCode) {
        // Format the phone as the national number into the form value "number" (to respect the mask to fill)
        const fullPhoneNumber = convertModelToGooglePhoneNumber(initialPhoneNumber);
        const initialFormattedNumber = phoneNumberUtil.formatInOriginalFormat(fullPhoneNumber);

        return {
          initialCountryCallingCode: countryCallingCode,
          initialFormattedNumber: initialFormattedNumber,
        };
      }
    }

    return { initialCountryCallingCode: null, initialFormattedNumber: null };
  }, [initialPhoneNumber]);

  const [countryCallingCode, setCountryCallingCode] = useState<CountryCallingCode>(initialCountryCallingCode || countryCallingCodes[0]);
  const [numberFormattedValue, setNumberFormattedValue] = useState<string>(initialFormattedNumber || '');

  useEffect(() => {
    let e164Number: string;

    try {
      const fullPhoneNumber = phoneNumberUtil.parse(numberFormattedValue, countryCallingCode.countryCode);
      e164Number = getE164Number(fullPhoneNumber);

      // Until the number is fully filled leading zeros could be persisted in the value making the right length of a number...
      // It's fine since at the validation time it would say the number is invalid.
    } catch (err) {
      // If not a valid phone number yet we still give something to the parent that looks like a number for debug
      // but we make sure it's fully invalid.
      e164Number = `invalid-${numberFormattedValue.replace(/\D/g, '')}`;
    }

    onGlobalChange({
      phoneType: PhoneTypeSchema.Values.UNSPECIFIED,
      callingCode: countryCallingCode.id,
      countryCode: countryCallingCode.countryCode,
      number: e164Number,
    });
  }, [countryCallingCode.countryCode, countryCallingCode.id, numberFormattedValue, onGlobalChange]);

  const { CustomTextMask, numberPlaceholder } = useMemo(() => {
    // When changing the country calling code, reset the input UI
    const fullPhoneNumberExample = phoneNumberUtil.getExampleNumber(countryCallingCode.countryCode);

    // Note: the best thing would have been to display the "significant national number" instead of the "national number"
    // that can contain leading zero like for France. But no easy way to do it (seriously)... gave up, that's fine :)
    const numberPlaceholder = phoneNumberUtil.formatInOriginalFormat(fullPhoneNumberExample);

    const mask = transformPhoneNumberPlaceholderToMask(numberPlaceholder);
    const CustomTextMask = createCustomTextMaskInput(mask);

    return { CustomTextMask, numberPlaceholder };
  }, [countryCallingCode]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNumberFormattedValue(event.target.value);
  };

  const handleCountryCallingCodeChange = (iCountryCallingCode: CountryCallingCode) => () => {
    setCountryCallingCode(iCountryCallingCode);
  };

  return (
    <>
      <TextField
        label="Téléphone"
        value={numberFormattedValue}
        onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <>
                <Button
                  onClick={handleClick}
                  aria-label="options"
                  aria-controls={open ? 'phone-calling-code-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  startIcon={
                    <Typography component="span" sx={{ fontSize: 24 }}>
                      {countryCallingCode.flag}
                    </Typography>
                  }
                >
                  {countryCallingCode.id}
                </Button>
                <Divider orientation="vertical" sx={{ mx: 2 }} />
              </>
            </InputAdornment>
          ),
          inputComponent: CustomTextMask as any,
        }}
        placeholder={numberPlaceholder}
        {...props}
      />
      <Menu
        anchorEl={anchorEl}
        id="phone-calling-code-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          ...menuPaperProps,
          sx: {
            ...menuPaperProps.sx,
            maxHeight: '50vh',
            overflow: 'auto',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {countryCallingCodes.map((iCountryCallingCode) => {
          return (
            <MenuItem
              key={iCountryCallingCode.uniqueId}
              selected={iCountryCallingCode === countryCallingCode}
              onClick={handleCountryCallingCodeChange(iCountryCallingCode)}
            >
              <ListItemIcon sx={{ fontSize: 24 }}>{iCountryCallingCode.flag}</ListItemIcon>
              {iCountryCallingCode.countryName}
              <Typography component="span" variant="overline" sx={{ ml: 1 }}>
                ({iCountryCallingCode.id})
              </Typography>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
