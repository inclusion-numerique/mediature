import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindForm } from '@mediature/docs/.storybook/testing';
import { CreateCaseDomainItemForm } from '@mediature/main/src/components/CreateCaseDomainItemForm';
import { caseDomains } from '@mediature/main/src/fixtures/case';
import { CreateCaseDomainItemPrefillSchema } from '@mediature/main/src/models/actions/case';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof CreateCaseDomainItemForm;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();
export default {
  title: 'Forms/CreateCaseDomainItem',
  component: CreateCaseDomainItemForm,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['createCaseDomainItem'],
        response: {
          item: caseDomains[0],
        },
      }),
    ],
  },
};

const Template: StoryFn<ComponentType> = (args) => {
  return <CreateCaseDomainItemForm {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {
  availableParentItems: caseDomains.filter((item) => !item.parentId),
};
EmptyStory.parameters = { ...defaultMswParameters };
EmptyStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Empty = prepareStory(EmptyStory);

const FilledStory = Template.bind({});
FilledStory.args = {
  ...EmptyStory.args,
  prefill: CreateCaseDomainItemPrefillSchema.parse({
    parentId: caseDomains[1].id,
    name: 'My new domain',
  }),
};
FilledStory.parameters = { ...defaultMswParameters };
FilledStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Filled = prepareStory(FilledStory);
