import { cases } from '@mediature/main/src/fixtures/case';
import { CaseSchema } from '@mediature/main/src/models/entities/case';

describe('CaseSchema', () => {
  describe('parse()', () => {
    it('should be invalid due to wrong combination of booleans', async () => {
      const result = CaseSchema.safeParse({
        ...cases[0],
        alreadyRequestedInThePast: false,
        gotAnswerFromPreviousRequest: true,
      });

      expect(result.success).toBe(false);

      const result2 = CaseSchema.safeParse({
        ...cases[0],
        alreadyRequestedInThePast: false,
        gotAnswerFromPreviousRequest: false,
      });

      expect(result2.success).toBe(false);
    });

    it('should be a valid combination', async () => {
      const result = CaseSchema.safeParse({
        ...cases[0],
        alreadyRequestedInThePast: false,
        gotAnswerFromPreviousRequest: null,
      });

      expect(result.success).toBe(true);

      const result2 = CaseSchema.safeParse({
        ...cases[0],
        alreadyRequestedInThePast: true,
        gotAnswerFromPreviousRequest: false,
      });

      expect(result2.success).toBe(true);

      const result3 = CaseSchema.safeParse({
        ...cases[0],
        alreadyRequestedInThePast: true,
        gotAnswerFromPreviousRequest: false,
      });

      expect(result3.success).toBe(true);
    });
  });
});
