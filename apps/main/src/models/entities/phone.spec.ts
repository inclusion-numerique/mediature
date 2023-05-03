/**
 * @jest-environment node
 */
import { PhoneInputSchema, PhoneTypeSchema } from '@mediature/main/src/models/entities/phone';

describe('phone input validation', () => {
  it('should be valid for US', () => {
    expect(() => {
      PhoneInputSchema.parse({
        phoneType: PhoneTypeSchema.Values.UNSPECIFIED,
        callingCode: '+1',
        countryCode: 'US',
        number: '4242424444',
      });
    }).not.toThrow();
  });

  it('should be invalid for US since no region code', () => {
    expect(() => {
      PhoneInputSchema.parse({
        phoneType: PhoneTypeSchema.Values.UNSPECIFIED,
        callingCode: '+1',
        countryCode: 'US',
        number: '4242424',
      });
    }).toThrow();
  });

  it('should be valid for France', () => {
    expect(() => {
      PhoneInputSchema.parse({
        phoneType: PhoneTypeSchema.Values.UNSPECIFIED,
        callingCode: '+33',
        countryCode: 'FR',
        number: '611223344',
      });
    }).not.toThrow();
  });

  it('should be invalid for France due to remaining leading zero', () => {
    expect(() => {
      PhoneInputSchema.parse({
        phoneType: PhoneTypeSchema.Values.UNSPECIFIED,
        callingCode: '+33',
        countryCode: 'FR',
        number: '0611223344',
      });
    }).toThrow();
  });

  it('should fail since no valid calling code', () => {
    expect(() => {
      PhoneInputSchema.parse({
        phoneType: PhoneTypeSchema.Values.UNSPECIFIED,
        callingCode: 'a',
        countryCode: 'FR',
        number: '611223344',
      });
    }).toThrow();
  });
});
