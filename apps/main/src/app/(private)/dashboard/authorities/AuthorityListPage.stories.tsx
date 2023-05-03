import { Meta, StoryFn } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { userSessionContext } from '@mediature/docs/.storybook/auth';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindProgressBar } from '@mediature/docs/.storybook/testing';
import { AsMainAgent as PrivateLayoutAsMainAgentStory } from '@mediature/main/src/app/(private)/PrivateLayout.stories';
import { AuthorityListPage } from '@mediature/main/src/app/(private)/dashboard/authorities/AuthorityListPage';
import { authoritiesWrappers } from '@mediature/main/src/fixtures/authority';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof AuthorityListPage;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();
export default {
  title: 'Pages/AuthorityList',
  component: AuthorityListPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

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

async function playFindSearchInput(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await within(canvasElement).findByRole('textbox', {
    name: /rechercher/i,
  });
}

const Template: StoryFn<ComponentType> = (args) => {
  return <AuthorityListPage />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};
NormalStory.parameters = { ...defaultMswParameters };
NormalStory.play = async ({ canvasElement }) => {
  await playFindSearchInput(canvasElement);
};

export const Normal = prepareStory(NormalStory, {});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {};
WithLayoutStory.parameters = {
  layout: 'fullscreen',
  msw: {
    handlers: [
      getTRPCMock({
        ...mswListAuthoritiesParameters,
      }),
    ],
  },
};
WithLayoutStory.play = async ({ canvasElement }) => {
  await playFindSearchInput(canvasElement);
};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: PrivateLayoutAsMainAgentStory,
});

const SearchLoadingWithLayoutStory = Template.bind({});
SearchLoadingWithLayoutStory.args = {};
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
};
SearchLoadingWithLayoutStory.play = async ({ canvasElement }) => {
  if (SearchLoadingWithLayoutStory.parameters?.counter !== undefined) {
    SearchLoadingWithLayoutStory.parameters.counter = 0;
  }

  const searchInput = await playFindSearchInput(canvasElement);

  await userEvent.type(searchInput, 'Ma belle recherche');

  await playFindProgressBar(canvasElement, /liste/i);
};

export const SearchLoadingWithLayout = prepareStory(SearchLoadingWithLayoutStory, {
  layoutStory: PrivateLayoutAsMainAgentStory,
});
