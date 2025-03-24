import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/test';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { LexicalRenderer } from '@mediature/main/src/components/LexicalRenderer';
import sampleAllElement from '@mediature/ui/src/Editor/sample-all-elements.lexical';
import { inlineEditorStateFromHtml } from '@mediature/ui/src/utils/lexical';

type ComponentType = typeof LexicalRenderer;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/LexicalRenderer',
  component: LexicalRenderer,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args, { loaded: { inlineEditorState } }) => {
  if (!args.inlineEditorState && !inlineEditorState) {
    return <span>Loading...</span>;
  }

  if (inlineEditorState) {
    args.inlineEditorState = inlineEditorState;
  }

  return <LexicalRenderer {...args} />;
};

const EveryElementStory = Template.bind({});
EveryElementStory.args = {
  inlineEditorState: sampleAllElement,
};
EveryElementStory.parameters = {
  a11y: {
    // TODO: once solution found, adjust to exclude the email lexical content at the general level
    // Ref: https://github.com/storybookjs/storybook/issues/20813
    disable: true,
  },
};
EveryElementStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByRole('heading', { level: 1 });
};

export const EveryElement = prepareStory(EveryElementStory);

const FromParsedHtmlStory = Template.bind({});
FromParsedHtmlStory.args = {};
FromParsedHtmlStory.parameters = {
  ...EveryElementStory.parameters,
};
FromParsedHtmlStory.loaders = [
  async () => ({
    inlineEditorState: await inlineEditorStateFromHtml(
      '<div dir="ltr">Hi,<div><br></div><div>Important notice: it&#39;s Friday. Friday <i>afternoon</i>, even!</div><div><br><br></div><div>Have a <i style="font-weight:bold">great</i> weekend!</div><div><br></div><div>The Anonymous Friday Teller</div></div>'
    ),
  }),
];
FromParsedHtmlStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByText(/weekend/i);
};

export const FromParsedHtml = prepareStory(FromParsedHtmlStory);
