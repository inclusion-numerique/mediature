import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { agentsWrappers } from '@mediature/main/src/fixtures/agent';
import { AgentCard } from '@mediature/ui/src/AgentCard';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof AgentCard>();

export default {
  title: 'Components/AgentCard',
  component: AgentCard,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof AgentCard>;

const Template: StoryFn<any> = (args) => {
  return <AgentCard {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...agentsWrappers[0],
  removeAction: async () => {},
};

export const Normal = prepareStory(NormalStory);

const NoCasesStory = Template.bind({});
NoCasesStory.args = {
  ...NormalStory.args,
  openCases: 0,
  closeCases: 0,
};

export const NoCases = prepareStory(NoCasesStory);
