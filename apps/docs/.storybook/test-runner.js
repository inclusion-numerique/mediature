const { getStoryContext } = require('@storybook/test-runner');
const { injectAxe, checkA11y, configureAxe } = require('axe-playwright');

module.exports = {
  setup() {},
  async preRender(page, context) {
    await Promise.all([
      page.emulateMedia({ colorScheme: 'light' }), // Reset the light theme for each new test (to not be polluted by previous stories)
      injectAxe(page),
      // ---
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

    // Apply story-level configuration (including rules to exclude according to their selector)
    await configureAxe(page, {
      ...(storyContext.parameters?.a11y?.config || {}),
    });

    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      axeOptions: storyContext.parameters?.a11y?.options,
    });

    console.log('Switching to dark mode');

    // See `preview.jsx` to understand how we force the change of the current theming
    await page.emulateMedia({ colorScheme: 'dark' });

    // Wait 50ms just to be sure all components have updated their colors ("just in case")
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Only test the color rules since the page structure has not changed
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      axeOptions: {
        ...(storyContext.parameters?.a11y?.options || {}),
        // [BUG] When running only the following rules, `color-contrast` on links always fails in dark mode... whereas it does not when all rules are enabled and also when testing with the browser extension `axe DevTools`... commenting since no explanation
        // runOnly: ['color-contrast-enhanced', 'link-in-text-block', 'color-contrast'],
      },
    });
  },
};
