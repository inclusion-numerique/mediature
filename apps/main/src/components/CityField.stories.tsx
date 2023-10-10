import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { CityField } from '@mediature/main/src/components/CityField';

type ComponentType = typeof CityField;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/CityField',
  component: CityField,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

async function playFindLabel(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await within(canvasElement).findByLabelText(/ville/i);
}

const Template: StoryFn<ComponentType> = (args) => {
  return <CityField {...args} />;
};

const NoPostalCodeStory = Template.bind({});
NoPostalCodeStory.args = {
  textFieldProps: {
    variant: 'standard',
    label: 'Ville',
  },
};
NoPostalCodeStory.play = async ({ canvasElement }) => {
  await playFindLabel(canvasElement);
};

export const NoPostalCode = prepareStory(NoPostalCodeStory);

const WithPostalCodeStory = Template.bind({});
WithPostalCodeStory.args = {
  ...NoPostalCodeStory.args,
  suggestionsPostalCode: '29200',
};
WithPostalCodeStory.play = async ({ canvasElement }) => {
  await playFindLabel(canvasElement);
};

export const WithPostalCode = prepareStory(WithPostalCodeStory);
