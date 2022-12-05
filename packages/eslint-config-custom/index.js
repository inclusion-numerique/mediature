module.exports = {
  extends: ['next', 'turbo', 'prettier', 'plugin:jsx-a11y/strict'],
  plugins: ['jsx-a11y'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'interface-name': 'off',
    'no-console': 'off',
    'no-implicit-dependencies': 'off',
    'no-submodule-imports': 'off',
    'no-trailing-spaces': 'error',
    'react/jsx-key': 'off',
  },
};
