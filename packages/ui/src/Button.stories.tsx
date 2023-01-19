import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

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
DefaultStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByRole('button', { name: /example/i });
};

export const Default = prepareStory(DefaultStory);
