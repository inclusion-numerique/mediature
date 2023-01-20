import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { userSessionContext } from '@mediature/docs/.storybook/auth';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindMain, playFindProgressBar } from '@mediature/docs/.storybook/testing';
import { PrivateLayout } from '@mediature/main/src/app/(private)/PrivateLayout';
import { Loading as PublicLayoutLoadingStory, Lorem as PublicLayoutLoremStory } from '@mediature/main/src/app/(public)/PublicLayout.stories';

type ComponentType = typeof PrivateLayout;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Layouts/PrivatePages',
  component: PrivateLayout,
  ...generateMetaDefault({
    parameters: {
      layout: 'fullscreen',
      msw: {
        handlers: [],
      },
    },
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <PrivateLayout {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.parameters = {
  nextAuthMock: {
    session: userSessionContext,
  },
};
NormalStory.args = {};
NormalStory.play = async ({ canvasElement }) => {
  await playFindMain(canvasElement);
};

export const Normal = prepareStory(NormalStory);

const LoremStory = Template.bind({});
LoremStory.parameters = {
  ...NormalStory.parameters,
};
LoremStory.args = {
  ...PublicLayoutLoremStory.args,
};
LoremStory.play = async ({ canvasElement }) => {
  await playFindMain(canvasElement);
};

export const Lorem = prepareStory(LoremStory);
Lorem.storyName = 'With lorem';

const LoadingStory = Template.bind({});
LoadingStory.parameters = {
  ...NormalStory.parameters,
};
LoadingStory.args = {
  ...PublicLayoutLoadingStory.args,
};
LoadingStory.play = async ({ canvasElement }) => {
  await playFindProgressBar(canvasElement, /chargement/i);
};

export const Loading = prepareStory(LoadingStory);
Loading.storyName = 'With loader';
