import { promises as fs } from 'fs';
import path from 'path';

import sampleAllElement from '@mediature/ui/src/Editor/sample-all-elements.lexical';
import { inlineEditorStateFromHtml, validateEditorState } from '@mediature/ui/src/utils/lexical';

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

  describe('inlineEditorStateFromHtml()', () => {
    it('should catch exception from lexical callbacks', async () => {
      const htmlContent = await fs.readFile(path.resolve(__dirname, '../../../../apps/main/src/fixtures/lexical/email-force-failure.html'), 'utf-8');

      await expect(inlineEditorStateFromHtml(htmlContent)).resolves.toThrow();
    });
  });
});
