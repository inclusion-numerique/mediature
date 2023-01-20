import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { ComponentProps, StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Normal as PrivateLayoutNormalStory } from '@mediature/main/src/app/(private)/PrivateLayout.stories';
import {
  CaseAssignationPage,
  CaseAssignationPageContext,
} from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/case/list/unassigned/CaseAssignationPage';
import { Normal as UnassignedCaseSliderNormalStory } from '@mediature/main/src/components/UnassignedCaseSlider.stories';
import { cases } from '@mediature/main/src/fixtures/case';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof CaseAssignationPage;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Pages/CaseAssignation',
  component: CaseAssignationPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

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

const commonComponentProps: ComponentProps<ComponentType> = {
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

const Template: StoryFn<ComponentType> = (args) => {
  return <CaseAssignationPage {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...commonComponentProps,
};
NormalStory.parameters = { ...defaultMswParameters };
NormalStory.play = async ({ canvasElement }) => {
  await playFindElement(canvasElement);
};

export const Normal = prepareStory(NormalStory, {});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {
  ...commonComponentProps,
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
