module.exports = {
  extends: ['next', 'turbo', 'prettier'],
  plugins: [],
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
