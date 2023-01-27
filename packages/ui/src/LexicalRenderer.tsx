import { createHeadlessEditor } from '@lexical/headless';
import { $generateHtmlFromNodes } from '@lexical/html';
import * as React from 'react';

import PlaygroundNodes from '@mediature/ui/src/Editor/nodes/PlaygroundNodes';

export interface LexicalRendererProps {
  inlineEditorState: string;
}

export function inlineEditorStateToHtml(inlineEditorState: string): string {
  const editor = createHeadlessEditor({
    nodes: PlaygroundNodes,
    onError: (err) => {
      console.error(err);
    },
  });

  const editorStateJSON = JSON.parse(inlineEditorState);
  editor.setEditorState(editor.parseEditorState(editorStateJSON));

  let htmlContent: string | null = null;

  editor.update(() => {
    htmlContent = $generateHtmlFromNodes(editor, null);
  });

  if (!htmlContent) {
    throw new Error('cannot get the html from the editor state');
  }

  return htmlContent;
}

export function LexicalRenderer(props: LexicalRendererProps) {
  const htmlContent = inlineEditorStateToHtml(props.inlineEditorState);

  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
