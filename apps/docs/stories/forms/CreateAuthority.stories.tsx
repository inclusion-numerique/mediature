import { generateMock } from '@anatine/zod-mock';
import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { CreateAuthorityForm } from '@mediature/main/app/(private)/dashboard/authority/create/CreateAuthorityForm';
import { CreateAuthorityPrefillSchema } from '@mediature/main/models/actions/authority';
import { AuthoritySchema } from '@mediature/main/models/entities/authority';
import { getTRPCMock } from '@mediature/main/server/mock/trpc';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof CreateAuthorityForm>();

export default {
  title: 'Forms/CreateAuthority',
  component: CreateAuthorityForm,
  ...generateMetaDefault({
    parameters: {
      msw: {
        handlers: [
          getTRPCMock({
            type: 'mutation',
            path: ['createAuthority'],
            response: {
              ...generateMock(AuthoritySchema),
              attachmentId: 'd58ac4a3-7672-403c-ad04-112f5927e2be',
            },
          }),
        ],
      },
    },
  }),
} as Meta<typeof CreateAuthorityForm>;

const Template: StoryFn<typeof CreateAuthorityForm> = (args) => {
  return <CreateAuthorityForm {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {};

export const Empty = prepareStory(EmptyStory);

const FilledStory = Template.bind({});
FilledStory.args = {
  prefill: CreateAuthorityPrefillSchema.parse({
    type: 'REGION',
    name: 'Bretagne',
    slug: 'my-bzh',
    logoAttachmentId: 'd58ac4a3-7672-403c-ad04-112f5927e2be',
  }),
};

export const Filled = prepareStory(FilledStory);
