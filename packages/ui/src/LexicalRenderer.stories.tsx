import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import sampleAllElement from '@mediature/ui/src/Editor/sample-all-elements.lexical';
import { LexicalRenderer } from '@mediature/ui/src/LexicalRenderer';

type ComponentType = typeof LexicalRenderer;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/LexicalRenderer',
  component: LexicalRenderer,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
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
