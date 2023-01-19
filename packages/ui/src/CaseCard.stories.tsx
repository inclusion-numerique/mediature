import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { cases } from '@mediature/main/src/fixtures/case';
import { citizens } from '@mediature/main/src/fixtures/citizen';
import { CaseCard } from '@mediature/ui/src/CaseCard';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof CaseCard>();

export default {
  title: 'Components/CaseCard',
  component: CaseCard,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof CaseCard>;

async function playFindElement(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await within(canvasElement).findByText(/avancement du dossier/i);
}

const Template: StoryFn<any> = (args) => {
  return <CaseCard {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  case: cases[0],
  citizen: citizens[0],
  assignAction: async (agentId: string) => {},
};
NormalStory.play = async ({ canvasElement }) => {
  await playFindElement(canvasElement);
};

export const Normal = prepareStory(NormalStory);
