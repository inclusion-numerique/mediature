import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { AsVisitor as PublicLayoutAsVisitorStory } from '@mediature/main/src/app/(public)/PublicLayout.stories';
import { FeaturesPage } from '@mediature/main/src/app/(public)/features/FeaturesPage';

type ComponentType = typeof FeaturesPage;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Pages/Features',
  component: FeaturesPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <FeaturesPage />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};
NormalStory.parameters = {};

export const Normal = prepareStory(NormalStory);

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {};
WithLayoutStory.parameters = {
  layout: 'fullscreen',
};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: PublicLayoutAsVisitorStory,
});
