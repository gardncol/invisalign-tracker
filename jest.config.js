module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?|@expo-google-fonts|react-navigation|@react-navigation|@unimodules|native-base|victory-native|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@shopify/react-native-skia|date-fns|zustand|drizzle-orm))',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};