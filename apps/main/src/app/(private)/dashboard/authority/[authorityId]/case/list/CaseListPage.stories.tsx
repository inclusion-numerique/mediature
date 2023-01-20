import { Meta, StoryFn } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { userSessionContext } from '@mediature/docs/.storybook/auth';
import { ComponentProps, StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindProgressBar } from '@mediature/docs/.storybook/testing';
import { Normal as PrivateLayoutNormalStory } from '@mediature/main/src/app/(private)/PrivateLayout.stories';
import { CaseListPage } from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/case/list/CaseListPage';
import { casesWrappers } from '@mediature/main/src/fixtures/case';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof CaseListPage;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Pages/CaseList',
  component: CaseListPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

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

const commonComponentProps: ComponentProps<ComponentType> = {
  params: {
    authorityId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
  },
};

async function playFindSearchInput(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await within(canvasElement).findByRole('textbox', {
    name: /rechercher/i,
  });
}

const Template: StoryFn<ComponentType> = (args) => {
  return <CaseListPage {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...commonComponentProps,
};
NormalStory.parameters = { ...defaultMswParameters };
NormalStory.play = async ({ canvasElement }) => {
  await playFindSearchInput(canvasElement);
};

export const Normal = prepareStory(NormalStory, {});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {
  ...commonComponentProps,
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
WithLayoutStory.play = async ({ canvasElement }) => {
  await playFindSearchInput(canvasElement);
};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: PrivateLayoutNormalStory,
});

const SearchLoadingWithLayoutStory = Template.bind({});
SearchLoadingWithLayoutStory.args = {
  ...commonComponentProps,
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

  const searchInput = await playFindSearchInput(canvasElement);

  await userEvent.type(searchInput, 'Ma belle recherche');

  await playFindProgressBar(canvasElement, /liste/i);
};

export const SearchLoadingWithLayout = prepareStory(SearchLoadingWithLayoutStory, {
  layoutStory: PrivateLayoutNormalStory,
});
