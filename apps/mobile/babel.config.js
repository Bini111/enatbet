module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      // Transform import.meta for Node v20 ESM compatibility
      ['babel-plugin-transform-import-meta', {
        module: 'ES6'
      }]
    ],
  };
};
