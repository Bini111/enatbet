const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolve .cjs files for CommonJS modules
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'cjs',
];

// Fix Firebase and SVG imports
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'js');
config.resolver.assetExts.push('cjs');
config.resolver.sourceExts.push('svg');

// Firebase module resolution
config.resolver.extraNodeModules = {
  '@react-native-firebase/app': require.resolve('@react-native-firebase/app'),
  '@react-native-firebase/firestore': require.resolve('@react-native-firebase/firestore'),
  '@react-native-firebase/auth': require.resolve('@react-native-firebase/auth'),
  '@react-native-firebase/storage': require.resolve('@react-native-firebase/storage'),
  '@react-native-firebase/functions': require.resolve('@react-native-firebase/functions'),
};

module.exports = config;