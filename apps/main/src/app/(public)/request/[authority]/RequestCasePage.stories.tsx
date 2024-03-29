import { Meta, StoryFn } from '@storybook/react';

import { ComponentProps, StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindAlert, playFindForm, playFindFormInMain } from '@mediature/docs/.storybook/testing';
import { Empty as RequestCaseFormEmptyStory } from '@mediature/main/src/app/(public)/request/[authority]/RequestCaseForm.stories';
import { RequestCasePage, RequestCasePageContext } from '@mediature/main/src/app/(public)/request/[authority]/RequestCasePage';
import { Normal as VisitorOnlyLayoutNormalStory } from '@mediature/main/src/app/(visitor-only)/VisitorOnlyLayout.stories';
import { PublicFacingAuthoritySchema } from '@mediature/main/src/models/entities/authority';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof RequestCasePage;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Pages/RequestCase',
  component: RequestCasePage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'query',
        path: ['getPublicFacingAuthority'],
        response: {
          authority: PublicFacingAuthoritySchema.parse({
            id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
            name: 'Bretagne',
            slug: 'my-bzh',
            logo: {
              id: 'e79cb3ba-745e-5d9a-8903-4a02327a7e01',
              url: 'https://via.placeholder.com/300x250',
            },
          }),
        },
      }),
    ],
  },
};

const commonComponentProps: ComponentProps<ComponentType> = {
  params: {
    authority: 'my-bzh',
  },
};

const Template: StoryFn<ComponentType> = (args) => {
  return <RequestCasePage {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...commonComponentProps,
};
NormalStory.parameters = { ...defaultMswParameters };
NormalStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Normal = prepareStory(NormalStory, {
  childrenContext: {
    context: RequestCasePageContext,
    value: {
      ContextualRequestCaseForm: RequestCaseFormEmptyStory,
    },
  },
});

const NotFoundStory = Template.bind({});
NotFoundStory.args = {
  ...commonComponentProps,
};
NotFoundStory.parameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'query',
        path: ['getPublicFacingAuthority'],
        response: null as any, // TODO: manage the case when an error of "not found" should be sent
      }),
    ],
  },
};
NotFoundStory.play = async ({ canvasElement }) => {
  await playFindAlert(canvasElement);
};

export const NotFound = prepareStory(NotFoundStory, {
  childrenContext: {
    context: RequestCasePageContext,
    value: {
      ContextualRequestCaseForm: RequestCaseFormEmptyStory,
    },
  },
});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {
  ...commonComponentProps,
};
WithLayoutStory.parameters = {
  layout: 'fullscreen',
  ...defaultMswParameters,
};
WithLayoutStory.play = async ({ canvasElement }) => {
  await playFindFormInMain(canvasElement);
};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: VisitorOnlyLayoutNormalStory,
  childrenContext: {
    context: RequestCasePageContext,
    value: {
      ContextualRequestCaseForm: RequestCaseFormEmptyStory,
    },
  },
});
