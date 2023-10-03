import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { ComponentProps, StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { UnassignedCaseSlider } from '@mediature/main/src/components/UnassignedCaseSlider';
import { casesWrappers } from '@mediature/main/src/fixtures/case';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof UnassignedCaseSlider;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/UnassignedCaseSlider',
  component: UnassignedCaseSlider,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const commonComponentProps: ComponentProps<ComponentType> = {
  authorityId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
  assignAction: async (caseId: string) => {},
};

const Template: StoryFn<ComponentType> = (args) => {
  return <UnassignedCaseSlider {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...commonComponentProps,
};
NormalStory.parameters = {
  testing: {
    timeToWaitAfterChangingThemeMs: 2000,
  },
  msw: {
    handlers: [
      getTRPCMock({
        type: 'query',
        path: ['listCases'],
        response: {
          casesWrappers: [
            { ...casesWrappers[0], similarCases: [casesWrappers[1].case, casesWrappers[2].case] },
            casesWrappers[1],
            casesWrappers[2],
            ...[casesWrappers[0], casesWrappers[1], casesWrappers[2]].map((c) => {
              const deepCopyC = JSON.parse(JSON.stringify(c));
              deepCopyC.case.id = 'y' + c.case.id.substring(1);
              return deepCopyC;
            }),
            ...[casesWrappers[0], casesWrappers[1], casesWrappers[2]].map((c) => {
              const deepCopyC = JSON.parse(JSON.stringify(c));
              deepCopyC.case.id = 'z' + c.case.id.substring(1);
              return deepCopyC;
            }),
          ],
        },
      }),
    ],
  },
};
NormalStory.play = async ({ canvasElement }) => {
  const slides = await within(canvasElement).findAllByRole('group');
  await within(slides[0]).findByRole('button');
};

export const Normal = prepareStory(NormalStory);

const NoCaseStory = Template.bind({});
NoCaseStory.args = {
  ...commonComponentProps,
};
NoCaseStory.parameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'query',
        path: ['listCases'],
        response: {
          casesWrappers: [],
        },
      }),
    ],
  },
};
NoCaseStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByRole('alert');
};

export const NoCase = prepareStory(NoCaseStory);
