import { Meta, StoryFn } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

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

const mswListAuthoritiesParameters = {
  type: 'query' as 'query',
  path: ['listAuthorities'] as ['listAuthorities'],
  response: {
    authoritiesWrappers: [authoritiesWrappers[0], authoritiesWrappers[1], authoritiesWrappers[2]],
  },
};

const defaultMswParameters = {
  msw: {
    handlers: [getTRPCMock(mswListAuthoritiesParameters)],
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
WithLayoutStory.parameters = {
  layout: 'fullscreen',
  msw: {
    handlers: [
      getTRPCMock({
        ...mswListAuthoritiesParameters,
      }),
    ],
  },
  ...defaultAuthParameters,
};

const SearchLoadingWithLayoutStory = Template.bind({});
SearchLoadingWithLayoutStory.args = {};

export const SearchLoadingWithLayout = prepareStory(SearchLoadingWithLayoutStory, {
  layoutStory: PrivateLayoutNormalStory,
});
SearchLoadingWithLayoutStory.parameters = {
  layout: 'fullscreen',
  counter: 0,
  msw: {
    handlers: [
      getTRPCMock({
        ...mswListAuthoritiesParameters,
        delayHook: (req, params) => {
          // It will be infinite for all except the first query that allows displaying almost all the page
          if (SearchLoadingWithLayoutStory.parameters?.counter !== undefined) {
            SearchLoadingWithLayoutStory.parameters.counter++;

            if (SearchLoadingWithLayoutStory.parameters.counter > 1) {
              return 'infinite';
            }
          }

          return null;
        },
      }),
    ],
  },
  ...defaultAuthParameters,
};
SearchLoadingWithLayoutStory.play = async ({ canvasElement }) => {
  if (SearchLoadingWithLayoutStory.parameters?.counter !== undefined) {
    SearchLoadingWithLayoutStory.parameters.counter = 0;
  }

  const canvas = within(canvasElement);
  const searchInput = await canvas.findByRole('textbox', {
    name: /Rechercher/i,
  });

  await userEvent.type(searchInput, 'Ma belle recherche');
};
