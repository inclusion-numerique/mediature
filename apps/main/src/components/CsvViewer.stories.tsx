import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { CsvViewer } from '@mediature/main/src/components/CsvViewer';
import { casesAnalytics } from '@mediature/main/src/fixtures/case';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';
import { caseAnalyticsPrismaToCsv } from '@mediature/main/src/utils/csv';

type ComponentType = typeof CsvViewer;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/CsvViewer',
  component: CsvViewer,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <CsvViewer {...args} />;
};

const CaseAnalyticsExampleStory = Template.bind({});
CaseAnalyticsExampleStory.args = {
  data: caseAnalyticsPrismaToCsv(casesAnalytics),
};
CaseAnalyticsExampleStory.parameters = {};
CaseAnalyticsExampleStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByRole('grid', {
    name: /lignes/i,
  });
};

export const CaseAnalyticsExample = prepareStory(CaseAnalyticsExampleStory);
