import { Meta, StoryFn } from '@storybook/react';

import { ComponentProps, StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindMainTitle } from '@mediature/docs/.storybook/testing';
import { AsAdmin as PrivateLayoutAsAdminStory } from '@mediature/main/src/app/(private)/PrivateLayout.stories';
import { AuthorityPage } from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/AuthorityPage';
import { authorities } from '@mediature/main/src/fixtures/authority';
import { AuthoritySchema } from '@mediature/main/src/models/entities/authority';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof AuthorityPage;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Pages/Authority',
  component: AuthorityPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'query',
        path: ['getAuthority'],
        response: {
          authority: AuthoritySchema.parse(authorities[0]),
        },
      }),
    ],
  },
};

const commonComponentProps: ComponentProps<ComponentType> = {
  params: {
    authorityId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
  },
};

const Template: StoryFn<ComponentType> = (args) => {
  return <AuthorityPage {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...commonComponentProps,
};
NormalStory.parameters = {
  ...defaultMswParameters,
};
NormalStory.play = async ({ canvasElement }) => {
  await playFindMainTitle(canvasElement, /voulez/i);
};

export const Normal = prepareStory(NormalStory);

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {
  ...commonComponentProps,
};
WithLayoutStory.parameters = {
  layout: 'fullscreen',
  ...defaultMswParameters,
};
WithLayoutStory.play = async ({ canvasElement }) => {
  await playFindMainTitle(canvasElement, /voulez/i);
};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: PrivateLayoutAsAdminStory,
});
