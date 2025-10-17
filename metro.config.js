const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add watchFolders to ensure expo-router files are watched
config.watchFolders = [path.resolve(__dirname, "node_modules")];

// Fix expo-router/entry-classic resolution
const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "expo-router/entry-classic") {
    const filePath = path.resolve(
      __dirname,
      "node_modules/expo-router/entry-classic.js",
    );
    return {
      filePath,
      type: "sourceFile",
    };
  }

  // Use default resolver for everything else
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
