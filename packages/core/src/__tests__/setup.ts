/**
 * 测试环境设置文件
 */

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
};

// Mock browser APIs that are not available in test environment
global.window = {
  ...global.window,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

global.document = {
  ...global.document,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  createElement: vi.fn(() => ({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
    },
  })),
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

global.sessionStorage = sessionStorageMock as any;

// Mock navigator
global.navigator = {
  ...global.navigator,
  userAgent: 'test-user-agent',
};

// Mock Web APIs
global.HTMLElement = {
  prototype: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
} as any;

global.EventTarget = {
  prototype: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  },
} as any;

// Setup and teardown helpers
export const setupTestEnvironment = () => {
  // Reset all mocks before each test
  vi.clearAllMocks();

  // Reset localStorage and sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
};

export const cleanupTestEnvironment = () => {
  // Clean up after each test
  vi.restoreAllMocks();
};

// Common test utilities
export const createMockAdapter = (id: string, name: string) => ({
  id,
  name,
  icon: `${id}-icon.png`,
  isReady: vi.fn(() => true),
  getState: vi.fn(() => ({
    status: 'disconnected',
    accounts: [],
    network: 'livenet',
    error: null,
  })),
  connect: vi.fn().mockResolvedValue([]),
  disconnect: vi.fn().mockResolvedValue(undefined),
  getAccounts: vi.fn().mockResolvedValue([]),
  getCurrentAccount: vi.fn().mockResolvedValue(null),
  getNetwork: vi.fn().mockResolvedValue('livenet'),
  switchNetwork: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  off: vi.fn(),
  signMessage: vi.fn().mockResolvedValue('mock-signature'),
  signPsbt: vi.fn().mockResolvedValue('mock-psbt'),
  sendBitcoin: vi.fn().mockResolvedValue('mock-txid'),
});

export const createMockAccount = (address: string, publicKey?: string) => ({
  address,
  publicKey: publicKey || `public-key-${address}`,
  balance: 1000000, // 0.01 BTC in satoshis
  network: 'livenet' as const,
});

export const waitFor = (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));
