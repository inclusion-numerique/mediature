import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindMainTitle } from '@mediature/docs/.storybook/testing';
import { AsAdmin as PrivateLayoutAsAdminStory } from '@mediature/main/src/app/(private)/PrivateLayout.stories';
import { MetricsPage } from '@mediature/main/src/app/(private)/dashboard/metrics/MetricsPage';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof MetricsPage;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Pages/Metrics',
  component: MetricsPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['generateCsvFromCaseAnalytics'],
        response: {
          attachment: {
            id: '13422339-278f-400d-9b25-5399e9fe6233',
            url: 'https://people.sc.fsu.edu/~jburkardt/data/csv/snakes_count_10.csv',
          },
        },
      }),
    ],
  },
};

async function playFindTitle(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await playFindMainTitle(canvasElement, /statistiques/i);
}

const Template: StoryFn<ComponentType> = (args) => {
  return <MetricsPage {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};
NormalStory.parameters = { ...defaultMswParameters };
NormalStory.play = async ({ canvasElement }) => {
  await playFindTitle(canvasElement);
};

export const Normal = prepareStory(NormalStory, {});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {};
WithLayoutStory.parameters = {
  layout: 'fullscreen',
  ...defaultMswParameters,
};
WithLayoutStory.play = async ({ canvasElement }) => {
  await playFindTitle(canvasElement);
};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: PrivateLayoutAsAdminStory,
});
