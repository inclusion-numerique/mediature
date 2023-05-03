import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { authoritiesWrappers } from '@mediature/main/src/fixtures/authority';
import { AuthorityCard } from '@mediature/ui/src/AuthorityCard';

type ComponentType = typeof AuthorityCard;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/AuthorityCard',
  component: AuthorityCard,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

async function playFindElement(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await within(canvasElement).findByText(/dossiers en cours/i);
}

const Template: StoryFn<ComponentType> = (args) => {
  return <AuthorityCard {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...authoritiesWrappers[0],
  authorityAgentsManagementLink: '',
  authorityEditLink: '',
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

const NoMainAgentStory = Template.bind({});
NoMainAgentStory.args = {
  ...NormalStory.args,
  mainAgent: null,
};
NoMainAgentStory.play = async ({ canvasElement }) => {
  await playFindElement(canvasElement);
};

export const NoMainAgent = prepareStory(NoMainAgentStory);

const NoAgentsStory = Template.bind({});
NoAgentsStory.args = {
  ...NormalStory.args,
  agents: [],
};
NoAgentsStory.play = async ({ canvasElement }) => {
  await playFindElement(canvasElement);
};

export const NoAgents = prepareStory(NoAgentsStory);
