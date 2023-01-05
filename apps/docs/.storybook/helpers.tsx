import { ArgsTable, Description, PRIMARY_STORY, Primary, Stories, Subtitle, Title } from '@storybook/addon-docs';
import { Meta, StoryFn } from '@storybook/react';

// This helper is required because `react-dsfr` manages global styles that was leaking
// on our other stories like email stories. It's due to importing the `DsfrHead` so there is no
// easy workdaround like moving the decorator elsewhere because it would be still in the Storybook project
export function disableGlobalDsfrStyle(value: boolean): void {
  // Storybook styles are annoted `[data-s]`, the rest should be leaking global style since we use none in our business components
  const styleElements = document.querySelectorAll('head > meta[name="next-head-count"] ~ style:not([data-s])');

  if (value) {
    styleElements.forEach((styleElement) => {
      styleElement.setAttribute('media', 'not all');
    });
  } else {
    styleElements.forEach((styleElement) => {
      styleElement.removeAttribute('media');
    });
  }
}

export interface StoryHelpers<ComponentType> {
  generateMetaDefault: (initialMeta: Meta<ComponentType>) => Meta<ComponentType>;
  prepareStory: (story: StoryFn<ComponentType>, options?: StoryOptions) => StoryFn<ComponentType>;
}

export function StoryHelperFactory<ComponentType>(): StoryHelpers<ComponentType> {
  return {
    generateMetaDefault,
    prepareStory,
  };
}

// IMPORTANT: we wanted to return the whole "meta" object to export, but it seems Storybook
// does static analysis and prevent using a function to define it. So we have to have a static object
// that we patch we some others properties
export function generateMetaDefault<ComponentType>(initialMeta: Meta<ComponentType>): Meta<ComponentType> {
  const meta = initialMeta;

  // All exports that does not start with an uppercase should not be considered as a story
  // It's helpful to export some helpers/fixtures directly from here if needed
  if (!meta.includeStories) {
    meta.includeStories = /^[A-Z]/;
  }

  if (!meta.parameters) {
    meta.parameters = {};
  }

  // Add the necessary to format the documentation
  if (!meta.parameters.docs) {
    meta.parameters.docs = {
      description: {
        // component: 'A description',
        page: () => {
          return (
            <>
              <Title />
              <Subtitle />
              <Description />
              <Primary />
              <ArgsTable story={PRIMARY_STORY} />
              <Stories />
            </>
          );
        },
      },
    };
  }

  return meta;
}

export interface StoryOptions {
  layoutStory?: StoryFn;
  childrenContext?: JSX.Element;
}

export function prepareStory<ComponentType>(story: StoryFn<ComponentType>, options?: StoryOptions): StoryFn<ComponentType> {
  if (!story.parameters) {
    story.parameters = {};
  }

  if (!story.parameters.docs) {
    story.parameters.docs = {};
  }

  story.parameters.docs.source = {
    code: 'TODO: for now there is an issue, Storybook shows the `Template` code and not the compiled one. Waiting for a fix.\n\nRef: https://github.com/storybookjs/storybook/issues/11542#issuecomment-1370838272',
    type: 'code',
  };

  let description = '';
  if (story.parameters.docs.description) {
    description = `${story.parameters.docs.description}\n`;
  }

  if (options?.layoutStory) {
    description += `\nTODO: depending on layout... adjust <button data-sb-kind="Forms/ResetPassword" data-sb-story="Empty">
    Go to "Forms/ResetPassword"
  </button>`;
  }

  if (options?.layoutStory) {
    description += `\nTODO: depending on children... adjust <button data-sb-kind="Forms/ResetPassword" data-sb-story="Empty">
    Go to "Forms/ResetPassword"
  </button>`;
  }

  story.parameters.docs.description = {
    story: description,
  };

  return story;
}
