module.exports = {
  commonPackages: ['@codegouvfr/react-dsfr', '@mediature/ui', '@mui/x-data-grid', '@mui/x-date-pickers', 'pretty-bytes', 'tss-react'],
  additionalJestPackages: [],
  formatTransformIgnorePatterns(packagesToTranspile, previousPatterns) {
    // Inspired from `next.js/packages/next/src/build/jest/jest.ts`

    const transpiled = (packagesToTranspile ?? []).join('|');

    return [
      // To match Next.js behavior node_modules is not transformed, only `transpiledPackages`
      ...(transpiled
        ? [`/node_modules/(?!.pnpm)(?!(${transpiled})/)`, `/node_modules/.pnpm/(?!(${transpiled.replace(/\//g, '\\+')})@)`]
        : ['/node_modules/']),
      // CSS modules are mocked so they don't need to be transformed
      '^.+\\.module\\.(css|sass|scss)$',

      // Custom config can append to transformIgnorePatterns but not modify it
      // This is to ensure `node_modules` and .module.css/sass/scss are always excluded
      ...(previousPatterns || []),
    ];
  },
};
