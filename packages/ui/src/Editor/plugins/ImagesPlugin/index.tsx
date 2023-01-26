/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  LexicalCommand,
  LexicalEditor,
  createCommand,
} from 'lexical';
import { useEffect } from 'react';

import { InsertImageModal } from '../../Modals';
import { $createImageNode, ImageNode, ImagePayload } from '../../nodes/ImageNode';
import { CAN_USE_DOM } from '../../shared/src/canUseDOM';

export type InsertImagePayload = Readonly<ImagePayload>;

const getDOMSelection = (targetWindow: Window | null): Selection | null => (CAN_USE_DOM ? (targetWindow || window).getSelection() : null);

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand('INSERT_IMAGE_COMMAND');

export function InsertImageDialog({ activeEditor, onClose }: { activeEditor: LexicalEditor; onClose: () => void }): JSX.Element {
  return <InsertImageModal activeEditor={activeEditor} onClose={onClose} />;
}

export default function ImagesPlugin({ captionsEnabled }: { captionsEnabled?: boolean }): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagesPlugin: ImageNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createImageNode(payload);
          $insertNodes([imageNode]);
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [captionsEnabled, editor]);

  return null;
}

const TRANSPARENT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const img = document.createElement('img');
img.src = TRANSPARENT_IMAGE;
