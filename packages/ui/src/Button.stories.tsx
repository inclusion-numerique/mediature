import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Button } from '@mediature/ui/src/Button';

type ComponentType = typeof Button;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/Button',
  component: Button,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <Button {...args} />;
};

const DefaultStory = Template.bind({});
DefaultStory.args = {};
DefaultStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByRole('button', { name: /example/i });
};

export const Default = prepareStory(DefaultStory);
