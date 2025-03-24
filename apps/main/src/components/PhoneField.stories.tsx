import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/test';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { PhoneField } from '@mediature/main/src/components/PhoneField';
import { PhoneTypeSchema } from '@mediature/main/src/models/entities/phone';

type ComponentType = typeof PhoneField;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/PhoneField',
  component: PhoneField,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <PhoneField {...args} />;
};

const DefaultStory = Template.bind({});
DefaultStory.args = {
  onGlobalChange(phone) {},
};
DefaultStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByRole('button', { name: /options/i });
};

export const Default = prepareStory(DefaultStory);

const WithInitialValueStory = Template.bind({});
WithInitialValueStory.args = {
  initialPhoneNumber: {
    phoneType: PhoneTypeSchema.Values.UNSPECIFIED,
    callingCode: '+33',
    countryCode: 'FR',
    number: '611223344',
  },
  onGlobalChange(phone) {},
};
WithInitialValueStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByRole('button', { name: /options/i });
};

export const WithInitialValue = prepareStory(WithInitialValueStory);
