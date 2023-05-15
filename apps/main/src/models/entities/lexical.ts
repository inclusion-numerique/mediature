import z from 'zod';

import { createHeadlessEditorFromInlineState, editorStateToText, validateEditorStateFromEditor } from '@mediature/ui/src/utils/lexical';

// We differenciate `EditorState` from getters and mutations because as Lexical evolves it has schema changes (more or less properties even if empty)
// so we don't want to throw fatal errors when getting because even with a schema change the display should be fine, and if the will
// is to update this content, having it in the editor will use the new format that will be kept when saving
export const EditorStateSchema = z.string().min(1);
export type EditorStateSchemaType = z.infer<typeof EditorStateSchema>;

export const EditorStateInputSchema = EditorStateSchema.superRefine((val, ctx) => {
  try {
    // Create the editor separately to reuse between the 2 checks (otherwise it's a bit performance consuming)
    const editor = createHeadlessEditorFromInlineState(val);
    validateEditorStateFromEditor(editor, val);

    // For now we check there is some "text" inside, it still allows empty table... but maybe
    // there is an edge case where it's considered empty whereas it's not... so maybe to adjust the condition in the future
    const textContent = editorStateToText(editor);

    if (textContent === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `ce champ ne peut pas être vide`,
      });
    }
  } catch (err) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `ce champ texte a un mauvais formattage`,
    });
  }
});
export type EditorStateInputSchemaType = z.infer<typeof EditorStateInputSchema>;
