import { Text } from '@react-pdf/renderer';
import { Meta, StoryFn } from '@storybook/react';

import { WithDocumentRenderer } from '@mediature/docs/.storybook/document';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindDocumentStructure } from '@mediature/docs/.storybook/testing';
import { StandardLayout, styles } from '@mediature/ui/src/documents/layouts/StandardLayout';
import { commonDocumentsParameters } from '@mediature/ui/src/documents/storybook-utils';

type ComponentType = typeof StandardLayout;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Documents/Layouts/Standard',
  component: StandardLayout,
  ...generateMetaDefault({
    parameters: {
      ...commonDocumentsParameters,
      docs: {
        description: {
          component: 'Standard document layout that wraps content.',
        },
      },
    },
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <StandardLayout {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {
  title: '',
};
EmptyStory.decorators = [WithDocumentRenderer];
EmptyStory.play = async ({ canvasElement }) => {
  await playFindDocumentStructure(canvasElement);
};

export const Empty = prepareStory(EmptyStory);

const LoremStory = Template.bind({});
LoremStory.args = {
  title: 'Cum aut aliquam ullam praesentium',
  children: (
    <>
      <Text style={styles.h1}>Cum aut aliquam ullam praesentium</Text>
      <Text style={styles.p}>
        Sunt vero accusamus sunt sit adipisci eos ut. Dolores neque et sunt. Id dolores qui fugiat corporis eum. Voluptas omnis molestiae modi vel ut
        molestiae. Nesciunt eum dolorem quis. Vitae dignissimos repellat voluptate voluptatibus fugiat placeat eligendi. Qui asperiores praesentium
        ullam atque nisi sed. Soluta quasi eum. Ut iure maiores ipsam numquam aliquid perferendis voluptatem dolores.
      </Text>
      <Text style={styles.p}>
        Ad magni voluptatem architecto maxime ut assumenda et repudiandae. Accusantium ex nostrum eos qui animi aut. Tenetur possimus deserunt et et
        illo et fuga. Ex non vero maiores provident. Neque minus ducimus id. Quia aut nisi cupiditate nulla nihil. Non quis et deserunt est. Vel
        ducimus aut et ut est optio soluta non. Dolor fuga fugit quisquam et. Eum officiis at autem enim suscipit pariatur et voluptatem eaque.
        Voluptas omnis consequatur quia debitis autem voluptas incidunt perferendis asperiores. Est accusantium quo ducimus. Molestias ex sint qui
        eos. Ex perferendis non sequi praesentium. Dolorum ut facere. Sunt ut et possimus consequuntur pariatur.
      </Text>
      <Text style={styles.p}>
        Tenetur delectus iure magnam dicta vel. Sed neque harum nesciunt. Quasi ut maxime exercitationem autem qui qui cum. Asperiores modi iste
        dolore deleniti aliquid veritatis ea iste nihil. Excepturi totam voluptatibus adipisci. Minus aspernatur eos omnis repudiandae omnis. Sit sit
        alias asperiores facere alias nam rerum eius. Optio aperiam repellat cum cupiditate sed cupiditate. Iusto aliquam aperiam quasi odio culpa.
        Nulla perferendis numquam reprehenderit veniam. Veritatis consequuntur voluptatibus laborum sed perspiciatis. Nostrum et mollitia aperiam
        atque quia earum nisi.
      </Text>
      <Text style={styles.p}>
        Aut laboriosam expedita optio amet ipsum. Debitis aut quis. Consequuntur facere natus. Est ratione est et voluptates. Ea libero eos suscipit
        voluptas. Aut in dolores amet et. Magni accusantium sit dignissimos blanditiis eum. Illum minima rerum quisquam. Aut cumque saepe accusantium
        saepe ducimus dolorum et reiciendis. Qui dolorum repellendus sed iste sed hic voluptatem quia architecto. Hic aut eveniet ut dolorem magnam
        tempora et est maiores. Dolore soluta ea debitis autem error aut molestiae. Iusto sed assumenda cupiditate quia voluptatem. Tempora ea nihil
        aliquam asperiores dignissimos eum culpa praesentium ullam. Eaque minima ullam sunt beatae adipisci est qui saepe et. Nam expedita nostrum
        repellat illum totam suscipit. Consequatur eos quia vero molestiae ad natus esse dolorem fugit. Sequi est officia ut id in ipsam occaecati
        quo.
      </Text>
      <Text style={styles.p}>
        Molestiae est ea officia omnis sit voluptas quis. Animi repudiandae architecto itaque voluptatibus possimus sit dolore aut rerum.
        Necessitatibus quo vero exercitationem tempora excepturi odit consequatur tempore amet. Commodi distinctio repellat nostrum. Laborum rerum
        repudiandae aut ut quis nemo nihil qui. Eos nihil alias quo molestiae ut voluptas sint. Illo consequuntur non explicabo possimus. Sequi optio
        eos et incidunt sint nulla eveniet. Dolor saepe quis dolorem nobis debitis quas qui. Laboriosam ratione cum unde omnis ab qui sequi culpa
        quas. Maxime doloremque nemo omnis quas officiis. Distinctio sed dolor perferendis perferendis tempora.
      </Text>
    </>
  ),
};
LoremStory.decorators = [WithDocumentRenderer];
LoremStory.play = async ({ canvasElement }) => {
  await playFindDocumentStructure(canvasElement);
};

export const Lorem = prepareStory(LoremStory);
