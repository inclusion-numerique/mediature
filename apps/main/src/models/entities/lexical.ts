import z from 'zod';

import { validateEditorState } from '@mediature/ui/src/utils/lexical';

// We differenciate `EditorState` from getters and mutations because as Lexical evolves it has schema changes (more or less properties even if empty)
// so we don't want to throw fatal errors when getting because even with a schema change the display should be fine, and if the will
// is to update this content, having it in the editor will use the new format that will be kept when saving
export const EditorStateSchema = z.string().min(1);
export type EditorStateSchemaType = z.infer<typeof EditorStateSchema>;

export const EditorStateInputSchema = EditorStateSchema.refine(
  (val) => {
    try {
      validateEditorState(val);

      return true;
    } catch (err) {
      return false;
    }
  },
  {
    message: 'le texte éditable fourni a un mauvais formattage',
  }
);
export type EditorStateInputSchemaType = z.infer<typeof EditorStateInputSchema>;
