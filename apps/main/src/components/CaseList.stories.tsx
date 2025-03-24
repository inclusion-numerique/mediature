import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/test';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Default as CaseAssignmentDialogDefaultStory } from '@mediature/main/src/components/CaseAssignmentDialog.stories';
import { CaseList, CaseListContext } from '@mediature/main/src/components/CaseList';
import { cases, casesWrappers } from '@mediature/main/src/fixtures/case';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';
import { ListDisplay } from '@mediature/main/src/utils/display';

type ComponentType = typeof CaseList;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/CaseList',
  component: CaseList,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['assignCase'],
        response: {
          case: cases[0],
        },
      }),
      getTRPCMock({
        type: 'mutation',
        path: ['deleteCase'] as ['deleteCase'],
        response: undefined,
      }),
    ],
  },
};

async function playFindList(parentElement: HTMLElement): Promise<HTMLElement> {
  return await within(parentElement).findByRole('list', {
    name: /liste/i,
  });
}

async function playFindGrid(parentElement: HTMLElement): Promise<HTMLElement> {
  return await within(parentElement).findByRole('grid', {
    name: /liste/i,
  });
}

const Template: StoryFn<ComponentType> = (args) => {
  return <CaseList {...args} />;
};

const GridStory = Template.bind({});
GridStory.args = {
  casesWrappers: casesWrappers,
  display: ListDisplay.GRID,
};
GridStory.parameters = {
  ...defaultMswParameters,
};
GridStory.play = async ({ canvasElement }) => {
  await playFindList(canvasElement);
};

export const Grid = prepareStory(GridStory, {
  childrenContext: {
    context: CaseListContext,
    value: {
      ContextualCaseAssignmentDialog: CaseAssignmentDialogDefaultStory,
    },
  },
});

const GridWithActionsStory = Template.bind({});
GridWithActionsStory.args = {
  ...GridStory.args,
  canTransfer: true,
  canUnassign: true,
  canDelete: true,
};
GridWithActionsStory.parameters = {
  ...defaultMswParameters,
};
GridWithActionsStory.play = async ({ canvasElement }) => {
  await playFindList(canvasElement);
};

export const GridWithActions = prepareStory(GridWithActionsStory, {
  childrenContext: {
    context: CaseListContext,
    value: {
      ContextualCaseAssignmentDialog: CaseAssignmentDialogDefaultStory,
    },
  },
});

const TableStory = Template.bind({});
TableStory.args = {
  casesWrappers: casesWrappers,
  display: ListDisplay.TABLE,
};
TableStory.parameters = {
  ...defaultMswParameters,
};
TableStory.play = async ({ canvasElement }) => {
  await playFindGrid(canvasElement);
};

export const Table = prepareStory(TableStory, {
  childrenContext: {
    context: CaseListContext,
    value: {
      ContextualCaseAssignmentDialog: CaseAssignmentDialogDefaultStory,
    },
  },
});

const TableWithActionsStory = Template.bind({});
TableWithActionsStory.args = {
  ...TableStory.args,
  canTransfer: true,
  canUnassign: true,
  canDelete: true,
};
TableWithActionsStory.parameters = {
  ...defaultMswParameters,
};
TableWithActionsStory.play = async ({ canvasElement }) => {
  await playFindGrid(canvasElement);
};

export const TableWithActions = prepareStory(TableWithActionsStory, {
  childrenContext: {
    context: CaseListContext,
    value: {
      ContextualCaseAssignmentDialog: CaseAssignmentDialogDefaultStory,
    },
  },
});
