import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Introduction } from '@mediature/main/src/app/(public)/(home)/Introduction';

type ComponentType = typeof Introduction;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/Home/Introduction',
  component: Introduction,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <Introduction />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};
NormalStory.parameters = {};

export const Normal = prepareStory(NormalStory);
