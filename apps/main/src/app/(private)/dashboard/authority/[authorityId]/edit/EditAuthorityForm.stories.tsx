import { generateMock } from '@anatine/zod-mock';
import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindForm } from '@mediature/docs/.storybook/testing';
import {
  EditAuthorityForm,
  EditAuthorityFormContext,
} from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/edit/EditAuthorityForm';
import { Normal as UploaderNormalStory } from '@mediature/main/src/components/uploader/Uploader.stories';
import { uiAttachments } from '@mediature/main/src/fixtures/attachment';
import { UpdateAuthorityPrefillSchema } from '@mediature/main/src/models/actions/authority';
import { AuthoritySchema } from '@mediature/main/src/models/entities/authority';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof EditAuthorityForm;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();
export default {
  title: 'Forms/EditAuthority',
  component: EditAuthorityForm,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['updateAuthority'],
        response: {
          ...generateMock(AuthoritySchema),
          logoAttachmentId: 'd58ac4a3-7672-403c-ad04-112f5927e2be',
        },
      }),
    ],
  },
};

const Template: StoryFn<ComponentType> = (args) => {
  return <EditAuthorityForm {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {
  slug: 'my-bzh',
  logo: null,
};
EmptyStory.parameters = { ...defaultMswParameters };
EmptyStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Empty = prepareStory(EmptyStory, {
  childrenContext: {
    context: EditAuthorityFormContext,
    value: {
      ContextualUploader: UploaderNormalStory,
    },
  },
});

const FilledStory = Template.bind({});
FilledStory.args = {
  slug: 'my-bzh',
  logo: uiAttachments[0],
  prefill: UpdateAuthorityPrefillSchema.parse({
    type: 'REGION',
    name: 'Bretagne',
    logoAttachmentId: uiAttachments[0].id,
  }),
};
FilledStory.parameters = { ...defaultMswParameters };
FilledStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Filled = prepareStory(FilledStory, {
  childrenContext: {
    context: EditAuthorityFormContext,
    value: {
      ContextualUploader: UploaderNormalStory,
    },
  },
});
