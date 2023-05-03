import { Meta, StoryFn } from '@storybook/react';

import { withEmailClientOverviewFactory, withEmailRenderer } from '@mediature/docs/.storybook/email';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindEmailStructure } from '@mediature/docs/.storybook/testing';
import { commonEmailsParameters } from '@mediature/ui/src/emails/storybook-utils';
import { PasswordResetEmail, formatTitle } from '@mediature/ui/src/emails/templates/password-reset/email';

type ComponentType = typeof PasswordResetEmail;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Emails/Templates/PasswordReset',
  component: PasswordResetEmail,
  ...generateMetaDefault({
    parameters: {
      ...commonEmailsParameters,
      docs: {
        description: {
          component: 'Email sent when the user updated his password after a "forgot my password" request.',
        },
      },
    },
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <PasswordResetEmail {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  firstname: 'Thomas',
  signInUrl: '',
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
