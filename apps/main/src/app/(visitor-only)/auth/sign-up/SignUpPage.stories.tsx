import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindAlert, playFindForm, playFindFormInMain } from '@mediature/docs/.storybook/testing';
import { Normal as VisitorOnlyLayoutNormalStory } from '@mediature/main/src/app/(visitor-only)/VisitorOnlyLayout.stories';
import { Empty as SignUpFormEmptyStory } from '@mediature/main/src/app/(visitor-only)/auth/sign-up/SignUpForm.stories';
import { SignUpPage, SignUpPageContext } from '@mediature/main/src/app/(visitor-only)/auth/sign-up/SignUpPage';
import { InvitationStatusSchema, PublicFacingInvitationSchema } from '@mediature/main/src/models/entities/invitation';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof SignUpPage;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Pages/SignUp',
  component: SignUpPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'query',
        path: ['getPublicFacingInvitation'],
        response: {
          invitation: PublicFacingInvitationSchema.parse({
            inviteeEmail: 'jean@france.fr',
            inviteeFirstname: 'Jean',
            inviteeLastname: 'Derrien',
            issuer: {
              id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
              email: 'pascale.leclerc@yahoo.fr',
              firstname: 'Pascale',
              lastname: 'Leclerc',
            },
            status: InvitationStatusSchema.Values.PENDING,
          }),
        },
      }),
    ],
  },
};

const tokenProvidedParameters = {
  nextjs: {
    navigation: {
      query: {
        token: 'abc',
      },
    },
  },
};

const Template: StoryFn<ComponentType> = (args) => {
  return <SignUpPage />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};
NormalStory.parameters = { ...defaultMswParameters, ...tokenProvidedParameters };
NormalStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Normal = prepareStory(NormalStory, {
  childrenContext: {
    context: SignUpPageContext,
    value: {
      ContextualSignUpForm: SignUpFormEmptyStory,
    },
  },
});

const MissingInvitationTokenStory = Template.bind({});
MissingInvitationTokenStory.args = {};
MissingInvitationTokenStory.parameters = { ...defaultMswParameters };
MissingInvitationTokenStory.play = async ({ canvasElement }) => {
  await playFindAlert(canvasElement);
};

export const MissingInvitationToken = prepareStory(MissingInvitationTokenStory, {
  childrenContext: {
    context: SignUpPageContext,
    value: {
      ContextualSignUpForm: SignUpFormEmptyStory,
    },
  },
});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {};
WithLayoutStory.parameters = {
  layout: 'fullscreen',
  ...defaultMswParameters,
  ...tokenProvidedParameters,
};
WithLayoutStory.play = async ({ canvasElement }) => {
  await playFindFormInMain(canvasElement);
};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: VisitorOnlyLayoutNormalStory,
  childrenContext: {
    context: SignUpPageContext,
    value: {
      ContextualSignUpForm: SignUpFormEmptyStory,
    },
  },
});
