/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import useLexicalEditable from '@lexical/react/useLexicalEditable';
import {
  $deleteTableColumn,
  $getElementGridForTableNode,
  $getTableCellNodeFromLexicalNode,
  $getTableColumnIndexFromTableCellNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumn,
  $insertTableRow,
  $isTableCellNode,
  $isTableRowNode,
  $removeTableRowAtIndex,
  HTMLTableElementWithWithTableSelectionState,
  TableCellHeaderStates,
  TableCellNode,
  getTableSelectionFromTableElement,
} from '@lexical/table';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Divider, IconButton, Menu, MenuItem } from '@mui/material';
import { $addUpdateTag, $getRoot, $getSelection, $isRangeSelection, DEPRECATED_$isGridSelection } from 'lexical';
import * as React from 'react';
import { ReactPortal, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { menuPaperProps } from '../ToolbarPlugin';

type TableCellActionMenuProps = Readonly<{
  contextRef: { current: null | HTMLElement };
  onClose: () => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  tableCellNode: TableCellNode;
}>;

function TableActionMenuFromPlugin({ onClose, tableCellNode: _tableCellNode, setIsMenuOpen, contextRef }: TableCellActionMenuProps) {
  const [editor] = useLexicalComposerContext();
  const dropDownRef = useRef<HTMLDivElement | null>(null);
  const [tableCellNode, updateTableCellNode] = useState(_tableCellNode);
  const [selectionCounts, updateSelectionCounts] = useState({
    columns: 1,
    rows: 1,
  });

  useEffect(() => {
    return editor.registerMutationListener(TableCellNode, (nodeMutations) => {
      const nodeUpdated = nodeMutations.get(tableCellNode.getKey()) === 'updated';

      if (nodeUpdated) {
        editor.getEditorState().read(() => {
          updateTableCellNode(tableCellNode.getLatest());
        });
      }
    });
  }, [editor, tableCellNode]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();

      if (DEPRECATED_$isGridSelection(selection)) {
        const selectionShape = selection.getShape();

        updateSelectionCounts({
          columns: selectionShape.toX - selectionShape.fromX + 1,
          rows: selectionShape.toY - selectionShape.fromY + 1,
        });
      }
    });
  }, [editor]);

  useEffect(() => {
    const menuButtonElement = contextRef.current;
    const dropDownElement = dropDownRef.current;

    if (menuButtonElement != null && dropDownElement != null) {
      const menuButtonRect = menuButtonElement.getBoundingClientRect();

      dropDownElement.style.opacity = '1';

      dropDownElement.style.left = `${menuButtonRect.left + menuButtonRect.width + window.pageXOffset + 5}px`;

      dropDownElement.style.top = `${menuButtonRect.top + window.pageYOffset}px`;
    }
  }, [contextRef, dropDownRef]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropDownRef.current != null &&
        contextRef.current != null &&
        !dropDownRef.current.contains(event.target as Node) &&
        !contextRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener('click', handleClickOutside);

    return () => window.removeEventListener('click', handleClickOutside);
  }, [setIsMenuOpen, contextRef]);

  const clearTableSelection = useCallback(() => {
    editor.update(() => {
      if (tableCellNode.isAttached()) {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
        const tableElement = editor.getElementByKey(tableNode.getKey()) as HTMLTableElementWithWithTableSelectionState;

        if (!tableElement) {
          throw new Error('Expected to find tableElement in DOM');
        }

        const tableSelection = getTableSelectionFromTableElement(tableElement);
        if (tableSelection !== null) {
          tableSelection.clearHighlight();
        }

        tableNode.markDirty();
        updateTableCellNode(tableCellNode.getLatest());
      }

      const rootNode = $getRoot();
      rootNode.selectStart();
    });
  }, [editor, tableCellNode]);

  const insertTableRowAtSelection = useCallback(
    (shouldInsertAfter: boolean) => {
      editor.update(() => {
        const selection = $getSelection();

        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

        let tableRowIndex;

        if (DEPRECATED_$isGridSelection(selection)) {
          const selectionShape = selection.getShape();
          tableRowIndex = shouldInsertAfter ? selectionShape.toY : selectionShape.fromY;
        } else {
          tableRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode);
        }

        const grid = $getElementGridForTableNode(editor, tableNode);

        $insertTableRow(tableNode, tableRowIndex, shouldInsertAfter, selectionCounts.rows, grid);

        clearTableSelection();

        onClose();
      });
    },
    [editor, tableCellNode, selectionCounts.rows, clearTableSelection, onClose]
  );

  const insertTableColumnAtSelection = useCallback(
    (shouldInsertAfter: boolean) => {
      editor.update(() => {
        const selection = $getSelection();

        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

        let tableColumnIndex;

        if (DEPRECATED_$isGridSelection(selection)) {
          const selectionShape = selection.getShape();
          tableColumnIndex = shouldInsertAfter ? selectionShape.toX : selectionShape.fromX;
        } else {
          tableColumnIndex = $getTableColumnIndexFromTableCellNode(tableCellNode);
        }

        const grid = $getElementGridForTableNode(editor, tableNode);

        $insertTableColumn(tableNode, tableColumnIndex, shouldInsertAfter, selectionCounts.columns, grid);

        clearTableSelection();

        onClose();
      });
    },
    [editor, tableCellNode, selectionCounts.columns, clearTableSelection, onClose]
  );

  const deleteTableRowAtSelection = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
      const tableRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode);

      $removeTableRowAtIndex(tableNode, tableRowIndex);

      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const deleteTableAtSelection = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
      tableNode.remove();

      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const deleteTableColumnAtSelection = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

      const tableColumnIndex = $getTableColumnIndexFromTableCellNode(tableCellNode);

      $deleteTableColumn(tableNode, tableColumnIndex);

      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const toggleTableRowIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

      const tableRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode);

      const tableRows = tableNode.getChildren();

      if (tableRowIndex >= tableRows.length || tableRowIndex < 0) {
        throw new Error('Expected table cell to be inside of table row.');
      }

      const tableRow = tableRows[tableRowIndex];

      if (!$isTableRowNode(tableRow)) {
        throw new Error('Expected table row');
      }

      tableRow.getChildren().forEach((tableCell) => {
        if (!$isTableCellNode(tableCell)) {
          throw new Error('Expected table cell');
        }

        tableCell.toggleHeaderStyle(TableCellHeaderStates.ROW);
      });

      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const toggleTableColumnIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

      const tableColumnIndex = $getTableColumnIndexFromTableCellNode(tableCellNode);

      const tableRows = tableNode.getChildren();

      for (let r = 0; r < tableRows.length; r++) {
        const tableRow = tableRows[r];

        if (!$isTableRowNode(tableRow)) {
          throw new Error('Expected table row');
        }

        const tableCells = tableRow.getChildren();

        if (tableColumnIndex >= tableCells.length || tableColumnIndex < 0) {
          throw new Error('Expected table cell to be inside of table row.');
        }

        const tableCell = tableCells[tableColumnIndex];

        if (!$isTableCellNode(tableCell)) {
          throw new Error('Expected table cell');
        }

        tableCell.toggleHeaderStyle(TableCellHeaderStates.COLUMN);
      }

      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  return (
    <>
      <MenuItem onClick={() => insertTableRowAtSelection(false)}>
        Insérer {selectionCounts.rows === 1 ? 'une ligne' : `${selectionCounts.rows} lignes`} au-dessus
      </MenuItem>
      <MenuItem onClick={() => insertTableRowAtSelection(true)}>
        Insérer {selectionCounts.rows === 1 ? 'une ligne' : `${selectionCounts.rows} lignes`} en-dessous
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
      <MenuItem onClick={() => insertTableColumnAtSelection(false)}>
        Insérer {selectionCounts.columns === 1 ? 'une colonne' : `${selectionCounts.columns} colonnes`} à gauche
      </MenuItem>
      <MenuItem onClick={() => insertTableColumnAtSelection(true)}>
        Insérer {selectionCounts.columns === 1 ? 'une colonne' : `${selectionCounts.columns} colonnes`} à droite
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
      <MenuItem onClick={() => deleteTableColumnAtSelection()}>Supprimer la colonne</MenuItem>
      <MenuItem onClick={() => deleteTableRowAtSelection()}>Supprimer la ligne</MenuItem>
      <MenuItem onClick={() => deleteTableAtSelection()}>Supprimer le tableau</MenuItem>
      <Divider
        orientation="horizontal"
        flexItem
        sx={{
          p: 0,
          mx: 'auto',
          my: 1,
        }}
      />
      <MenuItem onClick={() => toggleTableRowIsHeader()}>
        {(tableCellNode.__headerState & TableCellHeaderStates.ROW) === TableCellHeaderStates.ROW ? 'Supprimer la' : 'Ajouter une'} ligne d&apos;entête
      </MenuItem>
      <MenuItem onClick={() => toggleTableColumnIsHeader()}>
        {(tableCellNode.__headerState & TableCellHeaderStates.COLUMN) === TableCellHeaderStates.COLUMN ? 'Supprimer la' : 'Ajouter une'} colonne
        d&apos;entête
      </MenuItem>
    </>
  );
}

function TableCellActionMenuContainer({ anchorElem }: { anchorElem: HTMLElement }): JSX.Element {
  const [editor] = useLexicalComposerContext();

  const menuButtonRef = useRef(null);
  const menuRootRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [tableCellNode, setTableMenuCellNode] = useState<TableCellNode | null>(null);

  const moveMenu = useCallback(() => {
    const menu = menuButtonRef.current;
    const selection = $getSelection();
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (selection == null || menu == null) {
      setTableMenuCellNode(null);
      return;
    }

    const rootElement = editor.getRootElement();

    if ($isRangeSelection(selection) && rootElement !== null && nativeSelection !== null && rootElement.contains(nativeSelection.anchorNode)) {
      const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(selection.anchor.getNode());

      if (tableCellNodeFromSelection == null) {
        setTableMenuCellNode(null);
        return;
      }

      const tableCellParentNodeDOM = editor.getElementByKey(tableCellNodeFromSelection.getKey());

      if (tableCellParentNodeDOM == null) {
        setTableMenuCellNode(null);
        return;
      }

      setTableMenuCellNode(tableCellNodeFromSelection);
    } else if (!activeElement) {
      setTableMenuCellNode(null);
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      editor.getEditorState().read(() => {
        moveMenu();
      });
    });
  });

  useEffect(() => {
    const menuButtonDOM = menuButtonRef.current as HTMLButtonElement | null;

    if (menuButtonDOM != null && tableCellNode != null) {
      const tableCellNodeDOM = editor.getElementByKey(tableCellNode.getKey());

      if (tableCellNodeDOM != null) {
        const tableCellRect = tableCellNodeDOM.getBoundingClientRect();
        const menuRect = menuButtonDOM.getBoundingClientRect();
        const anchorRect = anchorElem.getBoundingClientRect();

        const top = tableCellRect.top - anchorRect.top + 4;
        const left = tableCellRect.right - menuRect.width - 10 - anchorRect.left;

        menuButtonDOM.style.opacity = '1';
        menuButtonDOM.style.transform = `translate(${left}px, ${top}px)`;
      } else {
        menuButtonDOM.style.opacity = '0';
        menuButtonDOM.style.transform = 'translate(-10000px, -10000px)';
      }
    }
  }, [menuButtonRef, tableCellNode, editor, anchorElem]);

  const prevTableCellDOM = useRef(tableCellNode);

  useEffect(() => {
    if (prevTableCellDOM.current !== tableCellNode) {
      setIsMenuOpen(false);
    }

    prevTableCellDOM.current = tableCellNode;
  }, [prevTableCellDOM, tableCellNode]);

  const [tableOptionsAnchorEl, tableOptionsSetAnchorEl] = React.useState<null | HTMLElement>(null);
  const tableOptionsOpen = Boolean(tableOptionsAnchorEl);
  const tableOptionsHandleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    tableOptionsSetAnchorEl(event.currentTarget);
  };
  const tableOptionsHandleClose = () => {
    tableOptionsSetAnchorEl(null);
  };

  return (
    <>
      <div className="table-cell-action-button-container" ref={menuButtonRef}>
        {tableCellNode != null && (
          <>
            <IconButton
              onClick={tableOptionsHandleClick}
              aria-controls={tableOptionsOpen ? 'table-options-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={tableOptionsOpen ? 'true' : undefined}
              title="Options pour le tableau"
              size="small"
              sx={{ borderRadius: 0 }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={tableOptionsAnchorEl}
              id="table-options-menu"
              open={tableOptionsOpen}
              onClose={tableOptionsHandleClose}
              onClick={tableOptionsHandleClose}
              PaperProps={{ ...menuPaperProps }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <TableActionMenuFromPlugin
                contextRef={menuRootRef}
                setIsMenuOpen={setIsMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                tableCellNode={tableCellNode}
              />
            </Menu>
          </>
        )}
      </div>
    </>
  );
}

export default function TableActionMenuPlugin({ anchorElem = document.body }: { anchorElem?: HTMLElement }): null | ReactPortal {
  const isEditable = useLexicalEditable();
  return createPortal(isEditable ? <TableCellActionMenuContainer anchorElem={anchorElem} /> : null, anchorElem);
}