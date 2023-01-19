const { getStoryContext } = require('@storybook/test-runner');
const { injectAxe, checkA11y, configureAxe } = require('axe-playwright');

module.exports = {
  setup() {},
  async preRender(page, context) {
    await Promise.all([
      injectAxe(page),
      // [WORKAROUND] To avoid context leak between stories of the same file, it's needed to wait for the new story to be ready
      // Ref: https://github.com/storybookjs/test-runner/issues/244
      getStoryContext(page, context),
    ]);
  },
  async postRender(page, context) {
    const storyContext = await getStoryContext(page, context);

    // Do not test a11y for stories that disable a11y (or that has the disabling fallback but still a play test function)
    if (storyContext.parameters?.a11y?.disable || storyContext.parameters.testRunner?.disable) {
      return;
    }

    // Apply story-level a11y rules
    await configureAxe(page, {
      rules: storyContext.parameters?.a11y?.config?.rules,
    });

    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      axeOptions: storyContext.parameters?.a11y?.options,
    });
  },
};
