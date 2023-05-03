import { inlineEditorStateToHtml } from '@mediature/ui/src/utils/lexical';

export interface LexicalRendererProps {
  inlineEditorState: string;
}

export function LexicalRenderer(props: LexicalRendererProps) {
  const htmlContent = inlineEditorStateToHtml(props.inlineEditorState);

  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
