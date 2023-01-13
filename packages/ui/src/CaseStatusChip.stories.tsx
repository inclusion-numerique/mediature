import { Meta, StoryFn } from '@storybook/react';

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

export const ToProcess = prepareStory(ToProcessStory);

const MakeXxxCallStory = Template.bind({});
MakeXxxCallStory.args = {
  status: CaseStatusSchema.Values.MAKE_XXX_CALL,
};

export const MakeXxxCall = prepareStory(MakeXxxCallStory);

const SyncWithCitizenStory = Template.bind({});
SyncWithCitizenStory.args = {
  status: CaseStatusSchema.Values.SYNC_WITH_CITIZEN,
};

export const SyncWithCitizen = prepareStory(SyncWithCitizenStory);

const SyncWithAdministrationStory = Template.bind({});
SyncWithAdministrationStory.args = {
  status: CaseStatusSchema.Values.SYNC_WITH_ADMINISTATION,
};

export const SyncWithAdministration = prepareStory(SyncWithAdministrationStory);

const AboutToCloseStory = Template.bind({});
AboutToCloseStory.args = {
  status: CaseStatusSchema.Values.ABOUT_TO_CLOSE,
};

export const AboutToClose = prepareStory(AboutToCloseStory);

const StuckStory = Template.bind({});
StuckStory.args = {
  status: CaseStatusSchema.Values.STUCK,
};

export const Stuck = prepareStory(StuckStory);
