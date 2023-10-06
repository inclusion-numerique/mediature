import { Meta, StoryFn } from '@storybook/react';

import { withEmailClientOverviewFactory, withEmailRenderer } from '@mediature/docs/.storybook/email';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindEmailStructure } from '@mediature/docs/.storybook/testing';
import { commonEmailsParameters } from '@mediature/ui/src/emails/storybook-utils';
import { CaseUnassignedBySomeoneEmail, formatTitle } from '@mediature/ui/src/emails/templates/case-unassigned-by-someone/email';

type ComponentType = typeof CaseUnassignedBySomeoneEmail;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Emails/Templates/CaseUnassignedBySomeone',
  component: CaseUnassignedBySomeoneEmail,
  ...generateMetaDefault({
    parameters: {
      ...commonEmailsParameters,
      docs: {
        description: {
          component: 'Email sent when someone unassigned the agent from a case.',
        },
      },
    },
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <CaseUnassignedBySomeoneEmail {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  firstname: 'Thomas',
  originatorFirstname: 'Jean',
  originatorLastname: 'Derrien',
  caseUrl: '',
  caseHumanId: '65',
};
NormalStory.decorators = [withEmailRenderer];
NormalStory.play = async ({ canvasElement }) => {
  await playFindEmailStructure(canvasElement);
};

export const Normal = prepareStory(NormalStory);

const ClientOverviewStory = Template.bind({});
ClientOverviewStory.args = {
  ...NormalStory.args,
};
ClientOverviewStory.decorators = [withEmailRenderer, withEmailClientOverviewFactory(formatTitle())];
ClientOverviewStory.play = async ({ canvasElement }) => {
  await playFindEmailStructure(canvasElement);
};

export const ClientOverview = prepareStory(ClientOverviewStory);
