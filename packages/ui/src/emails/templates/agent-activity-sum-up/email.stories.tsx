import { Meta, StoryFn } from '@storybook/react';

import { withEmailClientOverviewFactory, withEmailRenderer } from '@mediature/docs/.storybook/email';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindEmailStructure } from '@mediature/docs/.storybook/testing';
import { commonEmailsParameters } from '@mediature/ui/src/emails/storybook-utils';
import { AgentActivitySumUpEmail, formatTitle } from '@mediature/ui/src/emails/templates/agent-activity-sum-up/email';

type ComponentType = typeof AgentActivitySumUpEmail;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Emails/Templates/AgentActivitySumUp',
  component: AgentActivitySumUpEmail,
  ...generateMetaDefault({
    parameters: {
      ...commonEmailsParameters,
      docs: {
        description: {
          component: 'Email sent to agents on regular basis to get an overview.',
        },
      },
    },
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <AgentActivitySumUpEmail {...args} />;
};

const CompleteStory = Template.bind({});
CompleteStory.args = {
  firstname: 'Thomas',
  unassignedCasesNumber: 6,
  casesWithReminderSoon: [
    {
      citizenFirstname: 'Philémon',
      citizenLastname: 'Vincent',
      reminderAt: new Date('December 19, 2022 04:33:00 UTC'),
      caseUrl: '',
      caseHumanId: '39',
    },
    {
      citizenFirstname: 'Arsènie',
      citizenLastname: 'Prevost',
      reminderAt: new Date('December 18, 2022 04:33:00 UTC'),
      caseUrl: '',
      caseHumanId: '45',
    },
    {
      citizenFirstname: 'Aurian',
      citizenLastname: 'Le gall',
      reminderAt: new Date('December 29, 2022 04:33:00 UTC'),
      caseUrl: '',
      caseHumanId: '46',
    },
  ],
  authorityDashboardUrl: '',
};
CompleteStory.decorators = [withEmailRenderer];
CompleteStory.play = async ({ canvasElement }) => {
  await playFindEmailStructure(canvasElement);
};

export const Complete = prepareStory(CompleteStory);

const CompleteClientOverviewStory = Template.bind({});
CompleteClientOverviewStory.args = {
  ...CompleteStory.args,
};
CompleteClientOverviewStory.decorators = [withEmailRenderer, withEmailClientOverviewFactory(formatTitle())];
CompleteClientOverviewStory.play = async ({ canvasElement }) => {
  await playFindEmailStructure(canvasElement);
};

export const CompleteClientOverview = prepareStory(CompleteClientOverviewStory);

const OnlyUnassignedCasesStory = Template.bind({});
OnlyUnassignedCasesStory.args = {
  ...CompleteStory.args,
  casesWithReminderSoon: [],
};
OnlyUnassignedCasesStory.decorators = [withEmailRenderer];
OnlyUnassignedCasesStory.play = async ({ canvasElement }) => {
  await playFindEmailStructure(canvasElement);
};

export const OnlyUnassignedCases = prepareStory(OnlyUnassignedCasesStory);

const OnlyUnassignedCasesClientOverviewStory = Template.bind({});
OnlyUnassignedCasesClientOverviewStory.args = {
  ...OnlyUnassignedCasesStory.args,
};
OnlyUnassignedCasesClientOverviewStory.decorators = [withEmailRenderer, withEmailClientOverviewFactory(formatTitle())];
OnlyUnassignedCasesClientOverviewStory.play = async ({ canvasElement }) => {
  await playFindEmailStructure(canvasElement);
};

export const OnlyUnassignedCasesClientOverview = prepareStory(OnlyUnassignedCasesClientOverviewStory);

const OnlyRemindedCasesStory = Template.bind({});
OnlyRemindedCasesStory.args = {
  ...CompleteStory.args,
  unassignedCasesNumber: 0,
};
OnlyRemindedCasesStory.decorators = [withEmailRenderer];
OnlyRemindedCasesStory.play = async ({ canvasElement }) => {
  await playFindEmailStructure(canvasElement);
};

export const OnlyRemindedCases = prepareStory(OnlyRemindedCasesStory);

const OnlyRemindedCasesClientOverviewStory = Template.bind({});
OnlyRemindedCasesClientOverviewStory.args = {
  ...OnlyRemindedCasesStory.args,
};
OnlyRemindedCasesClientOverviewStory.decorators = [withEmailRenderer, withEmailClientOverviewFactory(formatTitle())];
OnlyRemindedCasesClientOverviewStory.play = async ({ canvasElement }) => {
  await playFindEmailStructure(canvasElement);
};

export const OnlyRemindedCasesClientOverview = prepareStory(OnlyRemindedCasesClientOverviewStory);
