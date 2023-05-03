import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Features } from '@mediature/main/src/app/(public)/(home)/Features';

type ComponentType = typeof Features;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/Home/Features',
  component: Features,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <Features />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};
NormalStory.parameters = {};

export const Normal = prepareStory(NormalStory);
