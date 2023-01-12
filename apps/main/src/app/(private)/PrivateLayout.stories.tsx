import { Meta, StoryFn } from '@storybook/react';

import { userSessionContext } from '@mediature/docs/.storybook/auth';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { PrivateLayout } from '@mediature/main/src/app/(private)/PrivateLayout';
import { Loading as PublicLayoutLoadingStory, Lorem as PublicLayoutLoremStory } from '@mediature/main/src/app/(public)/PublicLayout.stories';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof PrivateLayout>();

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
} as Meta<typeof PrivateLayout>;

const Template: StoryFn<typeof PrivateLayout> = (args) => {
  return <PrivateLayout {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.parameters = {
  nextAuthMock: {
    session: userSessionContext,
  },
};
NormalStory.args = {};

export const Normal = prepareStory(NormalStory);

const LoremStory = Template.bind({});
LoremStory.parameters = {
  ...NormalStory.parameters,
};
LoremStory.args = {
  ...PublicLayoutLoremStory.args,
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

export const Loading = prepareStory(LoadingStory);
Loading.storyName = 'With loader';
