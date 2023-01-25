/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import type { LexicalEditor } from 'lexical';
import { $getRoot, $isParagraphNode } from 'lexical';
import { useEffect, useState } from 'react';

import useModal from '../../hooks/useModal';
import { SPEECH_TO_TEXT_COMMAND, SUPPORT_SPEECH_RECOGNITION } from '../SpeechToTextPlugin';

async function sendEditorState(editor: LexicalEditor): Promise<void> {
  const stringifiedEditorState = JSON.stringify(editor.getEditorState());
  try {
    await fetch('http://localhost:1235/setEditorState', {
      body: stringifiedEditorState,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      method: 'POST',
    });
  } catch {
    // NO-OP
  }
}

async function validateEditorState(editor: LexicalEditor): Promise<void> {
  const stringifiedEditorState = JSON.stringify(editor.getEditorState());
  let response = null;
  try {
    response = await fetch('http://localhost:1235/validateEditorState', {
      body: stringifiedEditorState,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      method: 'POST',
    });
  } catch {
    // NO-OP
  }
  if (response !== null && response.status === 403) {
    throw new Error('Editor state validation failed! Server did not accept changes.');
  }
}

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
      // If we are in read only mode, send the editor state
      // to server and ask for validation if possible.
      if (!isEditable && dirtyElements.size > 0 && !tags.has('historic') && !tags.has('collaboration')) {
        validateEditorState(editor);
      }
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

  return (
    <div className="actions">
      {SUPPORT_SPEECH_RECOGNITION && (
        <button
          onClick={() => {
            editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText);
            setIsSpeechToText(!isSpeechToText);
          }}
          className={'action-button action-button-mic ' + (isSpeechToText ? 'active' : '')}
          title="Speech To Text"
          aria-label={`${isSpeechToText ? 'Enable' : 'Disable'} speech to text`}
        >
          <i className="mic" />
        </button>
      )}
      <button
        className={`action-button ${!isEditable ? 'unlock' : 'lock'}`}
        onClick={() => {
          // Send latest editor state to commenting validation server
          if (isEditable) {
            sendEditorState(editor);
          }
          editor.setEditable(!editor.isEditable());
        }}
        title="Read-Only Mode"
        aria-label={`${!isEditable ? 'Unlock' : 'Lock'} read-only mode`}
      >
        <i className={!isEditable ? 'unlock' : 'lock'} />
      </button>
      {modal}
    </div>
  );
}
