const { getStoryContext } = require('@storybook/test-runner');

module.exports = {
  setup() {},
  async preRender(page, context) {
    // [WORKAROUND] To avoid context leak between stories of the same file, it's needed to wait for the new story to be ready
    // Ref: https://github.com/storybookjs/test-runner/issues/244
    await getStoryContext(page, context);
  },
  async postRender(page, context) {},
};
