import { Meta, StoryFn } from '@storybook/react';

import { userSessionContext } from '@mediature/docs/.storybook/auth';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Normal as PrivateLayoutNormalStory } from '@mediature/main/src/app/(private)/PrivateLayout.stories';
import { AuthorityListPage } from '@mediature/main/src/app/(private)/dashboard/authority/list/AuthorityListPage';
import { authoritiesWrappers } from '@mediature/main/src/fixtures/authority';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof AuthorityListPage>();

export default {
  title: 'Pages/AuthorityList',
  component: AuthorityListPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof AuthorityListPage>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'query',
        path: ['listAuthorities'],
        response: {
          authoritiesWrappers: [authoritiesWrappers[0], authoritiesWrappers[1], authoritiesWrappers[2]],
        },
      }),
    ],
  },
};

const defaultAuthParameters = {
  nextAuthMock: {
    session: userSessionContext,
  },
};

const Template: StoryFn<typeof AuthorityListPage> = (args) => {
  return <AuthorityListPage />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};
NormalStory.parameters = { ...defaultMswParameters, ...defaultAuthParameters };

export const Normal = prepareStory(NormalStory, {});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: PrivateLayoutNormalStory,
});
WithLayoutStory.parameters = { ...defaultMswParameters, ...defaultAuthParameters };
