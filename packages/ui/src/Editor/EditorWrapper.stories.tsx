import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { EditorWrapper } from '@mediature/ui/src/Editor/EditorWrapper';

import { contentSampleGenerator } from './sample';

type ComponentType = typeof EditorWrapper;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/EditorWrapper',
  component: EditorWrapper,
  ...generateMetaDefault({
    parameters: {
      a11y: {
        disable: true,
      },
    },
  }),
} as Meta<ComponentType>;

async function playFindElements(canvasElement: HTMLElement): Promise<HTMLElement[]> {
  return await within(canvasElement).findAllByRole('button', { name: /formatting/i });
}

const Template: StoryFn<ComponentType> = (args) => {
  return <EditorWrapper {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {};
EmptyStory.play = async ({ canvasElement }) => {
  await playFindElements(canvasElement);
};

export const Empty = prepareStory(EmptyStory);

const LoremStory = Template.bind({});
LoremStory.args = {
  editorStateInitializer: contentSampleGenerator,
};
LoremStory.play = async ({ canvasElement }) => {
  await playFindElements(canvasElement);
};

export const Lorem = prepareStory(LoremStory);
