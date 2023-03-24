import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { CaseDomainField, CaseDomainFieldContext } from '@mediature/main/src/components/CaseDomainField';
import { Empty as CreateCaseDomainItemFormEmptyStory } from '@mediature/main/src/components/CreateCaseDomainItemForm.stories';
import { Empty as EditCaseDomainItemFormEmptyStory } from '@mediature/main/src/components/EditCaseDomainItemForm.stories';
import { caseDomains } from '@mediature/main/src/fixtures/case';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof CaseDomainField;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/CaseDomainField',
  component: CaseDomainField,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'query',
        path: ['getCaseDomainItems'],
        response: {
          items: caseDomains.reverse(), // Reverse to check UI sorting
        },
      }),
      getTRPCMock({
        type: 'mutation',
        path: ['deleteCaseDomainItem'],
        response: undefined,
      }),
    ],
  },
};

async function playFindCombobox(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await within(canvasElement).findByRole('combobox', {
    name: /domaine/i,
  });
}

const Template: StoryFn<ComponentType> = (args) => {
  return <CaseDomainField {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  onChange: () => {},
};
NormalStory.parameters = {
  ...defaultMswParameters,
};
NormalStory.play = async ({ canvasElement }) => {
  await playFindCombobox(canvasElement);
};

export const Normal = prepareStory(NormalStory, {
  childrenContext: {
    context: CaseDomainFieldContext,
    value: {
      ContextualCreateCaseDomainItemForm: CreateCaseDomainItemFormEmptyStory,
      ContextualEditCaseDomainItemForm: EditCaseDomainItemFormEmptyStory,
    },
  },
});

const EditModeStory = Template.bind({});
EditModeStory.args = {
  onChange: () => {},
  editMode: true,
};
EditModeStory.parameters = {
  ...defaultMswParameters,
};
EditModeStory.play = async ({ canvasElement }) => {
  await playFindCombobox(canvasElement);
};

export const EditMode = prepareStory(EditModeStory, {
  childrenContext: {
    context: CaseDomainFieldContext,
    value: {
      ContextualCreateCaseDomainItemForm: CreateCaseDomainItemFormEmptyStory,
      ContextualEditCaseDomainItemForm: EditCaseDomainItemFormEmptyStory,
    },
  },
});

const LoadingErrorStory = Template.bind({});
LoadingErrorStory.args = {
  onChange: () => {},
};
LoadingErrorStory.parameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'query',
        path: ['getCaseDomainItems'],
        response: new Error('failure') as any,
      }),
    ],
  },
};
LoadingErrorStory.play = async ({ canvasElement }) => {
  await playFindCombobox(canvasElement);
};

export const LoadingError = prepareStory(LoadingErrorStory, {
  childrenContext: {
    context: CaseDomainFieldContext,
    value: {
      ContextualCreateCaseDomainItemForm: CreateCaseDomainItemFormEmptyStory,
      ContextualEditCaseDomainItemForm: EditCaseDomainItemFormEmptyStory,
    },
  },
});
