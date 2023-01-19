import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { userSessionContext, visitorSessionContext } from '@mediature/docs/.storybook/auth';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindMain, playFindProgressBar } from '@mediature/docs/.storybook/testing';
import { PublicLayout } from '@mediature/main/src/app/(public)/PublicLayout';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof PublicLayout>();

export default {
  title: 'Layouts/PublicPages',
  component: PublicLayout,
  ...generateMetaDefault({
    parameters: {
      layout: 'fullscreen',
      msw: {
        handlers: [],
      },
    },
  }),
} as Meta<typeof PublicLayout>;

const Template: StoryFn<typeof PublicLayout> = (args) => {
  return <PublicLayout {...args} />;
};

const AsVisitorStory = Template.bind({});
AsVisitorStory.storyName = 'As a visitor';
AsVisitorStory.parameters = {
  nextAuthMock: {
    session: visitorSessionContext,
  },
};
AsVisitorStory.args = {};
AsVisitorStory.play = async ({ canvasElement }) => {
  await playFindMain(canvasElement);
};

export const AsVisitor = prepareStory(AsVisitorStory);
AsVisitor.storyName = 'As a visitor';

const AsUserStory = Template.bind({});
AsUserStory.parameters = {
  nextAuthMock: {
    session: userSessionContext,
  },
};
AsUserStory.args = {};
AsUserStory.play = async ({ canvasElement }) => {
  await playFindMain(canvasElement);
};

export const AsUser = prepareStory(AsUserStory);
AsUser.storyName = 'As a user';

const LoremStory = Template.bind({});
LoremStory.parameters = {
  ...AsVisitorStory.parameters,
};
LoremStory.args = {
  children: (
    <>
      <p style={{ padding: 25 }}>
        Eum perferendis expedita necessitatibus libero et ipsa est. Tempora voluptatibus repudiandae aliquid id laborum repellendus reiciendis labore.
      </p>
      <p style={{ padding: 25 }}>
        Assumenda consectetur veniam. Ut accusantium in numquam. Quasi facilis sint. Quod eum nam dolore voluptas in et consequatur nulla. Quia
        quaerat dicta sit exercitationem in aliquid. Laboriosam tenetur voluptatem consequatur quis laudantium non. Sed id soluta mollitia vel qui
        ipsa beatae.
      </p>
      <p style={{ padding: 25 }}>
        Sequi rem modi. Sunt consectetur quidem assumenda eos. Ut adipisci ut cum dolor aut nemo eum animi. Maiores sed voluptatem deserunt nostrum
        voluptatum et. Et est ab.
      </p>
    </>
  ),
};
LoremStory.play = async ({ canvasElement }) => {
  await playFindMain(canvasElement);
};

export const Lorem = prepareStory(LoremStory);
Lorem.storyName = 'With lorem';

const LoadingStory = Template.bind({});
LoadingStory.parameters = {
  ...AsVisitorStory.parameters,
};
LoadingStory.args = {
  children: (
    <>
      <LoadingArea ariaLabelTarget="contenu" />;
    </>
  ),
};
LoadingStory.play = async ({ canvasElement }) => {
  await playFindProgressBar(canvasElement, /chargement/i);
};

export const Loading = prepareStory(LoadingStory);
Loading.storyName = 'With loader';
