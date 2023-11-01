import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { CaseStatusChip } from '@mediature/main/src/components/CaseStatusChip';
import { CaseStatusSchema } from '@mediature/main/src/models/entities/case';

type ComponentType = typeof CaseStatusChip;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/CaseStatusChip',
  component: CaseStatusChip,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

async function playFindNumberedChip(canvasElement: HTMLElement, stepNumber: number | '#'): Promise<HTMLElement> {
  return await within(canvasElement).findByText(stepNumber.toString());
}

const Template: StoryFn<ComponentType> = (args) => {
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

const ContactRequesterStory = Template.bind({});
ContactRequesterStory.args = {
  status: CaseStatusSchema.Values.CONTACT_REQUESTER,
};
ContactRequesterStory.play = async ({ canvasElement }) => {
  await playFindNumberedChip(canvasElement, 2);
};

export const ContactRequester = prepareStory(ContactRequesterStory);

const WaitingForRequesterStory = Template.bind({});
WaitingForRequesterStory.args = {
  status: CaseStatusSchema.Values.WAITING_FOR_REQUESTER,
};
WaitingForRequesterStory.play = async ({ canvasElement }) => {
  await playFindNumberedChip(canvasElement, 3);
};

export const WaitingForRequester = prepareStory(WaitingForRequesterStory);

const ContactAdministrationStory = Template.bind({});
ContactAdministrationStory.args = {
  status: CaseStatusSchema.Values.CONTACT_ADMINISTRATION,
};
ContactAdministrationStory.play = async ({ canvasElement }) => {
  await playFindNumberedChip(canvasElement, 4);
};

export const ContactAdministration = prepareStory(ContactAdministrationStory);

const WaitingForAdministrationStory = Template.bind({});
WaitingForAdministrationStory.args = {
  status: CaseStatusSchema.Values.WAITING_FOR_ADMINISTATION,
};
WaitingForAdministrationStory.play = async ({ canvasElement }) => {
  await playFindNumberedChip(canvasElement, 5);
};

export const WaitingForAdministration = prepareStory(WaitingForAdministrationStory);

const AboutToCloseStory = Template.bind({});
AboutToCloseStory.args = {
  status: CaseStatusSchema.Values.ABOUT_TO_CLOSE,
};
AboutToCloseStory.play = async ({ canvasElement }) => {
  await playFindNumberedChip(canvasElement, 6);
};

export const AboutToClose = prepareStory(AboutToCloseStory);

const ClosedStory = Template.bind({});
ClosedStory.args = {
  status: CaseStatusSchema.Values.CLOSED,
};
ClosedStory.play = async ({ canvasElement }) => {
  await playFindNumberedChip(canvasElement, '#');
};

export const Closed = prepareStory(ClosedStory);
