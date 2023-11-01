import Button from '@mui/material/Button';
import { Meta, StoryFn } from '@storybook/react';
import { screen, userEvent, within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { CaseAssignmentDialog } from '@mediature/main/src/components/CaseAssignmentDialog';
import { useSingletonModal } from '@mediature/main/src/components/modal/useModal';
import { agents } from '@mediature/main/src/fixtures/agent';
import { cases } from '@mediature/main/src/fixtures/case';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof CaseAssignmentDialog;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/CaseAssignmentDialog',
  component: CaseAssignmentDialog,
  excludeStories: ['defaultMswParameters'],
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

export const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['assignCase'],
        response: {
          case: cases[0],
        },
      }),
    ],
  },
};

async function playOpenAndFindElement(canvasElement: HTMLElement): Promise<HTMLElement> {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');

  await userEvent.click(button);

  const dialog = await screen.findByRole('dialog');
  return await within(dialog).findByRole('button', {
    name: /annuler/i,
  });
}

const Template: StoryFn<ComponentType> = (args) => {
  const { showModal } = useSingletonModal();

  const onClick = async () => {
    showModal((modalProps) => {
      return <CaseAssignmentDialog {...modalProps} {...args} />;
    });
  };

  return (
    <Button onClick={onClick} variant="contained">
      Display the assignment dialog
    </Button>
  );
};

const DefaultStory = Template.bind({});
DefaultStory.args = {
  case: cases[0],
  currentAgent: agents[0],
  agents: agents,
};
DefaultStory.parameters = {
  ...defaultMswParameters,
};
DefaultStory.play = async ({ canvasElement }) => {
  await playOpenAndFindElement(canvasElement);
};

export const Default = prepareStory(DefaultStory);
