import { zodResolver } from '@hookform/resolvers/zod';
import { Meta, StoryFn } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { useForm } from 'react-hook-form';

import { ComponentProps, StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { CloseCaseCard } from '@mediature/main/src/components/CloseCaseCard';
import { cases } from '@mediature/main/src/fixtures/case';
import { UpdateCaseSchema, UpdateCaseSchemaType } from '@mediature/main/src/models/actions/case';

type ComponentType = typeof CloseCaseCard;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/CloseCaseCard',
  component: CloseCaseCard,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

async function playFindExpandingButton(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await within(canvasElement).findByRole('button', {
    name: /conclusion/i,
  });
}

const commonComponentProps: ComponentProps<ComponentType> = {};

const Template: StoryFn<ComponentType> = (args) => {
  const form = useForm<UpdateCaseSchemaType>({
    resolver: zodResolver(UpdateCaseSchema),
    defaultValues: {
      finalConclusion: args.case.finalConclusion,
    },
  });

  return <CloseCaseCard {...args} wrapperForm={form} closeAction={async () => {}} />;
};

const ExpandedStory = Template.bind({});
ExpandedStory.args = {
  case: {
    ...cases[0],
    closedAt: null,
    finalConclusion: null,
  },
};
ExpandedStory.play = async ({ canvasElement }) => {
  const button = await playFindExpandingButton(canvasElement);

  await userEvent.click(button);

  await within(canvasElement).findByRole('textbox');
};

export const Expanded = prepareStory(ExpandedStory);

const CollapsedStory = Template.bind({});
CollapsedStory.args = {
  ...ExpandedStory.args,
};
CollapsedStory.play = async ({ canvasElement }) => {
  await playFindExpandingButton(canvasElement);
};

export const Collapsed = prepareStory(CollapsedStory);

const AlreadyClosedStory = Template.bind({});
AlreadyClosedStory.args = {
  case: {
    ...cases[0],
    closedAt: new Date('December 30, 2022 03:24:00 UTC'),
    finalConclusion: `Minus soluta aut ad omnis nobis illo optio dicta. Sunt nisi cupiditate dolores. Exercitationem sit autem. Autem quaerat corrupti ullam corporis quod velit doloremque numquam.

Consequatur consectetur beatae id. Quas optio facere. Et nisi non alias quibusdam cupiditate enim consequatur. Quo dolor inventore et veritatis quasi unde cumque quis.

Perspiciatis illo quae accusamus consectetur ut beatae nihil harum nesciunt. Velit autem deleniti corporis inventore voluptatem. Nisi aut vel quasi. Perspiciatis ipsa voluptatum unde saepe autem quia rerum amet.`,
  },
};
AlreadyClosedStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findAllByRole('textbox');
};

export const AlreadyClosed = prepareStory(AlreadyClosedStory);
