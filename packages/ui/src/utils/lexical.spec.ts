import sampleAllElement from '@mediature/ui/src/Editor/sample-all-elements.lexical';
import { validateEditorState } from '@mediature/ui/src/utils/lexical';

describe('lexical', () => {
  describe('validateEditorState()', () => {
    it('should be valid', async () => {
      expect(() => {
        validateEditorState(sampleAllElement);
      }).not.toThrow();
    });

    it('empty string should be invalid', async () => {
      expect(() => {
        validateEditorState('');
      }).toThrow();
    });
  });
});
