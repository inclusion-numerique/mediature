import { createHeadlessEditor } from '@lexical/headless';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $isMarkNode, $unwrapMarkNode } from '@lexical/mark';
import type { JSDOM } from 'jsdom';
import { $createParagraphNode, $getRoot, $isElementNode, LexicalEditor, LexicalNode, ParagraphNode } from 'lexical';

import PlaygroundNodes from '@mediature/ui/src/Editor/nodes/PlaygroundNodes';

export function createPlaygroundHeadlessEditor(): LexicalEditor {
  return createHeadlessEditor({
    nodes: PlaygroundNodes,
    onError: (err) => {
      console.error(err);
    },
  });
}

// `jsdomInstance` is required on the server to use the DOM API
export function inlineEditorStateToHtml(inlineEditorState: string, jsdomInstance?: JSDOM): string {
  const editor = createHeadlessEditorFromInlineState(inlineEditorState);

  let htmlContent: string | null = null;

  editor.update(() => {
    // TODO: remove the workaround once fixed (ref: https://github.com/facebook/lexical/issues/3616#issuecomment-1511528343)
    // Note: since not multithreaded we should be safe the DOM assignation would not pollute other executions since we are not in an async function
    try {
      if (jsdomInstance) {
        // @ts-ignore
        global.window = jsdomInstance.window;
        global.document = jsdomInstance.window.document;
        global.DocumentFragment = jsdomInstance.window.DocumentFragment;
        global.HTMLImageElement = jsdomInstance.window.HTMLImageElement;
        global.HTMLAnchorElement = jsdomInstance.window.HTMLAnchorElement;
      }

      htmlContent = $generateHtmlFromNodes(editor, null);
    } finally {
      if (jsdomInstance) {
        // @ts-ignore
        global.window = undefined;
        // @ts-ignore
        global.document = undefined;
        // @ts-ignore
        global.DocumentFragment = undefined;
        // @ts-ignore
        global.HTMLImageElement = undefined;
        // @ts-ignore
        global.HTMLAnchorElement = undefined;
      }
    }
  });

  if (!htmlContent) {
    throw new Error('cannot get the html from the editor state');
  }

  return htmlContent;
}

// `jsdomInstance` is required on the server to use the DOM API
export async function inlineEditorStateFromHtml(htmlContent: string, jsdomInstance?: JSDOM): Promise<string> {
  return new Promise((resolve, reject) => {
    const editor = createPlaygroundHeadlessEditor();

    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      removeUpdateListener();

      editorState.read(() => {
        try {
          const sanitizedInlineEditorState = JSON.stringify(editorState.toJSON());

          // Prevent being empty because we cannot build a state without nodes on the frontend
          // No node can be due to an empty input or the `update()` operation has thrown an error
          const root = $getRoot();
          if (root.getChildrenSize() === 0) {
            reject('the editor state must contain at least a node');
          }

          return resolve(sanitizedInlineEditorState);
        } catch (error) {
          // This explicit try/catch was needed because the `.toJSON()` failed sometimes until we fix the parsing
          // and made Next.js crashing in production due to being an unhandled exception (since listener callback is called somewhere by Lexical)
          return reject(error);
        }
      });
    });

    editor.update(() => {
      // TODO: remove the workaround once fixed (ref: https://github.com/facebook/lexical/issues/3616#issuecomment-1511528343)
      // Note: since not multithreaded we should be safe the DOM assignation would not pollute other executions since we are not in an async function
      let nodes: LexicalNode[] = [];
      try {
        let parser: DOMParser;

        if (jsdomInstance) {
          parser = new jsdomInstance.window.DOMParser();

          global.HTMLImageElement = jsdomInstance.window.HTMLImageElement;
          global.HTMLAnchorElement = jsdomInstance.window.HTMLAnchorElement;
        } else {
          parser = new DOMParser();
        }

        const dom = parser.parseFromString(htmlContent, 'text/html');

        // [WORKAROUND] With Lexical v0.10 we had an issue with a ghost node into tables making the display breaking.
        // By upgrading to v0.11.2 it worked but now all `<div><br></div>` were ignored by `$generateNodesFromDOM` whereas
        // it works for `<br>`. Adding a workaround until we find a proper solution (maybe a Lexical fix is needed? Or a manual Playground nodes upgrade?)
        // Ref: https://github.com/facebook/lexical/issues/3879#issuecomment-1640215777
        dom.documentElement.querySelectorAll('div > br:only-child').forEach((brElement) => {
          // Using `:only-child` is not sufficient because it does not work if raw text without tag is a sibling of the `<br />`
          // Example: `<div>Salut toi<br /></div>` would unfortunately be catched, so we need to add a second verification
          const divElement = brElement.parentNode;

          if (divElement && (divElement as HTMLDivElement).textContent?.replace('\n', '').trim() === '') {
            const newBrElement = dom.createElement('br');
            divElement.parentNode?.replaceChild(newBrElement, divElement);
          }
        });

        nodes = $generateNodesFromDOM(editor, dom);
      } finally {
        if (jsdomInstance) {
          // @ts-ignore
          global.HTMLImageElement = undefined;
          // @ts-ignore
          global.HTMLAnchorElement = undefined;
        }
      }

      // Root nodes (leaves) must be blocks, but when parsing HTML nested structures of `<div>` are cropped to only keep
      // the final text node, breaking the step to get the editor state
      // Our solution is to gather successive root text nodes into an additional paragraph node
      const ajustedNodes: LexicalNode[] = [];
      let currentAdditionalParagraphNode: ParagraphNode | null = null;
      for (const node of nodes) {
        // Only parse the first layer
        if (!node.getParent()) {
          const nodeType = node.getType();

          if (nodeType === 'text') {
            if (node.getTextContent().trim() === '') {
              continue;
            }

            if (!currentAdditionalParagraphNode) {
              // Create a paragraph on the first layer
              currentAdditionalParagraphNode = $createParagraphNode();
              ajustedNodes.push(currentAdditionalParagraphNode);
            }

            if (currentAdditionalParagraphNode) {
              currentAdditionalParagraphNode.append(node);
            }
          } else {
            currentAdditionalParagraphNode = null;

            if (nodeType === 'linebreak') {
              continue;
            } else {
              ajustedNodes.push(node);
            }
          }
        }
      }

      const root = $getRoot();
      root.append(...ajustedNodes);

      // Lexical will by default parse and keep only what it can manage
      // so no need to do comparaison since the input is not in the Lexical format anyway
      // (we only sanitize specific nodes just in case)
      sanitizeNode(root);
    });
  });
}

export function createHeadlessEditorFromInlineState(inlineEditorState: string): LexicalEditor {
  const editor = createPlaygroundHeadlessEditor();

  const editorStateJSON = JSON.parse(inlineEditorState);
  editor.setEditorState(editor.parseEditorState(editorStateJSON));

  return editor;
}

export function inlineEditorStateToText(inlineEditorState: string): string {
  const editor = createHeadlessEditorFromInlineState(inlineEditorState);

  return editorStateToText(editor);
}

export function editorStateToText(editor: LexicalEditor): string {
  let textContent: string | null = null;

  editor.update(() => {
    textContent = $getRoot().getTextContent();
  });

  if (textContent === null) {
    throw new Error('cannot get the text from the editor state');
  }

  return textContent;
}

function sanitizeNode(node: LexicalNode): void {
  if ($isMarkNode(node)) {
    $unwrapMarkNode(node);
    return;
  }

  if ($isElementNode(node)) {
    const children = node.getChildren();
    for (const child of children) {
      sanitizeNode(child);
    }
  }
}

export function validateEditorState(inlineEditorState: string): void {
  const editor = createHeadlessEditorFromInlineState(inlineEditorState);

  validateEditorStateFromEditor(editor, inlineEditorState);
}

export function validateEditorStateFromEditor(editor: LexicalEditor, inlineEditorState: string): void {
  editor.update(() => {
    const root = $getRoot();

    sanitizeNode(root);

    // TODO: maybe the check should be outside the update (not sure yet the update is done because potentially async)
    // And making `validateEditorState()` async would complicate all the parsing with `zod`
    if (root.getChildrenSize() === 0) {
      throw new Error('the editor state must contain at least a node');
    }
  });

  const sanitizedInlineEditorState = JSON.stringify(editor.getEditorState().toJSON());

  if (inlineEditorState.trim() !== sanitizedInlineEditorState) {
    throw new Error('the editor state input is not valid');
  }
}
