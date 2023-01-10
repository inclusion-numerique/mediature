import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { authoritiesWrappers } from '@mediature/main/src/fixtures/authority';
import { AuthorityCard } from '@mediature/ui/src/AuthorityCard';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof AuthorityCard>();

export default {
  title: 'Components/AuthorityCard',
  component: AuthorityCard,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof AuthorityCard>;

const Template: StoryFn<any> = (args) => {
  return <AuthorityCard {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...authoritiesWrappers[0],
};

export const Normal = prepareStory(NormalStory);

const NoCasesStory = Template.bind({});
NoCasesStory.args = {
  ...NormalStory.args,
  openCases: 0,
  closeCases: 0,
};

export const NoCases = prepareStory(NoCasesStory);

const NoMainAgentStory = Template.bind({});
NoMainAgentStory.args = {
  ...NormalStory.args,
  mainAgent: null,
};

export const NoMainAgent = prepareStory(NoMainAgentStory);

const NoAgentsStory = Template.bind({});
NoAgentsStory.args = {
  ...NormalStory.args,
  agents: [],
};

export const NoAgents = prepareStory(NoAgentsStory);
