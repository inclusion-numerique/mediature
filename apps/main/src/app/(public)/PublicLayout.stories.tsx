import { Meta, StoryFn } from '@storybook/react';

import { userSessionContext, visitorSessionContext } from '@mediature/docs/.storybook/auth';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { PublicLayout } from '@mediature/main/src/app/(public)/PublicLayout';

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

export const AsVisitor = prepareStory(AsVisitorStory);
AsVisitor.storyName = 'As a visitor';

const AsUserStory = Template.bind({});
AsUserStory.parameters = {
  nextAuthMock: {
    session: userSessionContext,
  },
};
AsUserStory.args = {};

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

export const Lorem = prepareStory(LoremStory);
Lorem.storyName = 'With lorem';
