module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
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
    ],
    'react-native-reanimated/plugin',
  ],
};
