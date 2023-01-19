import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { CaseStatusSchema } from '@mediature/main/src/models/entities/case';
import { CaseStatusChip } from '@mediature/ui/src/CaseStatusChip';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof CaseStatusChip>();

export default {
  title: 'Components/CaseStatusChip',
  component: CaseStatusChip,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof CaseStatusChip>;

async function playFindNumberedChip(canvasElement: HTMLElement, stepNumber: number | '#'): Promise<HTMLElement> {
  return await within(canvasElement).findByText(stepNumber.toString());
}

const Template: StoryFn<any> = (args) => {
  return (
    <div>
      <CaseStatusChip {...args} />
    </div>
  );
};

const ToProcessStory = Template.bind({});
ToProcessStory.args = {
  status: CaseStatusSchema.Values.TO_PROCESS,
};
ToProcessStory.play = async ({ canvasElement }) => {
  await playFindNumberedChip(canvasElement, 1);
};

export const ToProcess = prepareStory(ToProcessStory);

const MakeXxxCallStory = Template.bind({});
MakeXxxCallStory.args = {
  status: CaseStatusSchema.Values.MAKE_XXX_CALL,
};
MakeXxxCallStory.play = async ({ canvasElement }) => {
  await playFindNumberedChip(canvasElement, 3);
};

export const MakeXxxCall = prepareStory(MakeXxxCallStory);

const SyncWithCitizenStory = Template.bind({});
SyncWithCitizenStory.args = {
  status: CaseStatusSchema.Values.SYNC_WITH_CITIZEN,
};
SyncWithCitizenStory.play = async ({ canvasElement }) => {
  await playFindNumberedChip(canvasElement, 4);
};

export const SyncWithCitizen = prepareStory(SyncWithCitizenStory);

const SyncWithAdministrationStory = Template.bind({});
SyncWithAdministrationStory.args = {
  status: CaseStatusSchema.Values.SYNC_WITH_ADMINISTATION,
};
SyncWithAdministrationStory.play = async ({ canvasElement }) => {
  await playFindNumberedChip(canvasElement, 5);
};

export const SyncWithAdministration = prepareStory(SyncWithAdministrationStory);

const AboutToCloseStory = Template.bind({});
AboutToCloseStory.args = {
  status: CaseStatusSchema.Values.ABOUT_TO_CLOSE,
};
AboutToCloseStory.play = async ({ canvasElement }) => {
  await playFindNumberedChip(canvasElement, 6);
};

export const AboutToClose = prepareStory(AboutToCloseStory);

const StuckStory = Template.bind({});
StuckStory.args = {
  status: CaseStatusSchema.Values.STUCK,
};
StuckStory.play = async ({ canvasElement }) => {
  await playFindNumberedChip(canvasElement, '#');
};

export const Stuck = prepareStory(StuckStory);
