import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { addHours } from 'date-fns';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { cases } from '@mediature/main/src/fixtures/case';
import { citizens } from '@mediature/main/src/fixtures/citizen';
import { CaseSchema } from '@mediature/main/src/models/entities/case';
import { CaseSliderCard } from '@mediature/ui/src/CaseSliderCard';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof CaseSliderCard>();

export default {
  title: 'Components/CaseSliderCard',
  component: CaseSliderCard,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof CaseSliderCard>;

async function playFindElement(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await within(canvasElement).findByText(/avancement du dossier/i);
}

const Template: StoryFn<any> = (args) => {
  return <CaseSliderCard {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  case: cases[0],
  citizen: citizens[0],
  assignAction: async () => {},
};
NormalStory.play = async ({ canvasElement }) => {
  await playFindElement(canvasElement);
};

export const Normal = prepareStory(NormalStory);

const ReminderSoonStory = Template.bind({});
ReminderSoonStory.args = {
  case: CaseSchema.parse({ ...cases[0], termReminderAt: addHours(new Date(), 3) }),
  citizen: citizens[0],
  assignAction: async () => {},
};
ReminderSoonStory.play = async ({ canvasElement }) => {
  await playFindElement(canvasElement);
};

export const ReminderSoon = prepareStory(ReminderSoonStory);
