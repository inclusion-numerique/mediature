import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindMainTitle } from '@mediature/docs/.storybook/testing';
import {
  AsAdmin as PrivateLayoutAsAdminStory,
  AsMainAgentAndAdmin as PrivateLayoutAsMainAgentAndAdminStory,
  AsNewUser as PrivateLayoutAsNewUserStory,
  interfaceSessionQueryFactory,
} from '@mediature/main/src/app/(private)/PrivateLayout.stories';
import { DashboardPage } from '@mediature/main/src/app/(private)/dashboard/DashboardPage';
import { agentOfSample } from '@mediature/main/src/fixtures/ui';

type ComponentType = typeof DashboardPage;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Pages/Dashboard',
  component: DashboardPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <DashboardPage {...args} />;
};

const AsNewUserStory = Template.bind({});
AsNewUserStory.args = {};
AsNewUserStory.parameters = {
  ...interfaceSessionQueryFactory({
    agentOf: [],
    isAdmin: false,
  }),
};
AsNewUserStory.play = async ({ canvasElement }) => {
  await playFindMainTitle(canvasElement, /Bienvenue/i);
};

export const AsNewUser = prepareStory(AsNewUserStory);

const AsNewUserWithLayoutStory = Template.bind({});
AsNewUserWithLayoutStory.args = {};
AsNewUserWithLayoutStory.parameters = {
  layout: 'fullscreen',
  ...AsNewUserStory.parameters,
};
AsNewUserWithLayoutStory.play = async ({ canvasElement }) => {
  await playFindMainTitle(canvasElement, /Bienvenue/i);
};

export const AsNewUserWithLayout = prepareStory(AsNewUserWithLayoutStory, {
  layoutStory: PrivateLayoutAsNewUserStory,
});

const AsAgentAndMoreStory = Template.bind({});
AsAgentAndMoreStory.args = {};
AsAgentAndMoreStory.parameters = {
  ...interfaceSessionQueryFactory({
    agentOf: agentOfSample,
    isAdmin: true,
  }),
};
AsAgentAndMoreStory.play = async ({ canvasElement }) => {
  await playFindMainTitle(canvasElement, /collectivité/i);
};

export const AsAgentAndMore = prepareStory(AsAgentAndMoreStory);

const AsAgentAndMoreWithLayoutStory = Template.bind({});
AsAgentAndMoreWithLayoutStory.args = {};
AsAgentAndMoreWithLayoutStory.parameters = {
  layout: 'fullscreen',
  ...AsAgentAndMoreStory.parameters,
};
AsAgentAndMoreWithLayoutStory.play = async ({ canvasElement }) => {
  await playFindMainTitle(canvasElement, /collectivité/i);
};

export const AsAgentAndMoreWithLayout = prepareStory(AsAgentAndMoreWithLayoutStory, {
  layoutStory: PrivateLayoutAsMainAgentAndAdminStory,
});

const AsAdminStory = Template.bind({});
AsAdminStory.args = {};
AsAdminStory.parameters = {
  ...interfaceSessionQueryFactory({
    agentOf: [],
    isAdmin: true,
  }),
};
AsAdminStory.play = async ({ canvasElement }) => {
  await playFindMainTitle(canvasElement, /administrer/i);
};

export const AsAdmin = prepareStory(AsAdminStory);

const AsAdminWithLayoutStory = Template.bind({});
AsAdminWithLayoutStory.args = {};
AsAdminWithLayoutStory.parameters = {
  layout: 'fullscreen',
  ...AsAdminStory.parameters,
};
AsAdminWithLayoutStory.play = async ({ canvasElement }) => {
  await playFindMainTitle(canvasElement, /administrer/i);
};

export const AsAdminWithLayout = prepareStory(AsAdminWithLayoutStory, {
  layoutStory: PrivateLayoutAsAdminStory,
});
