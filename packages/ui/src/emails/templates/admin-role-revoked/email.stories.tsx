import { Meta, StoryFn } from '@storybook/react';

import { withEmailClientOverviewFactory, withEmailRenderer } from '@mediature/docs/.storybook/email';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindEmailStructure } from '@mediature/docs/.storybook/testing';
import { commonEmailsParameters } from '@mediature/ui/src/emails/storybook-utils';
import { AdminRoleRevokedEmail, formatTitle } from '@mediature/ui/src/emails/templates/admin-role-revoked/email';

type ComponentType = typeof AdminRoleRevokedEmail;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Emails/Templates/AdminRoleRevoked',
  component: AdminRoleRevokedEmail,
  ...generateMetaDefault({
    parameters: {
      ...commonEmailsParameters,
      docs: {
        description: {
          component: 'Email sent when the user has been revoked the admin role.',
        },
      },
    },
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <AdminRoleRevokedEmail {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  firstname: 'Thomas',
  originatorFirstname: 'Jean',
  originatorLastname: 'Derrien',
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
