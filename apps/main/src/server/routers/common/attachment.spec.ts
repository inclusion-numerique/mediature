/**
 * @jest-environment node
 */
import { generateSignedAttachmentLink, getLastModuloTime, verifySignedAttachmentLink } from '@mediature/main/src/server/routers/common/attachment';

describe('signed file URL', () => {
  const secret = new TextEncoder().encode('cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('December 15, 2022 03:24:00'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should generate timed signed link', async () => {
    const signedUrl = await generateSignedAttachmentLink('00000000-0000-0000-0000-000000000000', secret);

    expect(signedUrl).toBe(
      'http://localhost:3000/api/file/00000000-0000-0000-0000-000000000000?token=eyJhbGciOiJIUzI1NiJ9.eyJ1cm46Y2xhaW06ZmlsZV9pZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCIsImlhdCI6MTY3MTA3MDgwMCwiZXhwIjoxNjcxMDcxNzAwfQ.vXz58MqY90PYLyptsVpgyCrF9AsE41NbYrMAJScTY6I'
    );
  });

  it('should shift with the modulo interval', async () => {
    const lastModuloTime = getLastModuloTime();

    expect(lastModuloTime).toStrictEqual(new Date('December 15, 2022 03:20:00'));
  });

  it('should fail verifying the token expiration and validity', async () => {
    jest.useRealTimers();

    const verification = await verifySignedAttachmentLink(
      '00000000-0000-0000-0000-000000000000',
      secret,
      'eyJhbGciOiJIUzI1NiJ9.eyJ1cm46Y2xhaW06ZmlsZV9pZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCIsImlhdCI6MTY3MTA3MDgwMCwiZXhwIjoxNjcxMDcxNzAwfQ.vXz58MqY90PYLyptsVpgyCrF9AsE41NbYrMAJScTY6I'
    );

    expect(verification.isExpired).toBe(true);
    expect(verification.isVerified).toBe(false);
  });

  it('should pass verifying the token expiration and validity', async () => {
    jest.useRealTimers();

    const signedUrl = await generateSignedAttachmentLink('00000000-0000-0000-0000-000000000000', secret);
    const token = new URL(signedUrl).searchParams.get('token') as string;

    const verification = await verifySignedAttachmentLink('00000000-0000-0000-0000-000000000000', secret, token);

    expect(verification.isExpired).toBe(false);
    expect(verification.isVerified).toBe(true);
  });
});
