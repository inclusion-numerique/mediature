/**
 * @jest-environment node
 */
import { UserPasswordSchema } from '@mediature/main/src/models/entities/user';

describe('password input validation', () => {
  it('should be valid', () => {
    expect(() => {
      UserPasswordSchema.parse('Mypassword@1');
    }).not.toThrow();
  });

  it('should be invalid due to missing special character', () => {
    expect(() => {
      UserPasswordSchema.parse('Mypassword1');
    }).toThrow();
  });

  it('should be invalid due to missing numeric', () => {
    expect(() => {
      UserPasswordSchema.parse('Mypassword@');
    }).toThrow();
  });

  it('should be invalid due to length', () => {
    expect(() => {
      UserPasswordSchema.parse('M1rd@');
    }).toThrow();
  });

  it('should be invalid due to no lower/upper mix', () => {
    expect(() => {
      UserPasswordSchema.parse('mypassword@1');
    }).toThrow();
  });

  it('should be invalid when empty', () => {
    expect(() => {
      UserPasswordSchema.parse('');
    }).toThrow();
  });
});
