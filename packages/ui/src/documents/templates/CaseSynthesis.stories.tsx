import { Meta, StoryFn } from '@storybook/react';

import { WithDocumentRenderer } from '@mediature/docs/.storybook/document';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindDocumentStructure } from '@mediature/docs/.storybook/testing';
import { casesWrappers } from '@mediature/main/src/fixtures/case';
import { commonDocumentsParameters } from '@mediature/ui/src/documents/storybook-utils';
import { CaseSynthesisDocument } from '@mediature/ui/src/documents/templates/CaseSynthesis';

type ComponentType = typeof CaseSynthesisDocument;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Documents/Templates/CaseSynthesis',
  component: CaseSynthesisDocument,
  ...generateMetaDefault({
    parameters: {
      ...commonDocumentsParameters,
      docs: {
        description: {
          component: 'Document sent to transfer the case to another administration or institution.',
        },
      },
    },
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <CaseSynthesisDocument {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  case: casesWrappers[0].case,
  citizen: casesWrappers[0].citizen,
};
NormalStory.decorators = [WithDocumentRenderer];
NormalStory.play = async ({ canvasElement }) => {
  await playFindDocumentStructure(canvasElement);
};

export const Normal = prepareStory(NormalStory);
