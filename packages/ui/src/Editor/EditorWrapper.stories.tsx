import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { EditorWrapper } from '@mediature/ui/src/Editor/EditorWrapper';
import { contentSampleGenerator } from '@mediature/ui/src/Editor/sample';
import sampleAllElement from '@mediature/ui/src/Editor/sample-all-elements.lexical';
import sampleTable from '@mediature/ui/src/Editor/sample-table.lexical';

type ComponentType = typeof EditorWrapper;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/EditorWrapper',
  component: EditorWrapper,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

async function playFindElements(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await within(canvasElement).findByRole('button', { name: /précédent/i });
}

const Template: StoryFn<ComponentType> = (args) => {
  return (
    <div>
      <EditorWrapper {...args} />
    </div>
  );
};

const EmptyStory = Template.bind({});
EmptyStory.args = {
  onChange: (content: string) => {},
};
EmptyStory.parameters = {};
EmptyStory.play = async ({ canvasElement }) => {
  await playFindElements(canvasElement);
};

export const Empty = prepareStory(EmptyStory);

const LoremStory = Template.bind({});
LoremStory.args = {
  initialEditorState: contentSampleGenerator,
  onChange: (content: string) => {},
};
LoremStory.play = async ({ canvasElement }) => {
  await playFindElements(canvasElement);
};

export const Lorem = prepareStory(LoremStory);

const TableStory = Template.bind({});
TableStory.args = {
  initialEditorState: sampleTable,
  onChange: (content: string) => {},
};
TableStory.parameters = {
  a11y: {
    // TODO: once solution found, adjust to exclude the editor at the general level
    // Ref: https://github.com/storybookjs/storybook/issues/20813
    disable: true,
  },
};
TableStory.play = async ({ canvasElement }) => {
  await playFindElements(canvasElement);
};

export const Table = prepareStory(TableStory);

const EveryElementStory = Template.bind({});
EveryElementStory.args = {
  initialEditorState: sampleAllElement,
  onChange: (content: string) => {},
};
EveryElementStory.parameters = {
  a11y: {
    // TODO: once solution found, adjust to exclude the editor at the general level
    // Ref: https://github.com/storybookjs/storybook/issues/20813
    disable: true,
  },
};
EveryElementStory.play = async ({ canvasElement }) => {
  await playFindElements(canvasElement);
};

export const EveryElement = prepareStory(EveryElementStory);

const WithErrorStory = Template.bind({});
WithErrorStory.args = {
  error: 'this is just an example error',
  onChange: (content: string) => {},
};
WithErrorStory.parameters = {};
WithErrorStory.play = async ({ canvasElement }) => {
  await playFindElements(canvasElement);
};

export const WithError = prepareStory(WithErrorStory);
