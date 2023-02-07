module.exports = (api) => {
  const plugins = [];
  const target = api.caller((caller) => caller.target);

  api.cache.using(() => JSON.stringify({ target }));

  // Enable optimizations only for the `web` bundle
  if (target === 'web') {
    plugins.push([
      'babel-plugin-import',
      {
        libraryName: '@mui/material',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },
      'core',
    ]);
    plugins.push([
      'babel-plugin-import',
      {
        libraryName: '@mui/icons-material',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },
      'icons',
    ]);
    plugins.push([
      'babel-plugin-import',
      {
        libraryName: '@mui/lab',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },
      'lab',
    ]);
  }

  return {
    presets: ['next/babel'],
    plugins: plugins,
  };
};
