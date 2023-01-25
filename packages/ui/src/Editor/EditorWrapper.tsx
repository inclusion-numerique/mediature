/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { $getRoot, RootNode } from 'lexical';

import Editor from './Editor';
import { SharedAutocompleteContext } from './context/SharedAutocompleteContext';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import './index.scss';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import { TableContext } from './plugins/TablePlugin';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';

export interface EditorWrapperProps {
  editorStateInitializer?: (rootNode: RootNode) => void;
}

export function EditorWrapper(props: EditorWrapperProps): JSX.Element {
  const editorStateFactory = () => {
    if (props.editorStateInitializer) {
      const root = $getRoot();

      props.editorStateInitializer(root);
    }
  };

  const initialConfig = {
    editorState: editorStateFactory,
    namespace: 'Playground',
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>
            <div className="editor-shell fr-card">
              <Editor />
            </div>
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}
