import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Avatar } from '@mediature/ui/src/Avatar';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof Avatar>();

export default {
  title: 'Components/Avatar',
  component: Avatar,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof Avatar>;

const Template: StoryFn<any> = (args) => {
  return <Avatar {...args} />;
};

const DefaultStory = Template.bind({});
DefaultStory.args = {
  fullName: 'Marguerite Derrien',
};

export const Default = prepareStory(DefaultStory);
