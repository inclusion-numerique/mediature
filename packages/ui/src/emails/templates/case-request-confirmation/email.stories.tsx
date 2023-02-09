import { Meta, StoryFn } from '@storybook/react';

import { withEmailClientOverviewFactory, withEmailRenderer } from '@mediature/docs/.storybook/email';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindEmailStructure } from '@mediature/docs/.storybook/testing';
import { RequestCaseSchemaType } from '@mediature/main/src/models/actions/case';
import { commonEmailsParameters } from '@mediature/ui/src/emails/storybook-utils';
import { CaseRequestConfirmationEmail, formatTitle } from '@mediature/ui/src/emails/templates/case-request-confirmation/email';

type ComponentType = typeof CaseRequestConfirmationEmail;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Emails/Templates/CaseRequestConfirmation',
  component: CaseRequestConfirmationEmail,
  ...generateMetaDefault({
    parameters: {
      ...commonEmailsParameters,
      docs: {
        description: {
          component: 'Email sent after the citizen fulfilled a new case.',
        },
      },
    },
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <CaseRequestConfirmationEmail {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  firstname: 'Théodora',
  lastname: 'Aubert',
  caseHumanId: '76',
  authorityName: 'Bretagne',
  submittedRequestData: {
    authorityId: '00000000-0000-0000-0000-000000000000',
    email: 'jean@france.fr',
    firstname: 'Théodora',
    lastname: 'Aubert',
    // address: AddressInputSchema,
    // phone: PhoneInputSchema,
    alreadyRequestedInThePast: true,
    gotAnswerFromPreviousRequest: true,
    description:
      'Et velit itaque et ea. Nobis eveniet quo incidunt ut tempora placeat. Quis repellat quod reprehenderit provident ut vero veritatis repellat. Necessitatibus provident blanditiis exercitationem accusantium. Laboriosam quae harum rerum et corrupti rem sed.',
    emailCopyWanted: false,
  },
};
NormalStory.decorators = [withEmailRenderer];
NormalStory.play = async ({ canvasElement }) => {
  await playFindEmailStructure(canvasElement);
};

export const Normal = prepareStory(NormalStory);

const NormalClientOverviewStory = Template.bind({});
NormalClientOverviewStory.args = {
  ...NormalStory.args,
};
NormalClientOverviewStory.decorators = [withEmailRenderer, withEmailClientOverviewFactory(formatTitle())];
NormalClientOverviewStory.play = async ({ canvasElement }) => {
  await playFindEmailStructure(canvasElement);
};

export const NormalClientOverview = prepareStory(NormalClientOverviewStory);

const WithSubmittedDataStory = Template.bind({});
WithSubmittedDataStory.args = {
  ...NormalStory.args,
  submittedRequestData: {
    ...(NormalStory.args.submittedRequestData as RequestCaseSchemaType),
    emailCopyWanted: true,
  },
};
WithSubmittedDataStory.decorators = [withEmailRenderer];
WithSubmittedDataStory.play = async ({ canvasElement }) => {
  await playFindEmailStructure(canvasElement);
};

export const WithSubmittedData = prepareStory(WithSubmittedDataStory);

const WithSubmittedDataClientOverviewStory = Template.bind({});
WithSubmittedDataClientOverviewStory.args = {
  ...WithSubmittedDataStory.args,
};
WithSubmittedDataClientOverviewStory.decorators = [withEmailRenderer, withEmailClientOverviewFactory(formatTitle())];
WithSubmittedDataClientOverviewStory.play = async ({ canvasElement }) => {
  await playFindEmailStructure(canvasElement);
};

export const WithSubmittedDataClientOverview = prepareStory(WithSubmittedDataClientOverviewStory);
