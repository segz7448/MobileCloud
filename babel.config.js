module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@store': './src/store',
          '@theme': './src/theme',
          '@hooks': './src/hooks',
          '@services': './src/services',
          '@utils': './src/utils',
          '@types': './src/types',
          '@navigation': './src/navigation',
          '@config': './src/config',
        },
      },
    ],
    // react-native-reanimated plugin MUST be listed last
    'react-native-reanimated/plugin',
  ],
};
