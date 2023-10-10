import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import caseManagement from '@mediature/main/public/assets/features/case_management.svg';
import { Feature } from '@mediature/main/src/app/(public)/features/Feature';

type ComponentType = typeof Feature;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/Features/Feature',
  component: Feature,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <Feature {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  image: caseManagement,
  imageAlt: ``,
  name: `Rerum iste veritatis`,
  description: (
    <>
      <ul>
        <li>Eligendi iusto placeat eos qui laudantium perferendis. Aut ipsam eos. Ea doloremque animi deleniti voluptatibus consequatur quod ;</li>
        <li>Vitae a optio labore veniam non qui. Quo qui suscipit consequatur vel non quidem reprehenderit nemo ;</li>
        <li>Beatae reiciendis corporis libero consequuntur. Ipsum totam velit est numquam facilis.</li>
      </ul>
    </>
  ),
};
NormalStory.parameters = {};

export const Normal = prepareStory(NormalStory);

const ReversedStory = Template.bind({});
ReversedStory.args = {
  ...NormalStory.args,
  reverseItems: true,
};
ReversedStory.parameters = {};

export const Reversed = prepareStory(ReversedStory);
