module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@enatbet/shared': '../../packages/shared/src',
            '@enatbet/firebase': '../../packages/firebase/src',
          },
        },
      ],
      'react-native-paper/babel',
      'react-native-reanimated/plugin',
    ],
  };
};
