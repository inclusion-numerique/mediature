/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useColors } from '@codegouvfr/react-dsfr/useColors';
import { $isCodeHighlightNode } from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import AddIcon from '@mui/icons-material/Add';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CalculateIcon from '@mui/icons-material/Calculate';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CodeIcon from '@mui/icons-material/Code';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FormatShapesIcon from '@mui/icons-material/FormatShapes';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import GridOnIcon from '@mui/icons-material/GridOn';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import Looks3Icon from '@mui/icons-material/Looks3';
import Looks4Icon from '@mui/icons-material/Looks4';
import Looks5Icon from '@mui/icons-material/Looks5';
import Looks6Icon from '@mui/icons-material/Looks6';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import RedoIcon from '@mui/icons-material/Redo';
import StrikethroughIcon from '@mui/icons-material/StrikethroughS';
import SubjectIcon from '@mui/icons-material/Subject';
import SubscriptIcon from '@mui/icons-material/Subscript';
import SuperscriptIcon from '@mui/icons-material/Superscript';
import UndoIcon from '@mui/icons-material/Undo';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import { Grid, IconButton } from '@mui/material';
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { getDOMRangeRect } from '../../utils/getDOMRangeRect';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { setFloatingElemPosition } from '../../utils/setFloatingElemPosition';
import './index.css';

// This is required because MUI does not allow `selected={true}` on `IconButton`,
// we use thos component because `ToggleButton` they prevent displaying a different variant than `contained`
const iconButtonPressedBackgroundColors = {
  light: 'rgba(0, 0, 145, 0.08)',
  dark: 'rgba(133, 133, 246, 0.16)',
};

function TextFormatFloatingToolbar({
  editor,
  anchorElem,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isCode,
  isStrikethrough,
  isSubscript,
  isSuperscript,
}: {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  isBold: boolean;
  isCode: boolean;
  isItalic: boolean;
  isLink: boolean;
  isStrikethrough: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  isUnderline: boolean;
}): JSX.Element {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection();

    const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
    const nativeSelection = window.getSelection();

    if (popupCharStylesEditorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      setFloatingElemPosition(rangeRect, popupCharStylesEditorElem, anchorElem);
    }
  }, [editor, anchorElem]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateTextFormatFloatingToolbar();
      });
    };

    window.addEventListener('resize', update);
    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update);
    }

    return () => {
      window.removeEventListener('resize', update);
      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update);
      }
    };
  }, [editor, updateTextFormatFloatingToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateTextFormatFloatingToolbar();
    });
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateTextFormatFloatingToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, updateTextFormatFloatingToolbar]);

  const theme = useColors();
  const isDark = theme.isDark;

  return (
    <Grid
      container
      direction="row"
      ref={popupCharStylesEditorRef}
      className="floating-text-format-popup"
      sx={{
        width: 'auto',
        zIndex: 100,
        backgroundColor: theme.decisions.background.overlap.grey.default,
        border: `${theme.decisions.border.default.grey.default} solid 1px`,
        p: 1,
      }}
    >
      {editor.isEditable() && (
        <>
          <Grid item>
            <IconButton
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
              }}
              title="Gras"
              size="small"
              sx={{
                borderRadius: 0,
                backgroundColor: isBold ? (isDark ? iconButtonPressedBackgroundColors.dark : iconButtonPressedBackgroundColors.light) : undefined,
              }}
            >
              <FormatBoldIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
              }}
              title="Italique"
              size="small"
              sx={{
                borderRadius: 0,
                backgroundColor: isItalic ? (isDark ? iconButtonPressedBackgroundColors.dark : iconButtonPressedBackgroundColors.light) : undefined,
              }}
            >
              <FormatItalicIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
              }}
              title="Souligné"
              size="small"
              sx={{
                borderRadius: 0,
                backgroundColor: isUnderline
                  ? isDark
                    ? iconButtonPressedBackgroundColors.dark
                    : iconButtonPressedBackgroundColors.light
                  : undefined,
              }}
            >
              <FormatUnderlinedIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
              }}
              title="Barré"
              size="small"
              sx={{
                borderRadius: 0,
                backgroundColor: isStrikethrough
                  ? isDark
                    ? iconButtonPressedBackgroundColors.dark
                    : iconButtonPressedBackgroundColors.light
                  : undefined,
              }}
            >
              <StrikethroughIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
              }}
              title="Indice"
              size="small"
              sx={{
                borderRadius: 0,
                backgroundColor: isSubscript
                  ? isDark
                    ? iconButtonPressedBackgroundColors.dark
                    : iconButtonPressedBackgroundColors.light
                  : undefined,
              }}
            >
              <SubscriptIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
              }}
              title="Exposant"
              size="small"
              sx={{
                borderRadius: 0,
                backgroundColor: isSuperscript
                  ? isDark
                    ? iconButtonPressedBackgroundColors.dark
                    : iconButtonPressedBackgroundColors.light
                  : undefined,
              }}
            >
              <SuperscriptIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
              }}
              title="Code"
              size="small"
              sx={{
                borderRadius: 0,
                backgroundColor: isCode ? (isDark ? iconButtonPressedBackgroundColors.dark : iconButtonPressedBackgroundColors.light) : undefined,
              }}
            >
              <CodeIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton
              onClick={insertLink}
              title="Lien"
              size="small"
              sx={{
                borderRadius: 0,
                backgroundColor: isLink ? (isDark ? iconButtonPressedBackgroundColors.dark : iconButtonPressedBackgroundColors.light) : undefined,
              }}
            >
              <InsertLinkIcon />
            </IconButton>
          </Grid>
        </>
      )}
    </Grid>
  );
}

function useFloatingTextFormatToolbar(editor: LexicalEditor, anchorElem: HTMLElement): JSX.Element | null {
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (nativeSelection !== null && (!$isRangeSelection(selection) || rootElement === null || !rootElement.contains(nativeSelection.anchorNode))) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsSubscript(selection.hasFormat('subscript'));
      setIsSuperscript(selection.hasFormat('superscript'));
      setIsCode(selection.hasFormat('code'));

      // Update links
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (!$isCodeHighlightNode(selection.anchor.getNode()) && selection.getTextContent() !== '') {
        setIsText($isTextNode(node));
      } else {
        setIsText(false);
      }
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener('selectionchange', updatePopup);
    return () => {
      document.removeEventListener('selectionchange', updatePopup);
    };
  }, [updatePopup]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      })
    );
  }, [editor, updatePopup]);

  if (!isText || isLink) {
    return null;
  }

  return createPortal(
    <TextFormatFloatingToolbar
      editor={editor}
      anchorElem={anchorElem}
      isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isStrikethrough={isStrikethrough}
      isSubscript={isSubscript}
      isSuperscript={isSuperscript}
      isUnderline={isUnderline}
      isCode={isCode}
    />,
    anchorElem
  );
}

export default function FloatingTextFormatToolbarPlugin({ anchorElem = document.body }: { anchorElem?: HTMLElement }): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingTextFormatToolbar(editor, anchorElem);
}
