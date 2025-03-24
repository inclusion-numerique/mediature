import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/test';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Avatar } from '@mediature/main/src/components/Avatar';

type ComponentType = typeof Avatar;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/Avatar',
  component: Avatar,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <Avatar {...args} />;
};

const DefaultStory = Template.bind({});
DefaultStory.args = {
  fullName: 'Marguerite Derrien',
};
DefaultStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByText(/MD/i);
};

export const Default = prepareStory(DefaultStory);
