import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { commonEmailsParameters } from '@mediature/ui/src/emails/storybook-utils';
import { SignUpConfirmationEmail } from '@mediature/ui/src/emails/templates/sign-up-confirmation/email';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof SignUpConfirmationEmail>();

export default {
  title: 'Emails/Templates/SignUpConfirmation',
  component: SignUpConfirmationEmail,
  ...generateMetaDefault({
    parameters: {
      ...commonEmailsParameters,
      docs: {
        description: {
          component: 'Email sent just after the user has signed up.',
        },
      },
    },
  }),
} as Meta<typeof SignUpConfirmationEmail>;

const Template: StoryFn<typeof SignUpConfirmationEmail> = (args) => {
  return <SignUpConfirmationEmail {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  firstname: 'Thomas',
  signInUrl: '',
};

export const Normal = prepareStory(NormalStory);
