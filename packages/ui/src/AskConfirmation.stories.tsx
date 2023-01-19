import { Meta, StoryFn } from '@storybook/react';
import { screen, userEvent, within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { AskConfirmationDemo } from '@mediature/ui/src/AskConfirmation';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof AskConfirmationDemo>();

export default {
  title: 'Components/AskConfirmation',
  component: AskConfirmationDemo,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof AskConfirmationDemo>;

const Template: StoryFn<any> = (args) => {
  return <AskConfirmationDemo {...args} />;
};

const DefaultStory = Template.bind({});
DefaultStory.args = {};
DefaultStory.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');

  await userEvent.click(button);

  const dialog = await screen.findByRole('dialog');
  await within(dialog).findByRole('button', {
    name: /confirmer/i,
  });
};

export const Default = prepareStory(DefaultStory);
