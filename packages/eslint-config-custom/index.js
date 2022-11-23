module.exports = {
  extends: ['next', 'turbo', 'prettier'],
  plugins: ['simple-import-sort'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'interface-name': 'off',
    'no-console': 'off',
    'no-implicit-dependencies': 'off',
    'no-submodule-imports': 'off',
    'no-trailing-spaces': 'error',
    'react/jsx-key': 'off',
    // increase the severity of rules so they are auto-fixable
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
  overrides: [
    // override "simple-import-sort" config
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      rules: {
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              // Packages `react` related packages come first.
              ['^react', '^@?\\w'],
              // Internal packages.
              ['^(@|components)(/.*|$)'],
              // Side effect imports.
              ['^\\u0000'],
              // Parent imports. Put `..` last.
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              // Other relative imports. Put same-folder imports and `.` last.
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
              // Style imports.
              ['^.+\\.?(css)$'],
            ],
          },
        ],
      },
    },
  ],
};
