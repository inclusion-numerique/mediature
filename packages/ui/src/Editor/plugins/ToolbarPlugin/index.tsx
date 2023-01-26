/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useColors } from '@codegouvfr/react-dsfr/useColors';
import { $createCodeNode, $isCodeNode, CODE_LANGUAGE_FRIENDLY_NAME_MAP, CODE_LANGUAGE_MAP, getLanguageFriendlyName } from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { $createHeadingNode, $createQuoteNode, $isHeadingNode, HeadingTagType } from '@lexical/rich-text';
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
  $selectAll,
  $setBlocksType_experimental,
} from '@lexical/selection';
import { $findMatchingParent, $getNearestBlockElementAncestorOrThrow, $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
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
import { Grid, IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import type { LexicalEditor, NodeKey } from 'lexical';
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  DEPRECATED_$isGridSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import useModal from '../../hooks/useModal';
import { IS_APPLE } from '../../shared/src/environment';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { sanitizeUrl } from '../../utils/url';
import { INSERT_COLLAPSIBLE_COMMAND } from '../CollapsiblePlugin';
import { InsertEquationDialog } from '../EquationsPlugin';
import { InsertImageDialog } from '../ImagesPlugin';
import { InsertTableDialog } from '../TablePlugin';

export const menuPaperProps = {
  elevation: 0,
  sx: {
    overflow: 'visible',
    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
    mt: 1.5,
    '& .MuiAvatar-root': {
      width: 32,
      height: 32,
      ml: -0.5,
      mr: 1,
    },
    '&:before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: 0,
      right: 14,
      width: 10,
      height: 10,
      bgcolor: 'background.paper',
      transform: 'translateY(-50%) rotate(45deg)',
      zIndex: 0,
    },
  },
};

const blockTypeToBlockIcon = {
  bullet: <FormatListBulletedIcon />,
  check: <CheckBoxIcon />,
  code: <CodeIcon />,
  h1: <LooksOneIcon />,
  h2: <LooksTwoIcon />,
  h3: <Looks3Icon />,
  h4: <Looks4Icon />,
  h5: <Looks5Icon />,
  h6: <Looks6Icon />,
  number: <FormatListNumberedIcon />,
  paragraph: <SubjectIcon />,
  quote: <FormatQuoteIcon />,
};

const blockTypeToBlockName = {
  bullet: 'Liste à puces',
  check: 'Liste à cocher',
  code: 'Bloc de code',
  h1: 'Titre 1',
  h2: 'Titre 2',
  h3: 'Titre 3',
  h4: 'Titre 4',
  h5: 'Titre 5',
  h6: 'Titre 6',
  number: 'Liste numérotée',
  paragraph: 'Normal',
  quote: 'Citation',
};

// This is required because MUI does not allow `selected={true}` on `IconButton`,
// we use thos component because `ToggleButton` they prevent displaying a different variant than `contained`
const iconButtonPressedBackgroundColors = {
  light: 'rgba(0, 0, 145, 0.08)',
  dark: 'rgba(133, 133, 246, 0.16)',
};

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(CODE_LANGUAGE_FRIENDLY_NAME_MAP)) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

const FONT_SIZE_OPTIONS: [string, string][] = [
  ['10px', '10px'],
  ['11px', '11px'],
  ['12px', '12px'],
  ['13px', '13px'],
  ['14px', '14px'],
  ['15px', '15px'],
  ['16px', '16px'],
  ['17px', '17px'],
  ['18px', '18px'],
  ['19px', '19px'],
  ['20px', '20px'],
];

function dropDownActiveClass(active: boolean) {
  if (active) return 'active dropdown-item-active';
  else return '';
}

function BlockFormatDropDown({
  editor,
  blockType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  editor: LexicalEditor;
  disabled?: boolean;
}): JSX.Element {
  const formatParagraph = () => {
    if (blockType !== 'paragraph') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection))
          $setBlocksType_experimental(selection, () => $createParagraphNode());
      });
    }
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
          $setBlocksType_experimental(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatCheckList = () => {
    if (blockType !== 'check') {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
          $setBlocksType_experimental(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatCode = () => {
    if (blockType !== 'code') {
      editor.update(() => {
        let selection = $getSelection();

        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
          if (selection.isCollapsed()) {
            $setBlocksType_experimental(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection)) selection.insertRawText(textContent);
          }
        }
      });
    }
  };

  const [textTypeAnchorEl, textTypeSetAnchorEl] = React.useState<null | HTMLElement>(null);
  const textTypeOpen = Boolean(textTypeAnchorEl);
  const textTypeHandleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    textTypeSetAnchorEl(event.currentTarget);
  };
  const textTypeHandleClose = () => {
    textTypeSetAnchorEl(null);
  };

  return (
    <>
      <Grid item>
        <IconButton
          disabled={disabled}
          onClick={textTypeHandleClick}
          aria-controls={textTypeOpen ? 'text-type-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={textTypeOpen ? 'true' : undefined}
          title="Choisir la présentation du texte"
          sx={{ borderRadius: 0 }}
        >
          {blockTypeToBlockIcon[blockType]}
          <Typography component="span">&nbsp;{blockTypeToBlockName[blockType]}</Typography>
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={textTypeAnchorEl}
          id="text-type-menu"
          open={textTypeOpen}
          onClose={textTypeHandleClose}
          onClick={textTypeHandleClose}
          PaperProps={{ ...menuPaperProps }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={formatParagraph} selected={blockType === 'paragraph'}>
            <ListItemIcon>
              <SubjectIcon fontSize="small" />
            </ListItemIcon>
            Normal
          </MenuItem>
          <MenuItem onClick={() => formatHeading('h1')} selected={blockType === 'h1'}>
            <ListItemIcon>
              <LooksOneIcon fontSize="small" />
            </ListItemIcon>
            Titre 1
          </MenuItem>
          <MenuItem onClick={() => formatHeading('h2')} selected={blockType === 'h2'}>
            <ListItemIcon>
              <LooksTwoIcon fontSize="small" />
            </ListItemIcon>
            Titre 2
          </MenuItem>
          <MenuItem onClick={() => formatHeading('h3')} selected={blockType === 'h3'}>
            <ListItemIcon>
              <Looks3Icon fontSize="small" />
            </ListItemIcon>
            Titre 3
          </MenuItem>
          <MenuItem onClick={formatBulletList} selected={blockType === 'bullet'}>
            <ListItemIcon>
              <FormatListBulletedIcon fontSize="small" />
            </ListItemIcon>
            Liste à puces
          </MenuItem>
          <MenuItem onClick={formatNumberedList} selected={blockType === 'number'}>
            <ListItemIcon>
              <FormatListNumberedIcon fontSize="small" />
            </ListItemIcon>
            Liste numérotée
          </MenuItem>
          <MenuItem onClick={formatCheckList} selected={blockType === 'check'}>
            <ListItemIcon>
              <CheckBoxIcon fontSize="small" />
            </ListItemIcon>
            Liste à cocher
          </MenuItem>
          <MenuItem onClick={formatQuote} selected={blockType === 'quote'}>
            <ListItemIcon>
              <FormatQuoteIcon fontSize="small" />
            </ListItemIcon>
            Citation
          </MenuItem>
          <MenuItem onClick={formatCode} selected={blockType === 'code'}>
            <ListItemIcon>
              <CodeIcon fontSize="small" />
            </ListItemIcon>
            Bloc de code
          </MenuItem>
        </Menu>
      </Grid>
    </>
  );
}

function OldDivider(): JSX.Element {
  return <div className="divider" />;
}

function FontDropDown({
  editor,
  value,
  style,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: string;
  style: string;
  disabled?: boolean;
}): JSX.Element {
  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style]
  );

  const [fontSizeAnchorEl, fontSizeSetAnchorEl] = React.useState<null | HTMLElement>(null);
  const fontSizeOpen = Boolean(fontSizeAnchorEl);
  const fontSizeHandleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    fontSizeSetAnchorEl(event.currentTarget);
  };
  const fontSizeHandleClose = () => {
    fontSizeSetAnchorEl(null);
  };

  return (
    <>
      <Grid item>
        <IconButton
          disabled={disabled}
          onClick={fontSizeHandleClick}
          aria-controls={fontSizeOpen ? 'font-size-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={fontSizeOpen ? 'true' : undefined}
          title="Taille du texte"
          sx={{ borderRadius: 0 }}
        >
          <Typography component="span">{value.length ? value : '--px'}</Typography>
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={fontSizeAnchorEl}
          id="font-size-menu"
          open={fontSizeOpen}
          onClose={fontSizeHandleClose}
          onClick={fontSizeHandleClose}
          PaperProps={{ ...menuPaperProps }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {FONT_SIZE_OPTIONS.map(([option, text]) => (
            <MenuItem key={option} onClick={() => handleClick(option)} aria-label={option} selected={value === option}>
              {text}
            </MenuItem>
          ))}
        </Menu>
      </Grid>
    </>
  );
}

export default function ToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null);
  const [fontSize, setFontSize] = useState<string>('15px');
  const [fontColor, setFontColor] = useState<string>('#000');
  const [bgColor, setBgColor] = useState<string>('#fff');
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [modal, showModal] = useModal();
  const [isRTL, setIsRTL] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<string>('');
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsSubscript(selection.hasFormat('subscript'));
      setIsSuperscript(selection.hasFormat('superscript'));
      setIsCode(selection.hasFormat('code'));
      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            const language = element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            setCodeLanguage(language ? CODE_LANGUAGE_MAP[language] || language : '');
            return;
          }
        }
      }
      // Handle buttons
      setFontSize($getSelectionStyleValueForProperty(selection, 'font-size', '15px'));
      setFontColor($getSelectionStyleValueForProperty(selection, 'color', '#000'));
      setBgColor($getSelectionStyleValueForProperty(selection, 'background-color', '#fff'));
      setFontFamily($getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'));
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [activeEditor, editor, updateToolbar]);

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $selectAll(selection);
        selection.getNodes().forEach((node) => {
          if ($isTextNode(node)) {
            node.setFormat(0);
            node.setStyle('');
            $getNearestBlockElementAncestorOrThrow(node).setFormat('');
          }
          if ($isDecoratorBlockNode(node)) {
            node.setFormat('');
          }
        });
      }
    });
  }, [activeEditor]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'));
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey]
  );

  const [formattingOptionsAnchorEl, formattingOptionsSetAnchorEl] = React.useState<null | HTMLElement>(null);
  const formattingOptionsOpen = Boolean(formattingOptionsAnchorEl);
  const formattingOptionsHandleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    formattingOptionsSetAnchorEl(event.currentTarget);
  };
  const formattingOptionsHandleClose = () => {
    formattingOptionsSetAnchorEl(null);
  };

  const [specializedNodesAnchorEl, specializedNodesSetAnchorEl] = React.useState<null | HTMLElement>(null);
  const specializedNodesOpen = Boolean(specializedNodesAnchorEl);
  const specializedNodesHandleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    specializedNodesSetAnchorEl(event.currentTarget);
  };
  const specializedNodesHandleClose = () => {
    specializedNodesSetAnchorEl(null);
  };

  const [alignmentAnchorEl, alignmentSetAnchorEl] = React.useState<null | HTMLElement>(null);
  const alignmentOpen = Boolean(alignmentAnchorEl);
  const alignmentHandleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    alignmentSetAnchorEl(event.currentTarget);
  };
  const alignmentHandleClose = () => {
    alignmentSetAnchorEl(null);
  };

  const [codeLanguageAnchorEl, codeLanguageSetAnchorEl] = React.useState<null | HTMLElement>(null);
  const codeLanguageOpen = Boolean(codeLanguageAnchorEl);
  const codeLanguageHandleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    codeLanguageSetAnchorEl(event.currentTarget);
  };
  const codeLanguageHandleClose = () => {
    codeLanguageSetAnchorEl(null);
  };

  const theme = useColors();
  const isDark = theme.isDark;

  return (
    <>
      <Grid
        container
        direction="row"
        sx={{
          justifyContent: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: theme.decisions.background.overlap.grey.default,
          p: 1,
        }}
      >
        <Grid item>
          <IconButton
            disabled={!canUndo || !isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
            }}
            title={IS_APPLE ? 'Précédent (⌘Z)' : 'Précédent (Ctrl+Z)'}
            sx={{
              borderRadius: 0,
            }}
          >
            <UndoIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton
            disabled={!canRedo || !isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(REDO_COMMAND, undefined);
            }}
            title={IS_APPLE ? 'Suivant (⌘Y)' : 'Suivant (Ctrl+Y)'}
            sx={{
              borderRadius: 0,
            }}
          >
            <RedoIcon />
          </IconButton>
        </Grid>
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 1,
            my: 'auto',
          }}
        />
        {blockType in blockTypeToBlockName && activeEditor === editor && (
          <>
            <BlockFormatDropDown disabled={!isEditable} blockType={blockType} editor={editor} />
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: 1,
                my: 'auto',
              }}
            />
          </>
        )}
        {blockType === 'code' ? (
          <>
            <Grid item>
              <IconButton
                disabled={!isEditable}
                onClick={codeLanguageHandleClick}
                aria-controls={codeLanguageOpen ? 'code-language-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={codeLanguageOpen ? 'true' : undefined}
                title="Selection d'un language"
                sx={{ borderRadius: 0 }}
              >
                <Typography component="span">{getLanguageFriendlyName(codeLanguage)}</Typography>
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={codeLanguageAnchorEl}
                id="code-language-menu"
                open={codeLanguageOpen}
                onClose={codeLanguageHandleClose}
                onClick={codeLanguageHandleClose}
                PaperProps={{ ...menuPaperProps }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {CODE_LANGUAGE_OPTIONS.map(([value, name]) => (
                  <MenuItem key={value} onClick={() => onCodeLanguageSelect(value)} aria-label={value} selected={value === codeLanguage}>
                    {name}
                  </MenuItem>
                ))}
              </Menu>
            </Grid>
          </>
        ) : (
          <>
            <FontDropDown disabled={!isEditable} style={'font-size'} value={fontSize} editor={editor} />
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: 1,
                my: 'auto',
              }}
            />
          </>
        )}
        <Grid item>
          <IconButton
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
            }}
            title={IS_APPLE ? 'Gras (⌘B)' : 'Gras (Ctrl+B)'}
            sx={{
              borderRadius: 0,
              backgroundColor: isBold ? (isDark ? iconButtonPressedBackgroundColors.dark : iconButtonPressedBackgroundColors.light) : undefined,
            }}
            aria-pressed={isBold}
          >
            <FormatBoldIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
            }}
            title={IS_APPLE ? 'Italique (⌘I)' : 'Italique (Ctrl+I)'}
            sx={{
              borderRadius: 0,
              backgroundColor: isItalic ? (isDark ? iconButtonPressedBackgroundColors.dark : iconButtonPressedBackgroundColors.light) : undefined,
            }}
            aria-pressed={isBold}
          >
            <FormatItalicIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
            }}
            title={IS_APPLE ? 'Souligné (⌘U)' : 'Souligné (Ctrl+U)'}
            sx={{
              borderRadius: 0,
              backgroundColor: isUnderline ? (isDark ? iconButtonPressedBackgroundColors.dark : iconButtonPressedBackgroundColors.light) : undefined,
            }}
            aria-pressed={isBold}
          >
            <FormatUnderlinedIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
            }}
            title="Insérer un code sur une ligne"
            sx={{
              borderRadius: 0,
              backgroundColor: isCode ? (isDark ? iconButtonPressedBackgroundColors.dark : iconButtonPressedBackgroundColors.light) : undefined,
            }}
            aria-pressed={isBold}
          >
            <CodeIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton
            disabled={!isEditable}
            onClick={insertLink}
            title="Insérer un lien"
            sx={{
              borderRadius: 0,
              backgroundColor: isLink ? (isDark ? iconButtonPressedBackgroundColors.dark : iconButtonPressedBackgroundColors.light) : undefined,
            }}
            aria-pressed={isBold}
          >
            <InsertLinkIcon />
          </IconButton>
        </Grid>
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 1,
            my: 'auto',
          }}
        />
        <Grid item>
          <IconButton
            disabled={!isEditable}
            onClick={formattingOptionsHandleClick}
            aria-controls={formattingOptionsOpen ? 'formatting-options-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={formattingOptionsOpen ? 'true' : undefined}
            title="Options additionnelles pour le formattage"
            sx={{ borderRadius: 0 }}
          >
            <FormatShapesIcon />
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={formattingOptionsAnchorEl}
            id="formatting-options-menu"
            open={formattingOptionsOpen}
            onClose={formattingOptionsHandleClose}
            onClick={formattingOptionsHandleClose}
            PaperProps={{ ...menuPaperProps }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
              }}
              aria-label="Barrer le texte"
            >
              <ListItemIcon>
                <StrikethroughIcon fontSize="small" />
              </ListItemIcon>
              Barré
            </MenuItem>
            <MenuItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
              }}
              aria-label="Insérer un indice"
            >
              <ListItemIcon>
                <SubscriptIcon fontSize="small" />
              </ListItemIcon>
              Indice
            </MenuItem>
            <MenuItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
              }}
              aria-label="Insérer un exposant"
            >
              <ListItemIcon>
                <SuperscriptIcon fontSize="small" />
              </ListItemIcon>
              Exposant
            </MenuItem>
            <MenuItem onClick={clearFormatting} aria-label="Réinitialiser le formattage">
              <ListItemIcon>
                <DeleteOutlineIcon fontSize="small" />
              </ListItemIcon>
              Réinitialiser le formattage
            </MenuItem>
          </Menu>
        </Grid>
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 1,
            my: 'auto',
          }}
        />
        <Grid item>
          <IconButton
            disabled={!isEditable}
            onClick={specializedNodesHandleClick}
            aria-controls={specializedNodesOpen ? 'specialized-nodes-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={specializedNodesOpen ? 'true' : undefined}
            title="Insérer un élément spécial"
            sx={{ borderRadius: 0 }}
          >
            <AddIcon />
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={specializedNodesAnchorEl}
            id="specialized-nodes-menu"
            open={specializedNodesOpen}
            onClose={specializedNodesHandleClose}
            onClick={specializedNodesHandleClose}
            PaperProps={{ ...menuPaperProps }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem
              onClick={() => {
                activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
              }}
              aria-label="Insérer une barre horizontale"
            >
              <ListItemIcon>
                <HorizontalRuleIcon fontSize="small" />
              </ListItemIcon>
              Barre horizontale
            </MenuItem>
            <MenuItem
              onClick={() => {
                showModal('Insert Image', (onClose) => <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />);
              }}
              aria-label="Insérer une image"
            >
              <ListItemIcon>
                <AddPhotoAlternateIcon fontSize="small" />
              </ListItemIcon>
              Image
            </MenuItem>
            <MenuItem
              onClick={() => {
                showModal('Insert Table', (onClose) => <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />);
              }}
              aria-label="Insérer un tableau"
            >
              <ListItemIcon>
                <GridOnIcon fontSize="small" />
              </ListItemIcon>
              Tableau
            </MenuItem>
            <MenuItem
              onClick={() => {
                showModal('Insert Equation', (onClose) => <InsertEquationDialog activeEditor={activeEditor} onClose={onClose} />);
              }}
              aria-label="Insérer une équation"
            >
              <ListItemIcon>
                <CalculateIcon fontSize="small" />
              </ListItemIcon>
              Équation
            </MenuItem>
            <MenuItem
              onClick={() => {
                editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
              }}
              aria-label="Insérer une zone rétractable"
            >
              <ListItemIcon>
                <UnfoldLessIcon fontSize="small" />
              </ListItemIcon>
              Zone rétractable
            </MenuItem>
          </Menu>
        </Grid>
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 1,
            my: 'auto',
          }}
        />
        <Grid item>
          <IconButton
            disabled={!isEditable}
            onClick={alignmentHandleClick}
            aria-controls={alignmentOpen ? 'alignment-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={alignmentOpen ? 'true' : undefined}
            title="Alignement du texte"
            sx={{ borderRadius: 0 }}
          >
            <FormatAlignLeftIcon />
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={alignmentAnchorEl}
            id="alignment-menu"
            open={alignmentOpen}
            onClose={alignmentHandleClose}
            onClick={alignmentHandleClose}
            PaperProps={{ ...menuPaperProps }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
              }}
              aria-label="Aligner le texte à gauche"
            >
              <ListItemIcon>
                <FormatAlignLeftIcon fontSize="small" />
              </ListItemIcon>
              Aligner à gauche
            </MenuItem>
            <MenuItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
              }}
              aria-label="Centrer le texte"
            >
              <ListItemIcon>
                <FormatAlignCenterIcon fontSize="small" />
              </ListItemIcon>
              Centrer
            </MenuItem>
            <MenuItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
              }}
              aria-label="Aligner le texte à droite"
            >
              <ListItemIcon>
                <FormatAlignRightIcon fontSize="small" />
              </ListItemIcon>
              Aligner à droite
            </MenuItem>
            <MenuItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
              }}
              aria-label="Justifie le texte"
            >
              <ListItemIcon>
                <FormatAlignJustifyIcon fontSize="small" />
              </ListItemIcon>
              Justifier
            </MenuItem>
            <Divider
              orientation="horizontal"
              flexItem
              sx={{
                p: 0,
                mx: 'auto',
                my: 1,
              }}
            />
            <MenuItem
              onClick={() => {
                activeEditor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
              }}
              aria-label="Désindenter le texte"
            >
              <ListItemIcon>{isRTL ? <FormatIndentIncreaseIcon fontSize="small" /> : <FormatIndentDecreaseIcon fontSize="small" />}</ListItemIcon>
              Désindenter
            </MenuItem>
            <MenuItem
              onClick={() => {
                activeEditor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
              }}
              aria-label="Indenter le texte"
            >
              <ListItemIcon>{isRTL ? <FormatIndentDecreaseIcon fontSize="small" /> : <FormatIndentIncreaseIcon fontSize="small" />}</ListItemIcon>
              Indenter
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>
      {modal}
    </>
  );
}
