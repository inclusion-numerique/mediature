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
    it('should pass by implicitly adding a parent to node root', async () => {
      const htmlContent = await fs.readFile(path.resolve(__dirname, '../../../../apps/main/src/fixtures/lexical/email-real-payload.html'), 'utf-8');

      const inlineEditorState = await inlineEditorStateFromHtml(htmlContent);

      expect(inlineEditorState).toStrictEqual(
        `{\"root\":{\"children\":[{\"type\":\"horizontalrule\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"This is the quoted message\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"type\":\"horizontalrule\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Hello, this is the normal message.\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}`
      );
    });
  });
});
