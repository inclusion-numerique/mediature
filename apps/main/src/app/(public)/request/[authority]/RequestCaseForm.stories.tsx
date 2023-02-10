import { generateMock } from '@anatine/zod-mock';
import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindForm } from '@mediature/docs/.storybook/testing';
import { RequestCaseForm } from '@mediature/main/src/app/(public)/request/[authority]/RequestCaseForm';
import { phoneInputs } from '@mediature/main/src/fixtures/phone';
import { RequestCasePrefillSchema } from '@mediature/main/src/models/actions/case';
import { CaseSchema } from '@mediature/main/src/models/entities/case';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof RequestCaseForm;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();
export default {
  title: 'Forms/RequestCase',
  component: RequestCaseForm,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['requestCase'],
        response: {
          case: generateMock(CaseSchema),
        },
      }),
    ],
  },
};

const Template: StoryFn<ComponentType> = (args) => {
  return <RequestCaseForm {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {
  prefill: RequestCasePrefillSchema.parse({
    authorityId: '00000000-0000-0000-0000-000000000000',
  }),
};
EmptyStory.parameters = { ...defaultMswParameters };
EmptyStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Empty = prepareStory(EmptyStory);

const FilledStory = Template.bind({});
FilledStory.args = {
  prefill: RequestCasePrefillSchema.parse({
    authorityId: '00000000-0000-0000-0000-000000000000',
    email: 'jean@france.fr',
    firstname: 'Jean',
    lastname: 'Derrien',
    address: {
      street: '3 rue de la Gare',
      city: 'Rennes',
      postalCode: '35000',
    },
    phone: {
      ...phoneInputs[0],
    },
    alreadyRequestedInThePast: true,
    gotAnswerFromPreviousRequest: true,
    description:
      'Et velit itaque et ea. Nobis eveniet quo incidunt ut tempora placeat. Quis repellat quod reprehenderit provident ut vero veritatis repellat. Necessitatibus provident blanditiis exercitationem accusantium. Laboriosam quae harum rerum et corrupti rem sed.',
    emailCopyWanted: true,
  }),
};
FilledStory.parameters = { ...defaultMswParameters };
FilledStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Filled = prepareStory(FilledStory);
