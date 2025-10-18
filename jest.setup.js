/**
 * Jest Setup Configuration
 * Mock native modules and global APIs for testing
 */

// Mock Expo modules
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        geminiApiKey: 'test-gemini-key',
        bibleApiKey: 'test-bible-key',
      },
    },
  },
}));

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  __esModule: true,
  default: {
    openDatabaseAsync: jest.fn(async () => ({
      execAsync: jest.fn(),
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn(async () => []),
      closeAsync: jest.fn(),
    })),
    NativeDatabase: jest.fn().mockImplementation(() => ({
      execAsync: jest.fn(),
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn(async () => []),
    })),
  },
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
    removeItem: jest.fn(async () => {}),
    clear: jest.fn(async () => {}),
    getAllKeys: jest.fn(async () => []),
    multiGet: jest.fn(async () => []),
    multiSet: jest.fn(async () => {}),
    multiRemove: jest.fn(async () => {}),
  },
}));

// Mock Google Generative AI is handled in individual test files

// Mock global fetch if needed
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set __DEV__ to true for tests
global.__DEV__ = true;
