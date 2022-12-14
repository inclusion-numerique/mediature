import { Meta, StoryFn } from '@storybook/react';

import { visitorSessionContext } from '@mediature/docs/.storybook/auth';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Loading as PublicLayoutLoadingStory, Lorem as PublicLayoutLoremStory } from '@mediature/main/src/app/(public)/PublicLayout.stories';
import { VisitorOnlyLayout } from '@mediature/main/src/app/(visitor-only)/VisitorOnlyLayout';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof VisitorOnlyLayout>();

export default {
  title: 'Layouts/VisitorOnlyPages',
  component: VisitorOnlyLayout,
  ...generateMetaDefault({
    parameters: {
      layout: 'fullscreen',
      msw: {
        handlers: [],
      },
    },
  }),
} as Meta<typeof VisitorOnlyLayout>;

const Template: StoryFn<typeof VisitorOnlyLayout> = (args) => {
  return <VisitorOnlyLayout {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.parameters = {
  nextAuthMock: {
    session: visitorSessionContext,
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
