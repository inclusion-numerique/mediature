import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { agentsWrappers } from '@mediature/main/src/fixtures/agent';
import { AgentCard } from '@mediature/ui/src/AgentCard';

type ComponentType = typeof AgentCard;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/AgentCard',
  component: AgentCard,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

async function playFindElement(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await within(canvasElement).findByText(/dossiers en cours/i);
}

const Template: StoryFn<typeof AgentCard> = (args) => {
  return <AgentCard {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...agentsWrappers[0],
  removeAction: async () => {},
};
NormalStory.play = async ({ canvasElement }) => {
  await playFindElement(canvasElement);
};

export const Normal = prepareStory(NormalStory);

const NoCasesStory = Template.bind({});
NoCasesStory.args = {
  ...NormalStory.args,
  openCases: 0,
  closeCases: 0,
};
NoCasesStory.play = async ({ canvasElement }) => {
  await playFindElement(canvasElement);
};

export const NoCases = prepareStory(NoCasesStory);
