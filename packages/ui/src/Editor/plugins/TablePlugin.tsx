/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import {
  $createNodeSelection,
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  EditorThemeClasses,
  Klass,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  createCommand,
} from 'lexical';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as React from 'react';

import { $createTableNodeWithDimensions, TableNode } from '../nodes/TableNode';
import invariant from '../shared/src/invariant';
import Button from '../ui/Button';
import { DialogActions } from '../ui/Dialog';
import TextInput from '../ui/TextInput';

export type InsertTableCommandPayload = Readonly<{
  columns: string;
  rows: string;
  includeHeaders?: boolean;
}>;

export type CellContextShape = {
  cellEditorConfig: null | CellEditorConfig;
  cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
  set: (cellEditorConfig: null | CellEditorConfig, cellEditorPlugins: null | JSX.Element | Array<JSX.Element>) => void;
};

export type CellEditorConfig = Readonly<{
  namespace: string;
  nodes?: ReadonlyArray<Klass<LexicalNode>>;
  onError: (error: Error, editor: LexicalEditor) => void;
  readOnly?: boolean;
  theme?: EditorThemeClasses;
}>;

export const CellContext = createContext<CellContextShape>({
  cellEditorConfig: null,
  cellEditorPlugins: null,
  set: () => {
    // Empty
  },
});

export function TableContext({ children }: { children: JSX.Element }) {
  const [contextValue, setContextValue] = useState<{
    cellEditorConfig: null | CellEditorConfig;
    cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
  }>({
    cellEditorConfig: null,
    cellEditorPlugins: null,
  });
  return (
    <CellContext.Provider
      value={useMemo(
        () => ({
          cellEditorConfig: contextValue.cellEditorConfig,
          cellEditorPlugins: contextValue.cellEditorPlugins,
          set: (cellEditorConfig, cellEditorPlugins) => {
            setContextValue({ cellEditorConfig, cellEditorPlugins });
          },
        }),
        [contextValue.cellEditorConfig, contextValue.cellEditorPlugins]
      )}
    >
      {children}
    </CellContext.Provider>
  );
}

export function InsertTableDialog({ activeEditor, onClose }: { activeEditor: LexicalEditor; onClose: () => void }): JSX.Element {
  const [rows, setRows] = useState('5');
  const [columns, setColumns] = useState('5');

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows });
    onClose();
  };

  return (
    <>
      <TextInput label="No of rows" onChange={setRows} value={rows} />
      <TextInput label="No of columns" onChange={setColumns} value={columns} />
      <DialogActions data-test-id="table-model-confirm-insert">
        <Button onClick={onClick}>Confirm</Button>
      </DialogActions>
    </>
  );
}
