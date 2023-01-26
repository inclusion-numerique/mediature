/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useColors } from '@codegouvfr/react-dsfr/useColors';
import { InitialEditorStateType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { Card } from '@mui/material';

import Editor from './Editor';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import './index.scss';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import { TableContext } from './plugins/TablePlugin';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';

export interface EditorWrapperProps {
  initialEditorState?: InitialEditorStateType;
}

// The whole `Editor` folder is based on the `lexical-playground` since there is for now no all-in-one solution
// I adapted it quickly to MUI so get theming and coherence with the rest of the design. I didn't change the logic of how it works
// so to customize you would need to get hands dirty! Sorry about that :)
export function EditorWrapper(props: EditorWrapperProps): JSX.Element {
  const initialConfig = {
    editorState: props.initialEditorState || null,
    namespace: 'Playground',
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
  };

  const theme = useColors();

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <Card variant="outlined" className="editor-shell" sx={{ pt: 0, backgroundColor: theme.decisions.background.overlap.grey.default }}>
            <Editor />
          </Card>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}
