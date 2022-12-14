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
  prepareStory: <ComponentType, ContextValueType extends MatchingContextValue<PossibleContextValueType>, PossibleContextValueType>(
    story: StoryFn<ComponentType>,
    options?: StoryOptions<ContextValueType, PossibleContextValueType>
  ) => StoryFn<ComponentType>;
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

export type MatchingContextValue<PossibleContextValueType> = {
  [key in keyof PossibleContextValueType]: PossibleContextValueType[key] | StoryFn<PossibleContextValueType[key]>;
};

export interface ChildrenContext<ContextValueType extends MatchingContextValue<PossibleContextValueType>, PossibleContextValueType> {
  context: React.Context<PossibleContextValueType & object>;
  value: ContextValueType;
}

export interface StoryOptions<ContextValueType extends MatchingContextValue<PossibleContextValueType>, PossibleContextValueType> {
  layoutStory?: StoryFn<any>;
  childrenContext?: ChildrenContext<ContextValueType, PossibleContextValueType>;
}

export function prepareStory<ComponentType, ContextValueType extends MatchingContextValue<PossibleContextValueType>, PossibleContextValueType>(
  story: StoryFn<ComponentType>,
  options?: StoryOptions<ContextValueType, PossibleContextValueType>
): StoryFn<ComponentType> {
  if (!story.parameters) {
    story.parameters = {};
  }

  if (!story.decorators) {
    story.decorators = [];
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
    description += `\nThis story uses a mocked parent layout to give you more context. Keep in mind this may differ from the runtime reality.`;

    // It we detect some authentication mocking from the layout, make sure to reuse it (but not as prioritary)
    if (options.layoutStory.parameters?.nextAuthMock) {
      if (!story.parameters.nextAuthMock) {
        story.parameters.nextAuthMock = {};
      }

      story.parameters.nextAuthMock = { ...options.layoutStory.parameters.nextAuthMock, ...story.parameters.nextAuthMock };
    }

    const LayoutStory = options.layoutStory;

    story.decorators.push((Story, context) => {
      return (
        <LayoutStory {...LayoutStory.args}>
          <Story />
        </LayoutStory>
      );
    });
  }

  if (options?.childrenContext) {
    description += `\nThis story uses a possible mocked children components to give you more context. Keep in mind this may differ from the runtime reality.`;

    if (typeof options.childrenContext.value === 'object') {
      // In case a child is a story, reapply its stuff accordingly
      // [IMPORTANT] This is not magic trick since all the stuff from Storybook is not easily reapplied (and setting the children as <iframe> would make complication with styling, paddings... we are good for now with this)
      // Note: "Object.entries" not available despite the Babel having normally the necessary https://storybook.js.org/docs/react/configure/babel#generate-a-babelrc
      for (const key in options.childrenContext.value) {
        const child = options.childrenContext.value[key] as any;

        if (child.decorators || child.args || child.decorators || child.args) {
          const childStory = child as StoryFn<any>;
          const ChildStory = childStory;

          // It we detect some network mocking from the child story, make sure to reuse it
          if (childStory.parameters?.msw) {
            if (!story.parameters.msw) {
              story.parameters.msw = {
                handlers: [],
              };
            }

            story.parameters.msw.handlers = [...childStory.parameters.msw.handlers, ...story.parameters.msw.handlers];
          }

          (options.childrenContext.value[key] as any) = () => {
            return (
              <>
                <ChildStory {...childStory.args} />
              </>
            );
          };
        }
      }
    }

    const ChildrenContext = options.childrenContext.context;

    // It's safe to cast to `PossibleContextValueType` due to type checking in the function signatures
    // I didn't find a better way than casting, despite the type verification above Typescript cannot affirm it will match
    const safeValues = options.childrenContext.value as unknown as PossibleContextValueType & object;

    story.decorators.push((Story, context) => {
      return (
        <ChildrenContext.Provider value={safeValues}>
          <Story />
        </ChildrenContext.Provider>
      );
    });
  }

  story.parameters.docs.description = {
    story: description,
  };

  return story;
}
