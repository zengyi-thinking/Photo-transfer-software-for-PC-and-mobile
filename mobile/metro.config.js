const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 */
const config = {
  resolver: {
    alias: {
      '@': './src',
      '@/components': './src/components',
      '@/screens': './src/screens',
      '@/services': './src/services',
      '@/utils': './src/utils',
      '@/hooks': './src/hooks',
      '@/store': './src/store',
      '@/types': './src/types',
      '@/constants': './src/constants',
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
