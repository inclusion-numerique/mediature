/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { fr } from '@codegouvfr/react-dsfr';
import { InitialEditorStateType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import { useTheme } from '@mui/material/styles';
import { EditorState, LexicalEditor } from 'lexical';

import Editor from './Editor';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import './index.scss';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import { TableContext } from './plugins/TablePlugin';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';

export interface EditorWrapperProps {
  initialEditorState?: InitialEditorStateType;
  onChange: (stringifiedEditorState: string) => void;
  error?: string;
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

  const muiTheme = useTheme();

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <FormControl error={!!props.error} sx={{ width: '100%' }}>
            <Card
              variant="outlined"
              className="editor-shell"
              sx={{
                pt: 0,
                backgroundColor: fr.colors.decisions.background.overlap.grey.default,
                borderColor: !!props.error ? muiTheme.palette.error.main : undefined,
              }}
              data-sentry-mask
            >
              <Editor />
            </Card>
            <FormHelperText>{props.error}</FormHelperText>
          </FormControl>
        </TableContext>
      </SharedHistoryContext>
      <OnChangePlugin
        onChange={(editorState: EditorState, editor: LexicalEditor) => {
          const inlineEditorState = JSON.stringify(editorState.toJSON());

          props.onChange(inlineEditorState);
        }}
        ignoreHistoryMergeTagChange={true}
        ignoreSelectionChange={true}
      />
    </LexicalComposer>
  );
}
