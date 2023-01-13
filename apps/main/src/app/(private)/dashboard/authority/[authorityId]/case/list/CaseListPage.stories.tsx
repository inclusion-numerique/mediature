import { Meta, StoryFn } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { userSessionContext } from '@mediature/docs/.storybook/auth';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Normal as PrivateLayoutNormalStory } from '@mediature/main/src/app/(private)/PrivateLayout.stories';
import { CaseListPage } from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/case/list/CaseListPage';
import { casesWrappers } from '@mediature/main/src/fixtures/case';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof CaseListPage>();

export default {
  title: 'Pages/CaseList',
  component: CaseListPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof CaseListPage>;

const mswListCasesParameters = {
  type: 'query' as 'query',
  path: ['listCases'] as ['listCases'],
  response: {
    casesWrappers: [casesWrappers[0], casesWrappers[1], casesWrappers[2]],
  },
};

const defaultMswParameters = {
  msw: {
    handlers: [getTRPCMock(mswListCasesParameters)],
  },
};

const commonNextParamsParameters = {
  params: {
    authorityId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
  },
};

const Template: StoryFn<typeof CaseListPage> = (args) => {
  return <CaseListPage {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...commonNextParamsParameters,
};
NormalStory.parameters = { ...defaultMswParameters };

export const Normal = prepareStory(NormalStory, {});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {
  ...commonNextParamsParameters,
};
WithLayoutStory.parameters = {
  layout: 'fullscreen',
  msw: {
    handlers: [
      getTRPCMock({
        ...mswListCasesParameters,
      }),
    ],
  },
};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: PrivateLayoutNormalStory,
});

const SearchLoadingWithLayoutStory = Template.bind({});
SearchLoadingWithLayoutStory.args = {
  ...commonNextParamsParameters,
};
SearchLoadingWithLayoutStory.parameters = {
  layout: 'fullscreen',
  counter: 0,
  msw: {
    handlers: [
      getTRPCMock({
        ...mswListCasesParameters,
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

  const canvas = within(canvasElement);
  const searchInput = await canvas.findByRole('textbox', {
    name: /Rechercher/i,
  });

  await userEvent.type(searchInput, 'Ma belle recherche');
};

export const SearchLoadingWithLayout = prepareStory(SearchLoadingWithLayoutStory, {
  layoutStory: PrivateLayoutNormalStory,
});
