const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo
config.watchFolders = [workspaceRoot];

// Resolve node_modules from app and monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Important for pnpm
config.resolver.disableHierarchicalLookup = true;

// Store Metro cache in a predictable place
config.cacheStores = [
  new FileStore({
    root: path.join(projectRoot, 'node_modules', '.cache', 'metro'),
  }),
];

// Avoid watching problematic dirs
config.resolver.blockList = [
  /.*\/\.git\/.*/,
  /.*\/node_modules\/.*\/node_modules\/.*/,
];

module.exports = config;
