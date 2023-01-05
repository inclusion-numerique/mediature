import { Meta, StoryFn } from '@storybook/react';

import { userSessionContext } from '@mediature/docs/.storybook/auth';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import PublicLayout from '@mediature/main/src/app/(public)/layout';
import { Lorem as PublicLayoutLoremStory } from '@mediature/main/src/app/(public)/layout.stories';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof PublicLayout>();

export default {
  title: 'Layouts/PrivatePages',
  component: PublicLayout,
  ...generateMetaDefault({
    parameters: {
      msw: {
        handlers: [],
      },
    },
  }),
} as Meta<typeof PublicLayout>;

const Template: StoryFn<typeof PublicLayout> = (args) => {
  return <PublicLayout {...args} />;
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
