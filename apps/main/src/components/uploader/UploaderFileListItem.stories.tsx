import List from '@mui/material/List';
import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { useState } from 'react';
import { useInterval } from 'usehooks-ts';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindAlert, playFindProgressBar } from '@mediature/docs/.storybook/testing';
import { UploaderFileListItem } from '@mediature/main/src/components/uploader/UploaderFileListItem';
import { uppyFiles } from '@mediature/main/src/fixtures/attachment';

type ComponentType = typeof UploaderFileListItem;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/UploaderFileListItem',
  component: UploaderFileListItem,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

async function playFindRemoveButton(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await within(canvasElement).findByRole('button', {
    name: /supprimer/i,
  });
}

const Template: StoryFn<ComponentType> = (args) => {
  return (
    <List>
      <UploaderFileListItem {...args} />
    </List>
  );
};

const CompleteStory = Template.bind({});
CompleteStory.args = {
  file: uppyFiles[0],
  onCancel: () => {},
  onRemove: () => {},
  onRetry: () => {},
};
CompleteStory.parameters = {};
CompleteStory.play = async ({ canvasElement }) => {
  await playFindRemoveButton(canvasElement);
};

export const Complete = prepareStory(CompleteStory);

const UploadingTemplate: StoryFn<ComponentType> = (args) => {
  const [percentage, setPercentage] = useState(2);

  const file = {
    ...uppyFiles[0],
    progress: {
      uploadStarted: 1676453657332,
      uploadComplete: false,
      percentage: percentage, // We do not modified each field of the progress since we base our UI only on the percentage
      bytesUploaded: 0,
      bytesTotal: 16171,
    },
  };

  useInterval(
    function () {
      // Simulate an upload
      let factor = 1;
      const counter = percentage;

      if (counter >= 10 && counter <= 59) {
        const damping = Math.floor(Math.random() * (300 - 25)) + 6;
        factor = Math.max((100 - counter) / damping, 0.5);
      } else if (counter >= 60 && counter < 100) {
        const damping = Math.floor(Math.random() * (50 - 25)) + 3;
        factor = Math.max((100 - counter) / damping, 0.5);
      } else if (counter >= 100) {
        return;
      }

      if (file.progress) {
        const newPercentage = Math.round(counter + factor);

        setPercentage(newPercentage);
      }
    },
    percentage < 100 ? 50 : null
  );

  return <Template {...args} file={file} />;
};

const UploadingStory = UploadingTemplate.bind({});
UploadingStory.args = {
  // We use a specific story template to allow manipulating the state to simulate the upload progress
  // No need to pass `file` here
  onCancel: () => {},
  onRemove: () => {},
  onRetry: () => {},
};
UploadingStory.parameters = {};
UploadingStory.play = async ({ canvasElement }) => {
  await playFindProgressBar(canvasElement, /transmission/i);
  await playFindRemoveButton(canvasElement);
};

export const Uploading = prepareStory(UploadingStory);

const FailedStory = Template.bind({});
FailedStory.args = {
  file: {
    ...uppyFiles[0],
    response: {
      body: {},
      status: 500,
      uploadURL: 'http://localhost:3000/api/upload/e44117d7-ef80-4cd4-bb1a-8378adbf8bb2',
    },
  },
  onCancel: () => {},
  onRemove: () => {},
  onRetry: () => {},
};
FailedStory.parameters = {};
FailedStory.play = async ({ canvasElement }) => {
  await playFindAlert(canvasElement);
};

export const Failed = prepareStory(FailedStory);
