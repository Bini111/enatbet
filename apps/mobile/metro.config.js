const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch monorepo root and all packages
config.watchFolders = [monorepoRoot];

// CRITICAL: Disable hierarchical lookup for pnpm compatibility
config.resolver.disableHierarchicalLookup = true;

// Force single React instance from monorepo root
config.resolver.extraNodeModules = {
  react: path.resolve(monorepoRoot, "node_modules/react"),
  "react-native": path.resolve(monorepoRoot, "node_modules/react-native"),
};

// Resolve modules from both project and monorepo (order matters for iOS)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Support .ts/.tsx from workspace packages
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "ts",
  "tsx",
  "mjs",
  "cjs",
];

// Handle workspace packages that export TS directly
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Let Metro resolve workspace packages to TS files
  if (moduleName.startsWith("@enatbet/")) {
    const packagePath = path.resolve(
      monorepoRoot,
      "packages",
      moduleName.split("/")[1]
    );
    
    // Try src/index.ts first (your firebase package structure)
    const indexPath = path.join(packagePath, "src", "index.ts");
    
    return {
      filePath: indexPath,
      type: "sourceFile",
    };
  }
  
  // Default resolver
  return context.resolveRequest(context, moduleName, platform);
};

// SVG transformer setup
const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

config.resolver = {
  ...config.resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
};

module.exports = config;