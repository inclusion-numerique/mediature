/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useState } from 'react';

import { useSharedHistoryContext } from './context/SharedHistoryContext';
import ActionsPlugin from './plugins/ActionsPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import ClickableLinkPlugin from './plugins/ClickableLinkPlugin';
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import EquationsPlugin from './plugins/EquationsPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import KeywordsPlugin from './plugins/KeywordsPlugin';
import HorizontalRulePlugin from './plugins/LexicalHorizontalRulePlugin';
import LinkPlugin from './plugins/LinkPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import MentionsPlugin from './plugins/MentionsPlugin';
import SpeechToTextPlugin from './plugins/SpeechToTextPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableCellResizer from './plugins/TableCellResizer';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';

export default function Editor(): JSX.Element {
  const isRichText = true;
  const showTreeView = true;
  const { historyState } = useSharedHistoryContext();
  const text = 'Saisissez votre texte';
  const placeholder = <Placeholder>{text}</Placeholder>;
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <>
      {isRichText && <ToolbarPlugin />}
      <div className={`editor-container ${showTreeView ? 'tree-view' : ''} ${!isRichText ? 'plain-text' : ''}`}>
        {/* <MaxLengthPlugin maxLength={30} /> */}
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <MentionsPlugin />
        <HashtagPlugin />
        <KeywordsPlugin />
        <SpeechToTextPlugin lang="fr" />
        <AutoLinkPlugin />
        {isRichText ? (
          <>
            <HistoryPlugin externalHistoryState={historyState} />
            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor" ref={onRef}>
                    <ContentEditable />
                  </div>
                </div>
              }
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <CodeHighlightPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <TablePlugin />
            <TableCellResizer />
            <ImagesPlugin />
            <LinkPlugin />
            <ClickableLinkPlugin />
            <HorizontalRulePlugin />
            <EquationsPlugin />
            <TabFocusPlugin />
            <TabIndentationPlugin />
            <CollapsiblePlugin />
            {floatingAnchorElem && (
              <>
                <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
                <TableCellActionMenuPlugin anchorElem={floatingAnchorElem} />
                <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
              </>
            )}
          </>
        ) : (
          <>
            <PlainTextPlugin contentEditable={<ContentEditable />} placeholder={placeholder} ErrorBoundary={LexicalErrorBoundary} />
            <HistoryPlugin externalHistoryState={historyState} />
          </>
        )}
        <ActionsPlugin isRichText={isRichText} />
      </div>
    </>
  );
}
