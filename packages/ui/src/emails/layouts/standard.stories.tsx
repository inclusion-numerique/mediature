import { MjmlButton, MjmlText } from '@luma-team/mjml-react';
import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';
import { commonEmailsParameters } from '@mediature/ui/src/emails/storybook-utils';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof StandardLayout>();

export default {
  title: 'Emails/Layouts/Standard',
  component: StandardLayout,
  ...generateMetaDefault({
    parameters: {
      ...commonEmailsParameters,
      docs: {
        description: {
          component: 'Standard email layout that wraps content.',
        },
      },
    },
  }),
} as Meta<typeof StandardLayout>;

const Template: StoryFn<typeof StandardLayout> = (args) => {
  return <StandardLayout {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {};

export const Empty = prepareStory(EmptyStory);

const LoremStory = Template.bind({});
LoremStory.args = {
  children: (
    <StandardLayout title="Quia sunt eum.">
      <MjmlText>
        <h1>Fuga quis qui</h1>
        <p>Labore sint et. Porro non doloremque vel magnam eaque adipisci. Sit sint ducimus magnam sint eaque cum laborum.</p>
        <p>
          Corporis eius voluptatem aut voluptas laborum quo et itaque consequuntur. Modi perspiciatis vel necessitatibus illum et. Tempora ut sit qui.
        </p>
      </MjmlText>
      <MjmlButton>Ratione autem</MjmlButton>
      <MjmlText>
        <p>
          In delectus harum sed harum molestias fugiat fugiat et quae. Ratione atque nobis autem id saepe quia voluptatem ad laborum. Nihil
          reprehenderit aperiam et est. Quia et provident ex quaerat aliquid voluptatem vel.
        </p>
      </MjmlText>
    </StandardLayout>
  ),
};

export const Lorem = prepareStory(LoremStory);
