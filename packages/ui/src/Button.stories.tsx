import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Button } from '@mediature/ui/src/Button';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof Button>();

export default {
  title: 'Components/Button',
  component: Button,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof Button>;

const Template: StoryFn<any> = (args) => {
  return <Button {...args} />;
};

const DefaultStory = Template.bind({});
DefaultStory.args = {};

export const Default = prepareStory(DefaultStory);
