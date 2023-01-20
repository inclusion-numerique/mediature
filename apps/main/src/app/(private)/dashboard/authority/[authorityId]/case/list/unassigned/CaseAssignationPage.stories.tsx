import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Normal as PrivateLayoutNormalStory } from '@mediature/main/src/app/(private)/PrivateLayout.stories';
import {
  CaseAssignationPage,
  CaseAssignationPageContext,
} from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/case/list/unassigned/CaseAssignationPage';
import { Normal as UnassignedCaseSliderNormalStory } from '@mediature/main/src/components/UnassignedCaseSlider.stories';
import { cases } from '@mediature/main/src/fixtures/case';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof CaseAssignationPage>();

export default {
  title: 'Pages/CaseAssignation',
  component: CaseAssignationPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof CaseAssignationPage>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['assignCase'],
        response: { case: cases[0] },
      }),
    ],
  },
};

const commonNextParamsParameters = {
  params: {
    authorityId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
  },
};

async function playFindElement(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await within(canvasElement).findByRole('heading', {
    level: 1,
    name: /dossiers/i,
  });
}

const Template: StoryFn<typeof CaseAssignationPage> = (args) => {
  return <CaseAssignationPage {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...commonNextParamsParameters,
};
NormalStory.parameters = { ...defaultMswParameters };
NormalStory.play = async ({ canvasElement }) => {
  await playFindElement(canvasElement);
};

export const Normal = prepareStory(NormalStory, {});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {
  ...commonNextParamsParameters,
};
WithLayoutStory.parameters = {
  layout: 'fullscreen',
  ...defaultMswParameters,
};
WithLayoutStory.play = async ({ canvasElement }) => {
  await playFindElement(canvasElement);
};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: PrivateLayoutNormalStory,
  childrenContext: {
    context: CaseAssignationPageContext,
    value: {
      ContextualUnassignedCaseSlider: UnassignedCaseSliderNormalStory,
    },
  },
});
