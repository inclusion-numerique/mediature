import { PhoneNumber, PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

import { PhoneInputSchemaType } from '@mediature/main/src/models/entities/phone';
import { mostUsedSortedCountries } from '@mediature/ui/src/utils/country';

export interface CountryCallingCode {
  countryCode: string;
  countryName: string;
  id: string;
  uniqueId: string;
  flag: string;
}

const tmpCountryCallingCodes: CountryCallingCode[] = [];

for (const country of mostUsedSortedCountries) {
  for (const callingCode of country.countryCallingCodes) {
    tmpCountryCallingCodes.push({
      countryCode: country.alpha2,
      countryName: country.name,
      id: callingCode,
      uniqueId: country.alpha2 + ':' + callingCode,
      flag: country.emoji,
    });
  }
}

export const countryCallingCodes = tmpCountryCallingCodes;

export function getCountryCallingCode(callingCode: string, countryCode: string): CountryCallingCode | null {
  return (
    countryCallingCodes.find((countryCallingCode) => {
      return countryCallingCode.id === callingCode && countryCallingCode.countryCode === countryCode;
    }) || null
  );
}

export function transformPhoneNumberPlaceholderToMask(phoneNumberPlaceholder: string): string {
  const original = phoneNumberPlaceholder;
  let mask = '';

  let maskChar;
  for (const char of original) {
    if (!isNaN(parseInt(char, 10))) {
      maskChar = '#';
    } else {
      maskChar = char;
    }

    mask += maskChar;
  }

  return mask;
}

// Helper to retrieve Google object from our own model
export function convertModelToGooglePhoneNumber(phoneNumber: PhoneInputSchemaType): PhoneNumber {
  const phoneNumberUtil = PhoneNumberUtil.getInstance();
  const potentialE164Number: string = `${phoneNumber.callingCode}${phoneNumber.number}`;
  const fullPhoneNumber = phoneNumberUtil.parse(potentialE164Number, phoneNumber.countryCode);

  return fullPhoneNumber;
}

// This returns "611223344" in case the phone number E164 format would be "+33611223344"
export function getE164Number(fullPhoneNumber: PhoneNumber): string {
  const phoneNumberUtil = PhoneNumberUtil.getInstance();
  const e164PhoneNumber = phoneNumberUtil.format(fullPhoneNumber, PhoneNumberFormat.E164);

  // Remove the calling code from the E164 format
  const callingCodeNumber: number = fullPhoneNumber.getCountryCodeOrDefault();
  const regexp = new RegExp(`^(\\+${callingCodeNumber})`, 'g');
  const e164Number = e164PhoneNumber.replace(regexp, '').trim();

  return e164Number;
}
