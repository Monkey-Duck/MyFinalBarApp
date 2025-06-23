// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// This helps Metro resolve issues with different module types (ESM vs CJS)
// which is a common problem with the Firebase JS SDK.
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;