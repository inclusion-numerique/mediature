import Button from '@mui/material/Button';
import { Meta, StoryFn } from '@storybook/react';
import { screen, userEvent, within } from '@storybook/testing-library';
import { EventEmitter } from 'eventemitter3';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { HeaderUserItem } from '@mediature/main/src/components/HeaderUserItem';

type ComponentType = typeof HeaderUserItem;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/HeaderUserItem',
  component: HeaderUserItem,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  const eventEmitter = new EventEmitter();

  args.eventEmitter = eventEmitter;

  return (
    <Button
      onClick={(event) => {
        eventEmitter.emit('click', event);
      }}
    >
      <HeaderUserItem {...args} />
    </Button>
  );
};

const UnclickedStory = Template.bind({});
UnclickedStory.args = {
  user: {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'jean@france.com',
    firstname: 'Jean',
    lastname: 'Derrien',
    profilePicture: null,
  },
};
UnclickedStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByRole('button');
};

export const Unclicked = prepareStory(UnclickedStory);

const ClickedStory = Template.bind({});
ClickedStory.args = {
  ...UnclickedStory.args,
};
ClickedStory.play = async ({ canvasElement }) => {
  const button = await within(canvasElement).findByRole('button');

  // Needed otherwise `HeaderUserItem` has not yet enabled its click listener of `eventEmitter`
  await new Promise((resolve) => setTimeout(resolve, 100));

  await userEvent.click(button);

  const dialog = await screen.findByRole('menu');
  await within(dialog).findByRole('menuitem', {
    name: /paramètres/i,
  });
};

export const Clicked = prepareStory(ClickedStory);
