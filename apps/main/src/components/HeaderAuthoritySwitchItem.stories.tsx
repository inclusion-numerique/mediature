import Button from '@mui/material/Button';
import { Meta, StoryFn } from '@storybook/react';
import { screen, userEvent, within } from '@storybook/test';
import { EventEmitter } from 'eventemitter3';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { HeaderAuthoritySwitchItem } from '@mediature/main/src/components/HeaderAuthoritySwitchItem';
import { agents } from '@mediature/main/src/fixtures/agent';
import { authorities } from '@mediature/main/src/fixtures/authority';
import { UserInterfaceAuthoritySchemaType } from '@mediature/main/src/models/entities/ui';

type ComponentType = typeof HeaderAuthoritySwitchItem;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/HeaderAuthoritySwitchItem',
  component: HeaderAuthoritySwitchItem,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const uiAuthorities: UserInterfaceAuthoritySchemaType[] = [
  {
    id: authorities[0].id,
    name: authorities[0].name,
    slug: authorities[0].slug,
    logo: authorities[0].logo,
    agentId: agents[0].id,
    isMainAgent: false,
    assignedUnprocessedMessages: 3,
  },
  {
    id: authorities[1].id,
    name: authorities[1].name,
    slug: authorities[1].slug,
    logo: authorities[1].logo,
    agentId: agents[1].id,
    isMainAgent: true,
    assignedUnprocessedMessages: 4,
  },
  {
    id: authorities[2].id,
    name: authorities[2].name,
    slug: authorities[2].slug,
    logo: authorities[2].logo,
    agentId: agents[2].id,
    isMainAgent: false,
    assignedUnprocessedMessages: 1,
  },
];

const Template: StoryFn<ComponentType> = (args) => {
  const eventEmitter = new EventEmitter();

  args.eventEmitter = eventEmitter;

  return (
    <Button
      onClick={(event) => {
        eventEmitter.emit('click', event);
      }}
    >
      <HeaderAuthoritySwitchItem {...args} />
    </Button>
  );
};

const UnclickedStory = Template.bind({});
UnclickedStory.args = {
  authorities: uiAuthorities,
  currentAuthority: uiAuthorities[0],
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

  // Needed otherwise `HeaderAuthoritySwitchItem` has not yet enabled its click listener of `eventEmitter`
  await new Promise((resolve) => setTimeout(resolve, 100));

  await userEvent.click(button);

  const dialog = await screen.findByRole('menu');
  await within(dialog).findByRole('menuitem', {
    name: authorities[0].name,
  });
};

export const Clicked = prepareStory(ClickedStory);

// The parent should not display this component is there is only 1 authority
// It should select it by default
const OnlyOneAuthorityStory = Template.bind({});
OnlyOneAuthorityStory.args = {
  authorities: [uiAuthorities[0]],
};
OnlyOneAuthorityStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByRole('button');
};

export const OnlyOneAuthority = prepareStory(OnlyOneAuthorityStory);

const NoneStory = Template.bind({});
NoneStory.args = {
  authorities: [],
};
NoneStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByRole('button');
};

export const None = prepareStory(NoneStory);
