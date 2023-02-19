/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useColors } from '@codegouvfr/react-dsfr/useColors';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import { $getRoot, $isParagraphNode } from 'lexical';
import { useEffect, useState } from 'react';

import useModal from '../../hooks/useModal';
import { SPEECH_TO_TEXT_COMMAND, SUPPORT_SPEECH_RECOGNITION } from '../SpeechToTextPlugin';

export default function ActionsPlugin({ isRichText }: { isRichText: boolean }): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [isSpeechToText, setIsSpeechToText] = useState(false);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [modal, showModal] = useModal();

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      })
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ dirtyElements, prevEditorState, tags }) => {
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        if (children.length > 1) {
          setIsEditorEmpty(false);
        } else {
          if ($isParagraphNode(children[0])) {
            const paragraphChildren = children[0].getChildren();
            setIsEditorEmpty(paragraphChildren.length === 0);
          } else {
            setIsEditorEmpty(false);
          }
        }
      });
    });
  }, [editor, isEditable]);

  const theme = useColors();

  return (
    <Grid container spacing={2} className="actions" sx={{ width: 'auto' }}>
      {SUPPORT_SPEECH_RECOGNITION && (
        <>
          <Grid item xs="auto">
            <IconButton
              onClick={() => {
                editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText);
                setIsSpeechToText(!isSpeechToText);
              }}
              title="Reconnaissance vocale"
              aria-label={`${isSpeechToText ? 'Activer' : 'Désactiver'} la reconnaissance vocale`}
              sx={{
                borderRadius: 0,
                color: theme.decisions.text.inverted.blueFrance.default,
                backgroundColor: isSpeechToText
                  ? theme.decisions.background.actionHigh.blueFrance.default
                  : `${theme.decisions.background.actionHigh.blueFrance.default} !important`,
                '&:hover': {
                  backgroundColor: theme.decisions.background.actionHigh.blueFrance.default,
                },
              }}
              aria-pressed={isSpeechToText}
            >
              {isSpeechToText ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
          </Grid>
        </>
      )}
      <Grid item xs="auto">
        <IconButton
          onClick={() => {
            editor.setEditable(!editor.isEditable());
          }}
          title="Editeur en mode lecture"
          aria-label={`${isEditable ? 'Activer' : 'Désactiver'} le mode lecture`}
          sx={{
            borderRadius: 0,
            color: theme.decisions.text.inverted.blueFrance.default,
            backgroundColor: `${theme.decisions.background.actionHigh.blueFrance.default} !important`,
            '&:hover': {
              backgroundColor: theme.decisions.background.actionHigh.blueFrance.default,
            },
          }}
          aria-pressed={!isEditable}
        >
          {!isEditable ? <LockOpenIcon /> : <LockIcon />}
        </IconButton>
      </Grid>
      {modal}
    </Grid>
  );
}
