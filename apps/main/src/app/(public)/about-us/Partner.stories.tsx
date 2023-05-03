import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import anct from '@mediature/main/public/assets/partners/anct.png';
import { Partner } from '@mediature/main/src/app/(public)/about-us/Partner';

type ComponentType = typeof Partner;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/AboutUs/Partner',
  component: Partner,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <Partner {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  link: '',
  image: anct,
  imageAlt: `Rerum iste veritatis`,
  name: `Rerum iste veritatis`,
  description: (
    <>
      Eligendi iusto placeat eos qui laudantium perferendis. Aut ipsam eos. Ea doloremque animi deleniti voluptatibus consequatur quod.
      <br />
      <br />
      Vitae a optio labore veniam non qui. Quo qui suscipit consequatur vel non quidem reprehenderit nemo. Ratione soluta possimus. Delectus rerum et
      voluptatem sunt qui labore quam in architecto. Atque nemo est laborum nulla aperiam nostrum libero qui. Et eum facere sint iure.
      <br />
      <br />
      Beatae reiciendis corporis libero consequuntur. Ipsum totam velit est numquam facilis. Rerum eveniet alias corrupti quisquam. Aliquam vel
      tempore et. Expedita animi harum et soluta magni consequatur impedit perferendis.
    </>
  ),
};
NormalStory.parameters = {};

export const Normal = prepareStory(NormalStory);
