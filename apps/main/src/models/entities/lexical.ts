import z from 'zod';

import { validateEditorState } from '@mediature/ui/src/utils/lexical';

export const EditorStateSchema = z
  .string()
  .min(1)
  .refine(
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
export type EditorStateSchemaType = z.infer<typeof EditorStateSchema>;
