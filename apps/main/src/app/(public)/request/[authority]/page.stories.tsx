import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Empty as RequestCaseFormEmptyStory } from '@mediature/main/src/app/(public)/request/[authority]/RequestCaseForm.stories';
import { RequestCasePage, RequestCasePageContext } from '@mediature/main/src/app/(public)/request/[authority]/page';
import { Normal as VisitorOnlyLayoutNormalStory } from '@mediature/main/src/app/(visitor-only)/layout.stories';
import { PublicFacingAuthoritySchema } from '@mediature/main/src/models/entities/authority';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof RequestCasePage>();

export default {
  title: 'Pages/RequestCase',
  component: RequestCasePage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof RequestCasePage>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'query',
        path: ['getPublicFacingAuthority'],
        response: {
          authority: PublicFacingAuthoritySchema.parse({
            id: '00000000-0000-0000-0000-000000000000',
            name: 'Bretagne',
            slug: 'my-bzh',
            logo: null,
          }),
        },
      }),
    ],
  },
};

const commonNextParamsParameters = {
  params: {
    authority: 'my-bzh',
  },
};

const Template: StoryFn<typeof RequestCasePage> = (args) => {
  return <RequestCasePage {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...commonNextParamsParameters,
};
NormalStory.parameters = { ...defaultMswParameters };

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
  ...commonNextParamsParameters,
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
  ...commonNextParamsParameters,
};
WithLayoutStory.parameters = { ...defaultMswParameters };

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: VisitorOnlyLayoutNormalStory,
  childrenContext: {
    context: RequestCasePageContext,
    value: {
      ContextualRequestCaseForm: RequestCaseFormEmptyStory,
    },
  },
});
