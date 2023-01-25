module.exports = {
  extends: ['next', 'turbo', 'prettier', 'plugin:storybook/recommended', 'plugin:jsx-a11y/strict'],
  plugins: ['jsx-a11y', 'import'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'interface-name': 'off',
    'no-console': 'off',
    'no-implicit-dependencies': 'off',
    'no-submodule-imports': 'off',
    'no-trailing-spaces': 'error',
    'react/jsx-key': 'off',
    // When hunting dead code it's useful to use the following:
    // ---
    // 'no-unused-vars': 'error',
    // 'import/no-unused-modules': [1, { unusedExports: true }],
  },
  overrides: [
    {
      files: ['*.md', '*.mdx'],
      extends: 'plugin:mdx/recommended',
      parserOptions: {
        // The version needs to be "fixed" due to linting errors otherwise (ref: https://github.com/mdx-js/eslint-mdx/issues/366#issuecomment-1361898854)
        ecmaVersion: 12,
      },
      rules: {
        // Inside .mdx files it always throws this rule when there is a title tag, no matter what, so skipping
        'jsx-a11y/heading-has-content': 'off',
      },
    },
  ],
};
