import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof LoadingArea>();

export default {
  title: 'Components/LoadingArea',
  component: LoadingArea,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof LoadingArea>;

const Template: StoryFn<any> = (args) => {
  return <LoadingArea {...args} />;
};

const DefaultStory = Template.bind({});
DefaultStory.args = {};

export const Default = prepareStory(DefaultStory);
