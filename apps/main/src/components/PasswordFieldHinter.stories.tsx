import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { PasswordFieldHinter } from '@mediature/main/src/components/PasswordFieldHinter';

type ComponentType = typeof PasswordFieldHinter;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/PasswordFieldHinter',
  component: PasswordFieldHinter,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

async function playFindHints(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await within(canvasElement).findByText(/contenir/i);
}

const Template: StoryFn<ComponentType> = (args) => {
  return <PasswordFieldHinter {...args} />;
};

const ValidStory = Template.bind({});
ValidStory.args = {
  password: 'Mypassword@1',
};
ValidStory.parameters = {};
ValidStory.play = async ({ canvasElement }) => {
  await playFindHints(canvasElement);
};

export const Valid = prepareStory(ValidStory);

const InvalidStory = Template.bind({});
InvalidStory.args = {
  password: 'hola',
};
InvalidStory.parameters = {};
InvalidStory.play = async ({ canvasElement }) => {
  await playFindHints(canvasElement);
};

export const Invalid = prepareStory(InvalidStory);

const EmptyStory = Template.bind({});
EmptyStory.args = {
  password: '',
};
EmptyStory.parameters = {};
EmptyStory.play = async ({ canvasElement }) => {
  await playFindHints(canvasElement);
};

export const Empty = prepareStory(EmptyStory);
