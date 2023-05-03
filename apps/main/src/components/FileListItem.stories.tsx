import List from '@mui/material/List';
import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindAlert } from '@mediature/docs/.storybook/testing';
import { FileListItem } from '@mediature/main/src/components/FileListItem';
import { uiAttachments } from '@mediature/main/src/fixtures/attachment';

type ComponentType = typeof FileListItem;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/FileListItem',
  component: FileListItem,
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
      <FileListItem {...args} />
    </List>
  );
};

const NormalStory = Template.bind({});
NormalStory.args = {
  file: uiAttachments[0],
  onRemove: async () => {},
};
NormalStory.parameters = {};
NormalStory.play = async ({ canvasElement }) => {
  await playFindRemoveButton(canvasElement);
};

export const Normal = prepareStory(NormalStory);

const NotViewableFileStory = Template.bind({});
NotViewableFileStory.args = {
  file: { ...uiAttachments[0], contentType: 'application/octet-stream', name: 'sample-1.bin' },
  onRemove: async () => {},
};
NotViewableFileStory.parameters = {};
NotViewableFileStory.play = async ({ canvasElement }) => {
  await playFindRemoveButton(canvasElement);
};

export const NotViewableFile = prepareStory(NotViewableFileStory);

const ReadOnlyModeStory = Template.bind({});
ReadOnlyModeStory.args = {
  file: uiAttachments[0],
  onRemove: async () => {},
  readonly: true,
};
ReadOnlyModeStory.parameters = {};
ReadOnlyModeStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByRole('button', {
    name: /télécharger/i,
  });
};

export const ReadOnlyMode = prepareStory(ReadOnlyModeStory);

const DenseStory = Template.bind({});
DenseStory.args = {
  file: {
    id: uiAttachments[0].id,
    url: uiAttachments[0].url,
    name: uiAttachments[0].name,
  },
  onRemove: async () => {},
};
DenseStory.parameters = {};
DenseStory.play = async ({ canvasElement }) => {
  await playFindRemoveButton(canvasElement);
};

export const Dense = prepareStory(DenseStory);
