module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(expo-linear-gradient|expo-modules-core|react-native|@react-native|react-native-svg)/)'
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  // Use default environment from react-native preset to avoid window redefinition
};
