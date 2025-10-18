/**
 * 测试环境设置
 */

// Mock global APIs that might not be available in test environment
global.setTimeout = global.setTimeout || setTimeout;
global.clearTimeout = global.clearTimeout || clearTimeout;

// Mock console methods to avoid noise in tests
const originalConsole = global.console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Mock DOM APIs if needed
if (typeof window === 'undefined') {
  (global as any).window = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };

  (global as any).document = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
}

// Set up test utilities
export const createMockAccountInfo = (overrides = {}) => ({
  address: 'tb1qexample1234567890abcdef',
  publicKey: '02abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
  balance: {
    confirmed: 100000,
    unconfirmed: 5000,
    total: 105000,
  },
  network: 'testnet',
  ...overrides,
});

export const createMockWalletState = (overrides = {}) => ({
  status: 'connected' as const,
  accounts: [createMockAccountInfo()],
  currentAccount: createMockAccountInfo(),
  network: 'testnet' as const,
  error: undefined,
  ...overrides,
});

export const createMockAdapter = (id = 'test-wallet') => {
  const state = createMockWalletState();
  const listeners = new Map();

  const adapter = {
    id,
    name: `Test Wallet ${id}`,
    icon: `data:image/svg+xml;base64,mock-icon-${id}`,
    isReady: jest.fn(() => true),
    getState: jest.fn(() => state),
    connect: jest.fn().mockResolvedValue(state.accounts),
    disconnect: jest.fn().mockResolvedValue(undefined),
    getAccounts: jest.fn().mockResolvedValue(state.accounts),
    getCurrentAccount: jest.fn().mockResolvedValue(state.currentAccount),
    getNetwork: jest.fn().mockResolvedValue(state.network),
    switchNetwork: jest.fn().mockResolvedValue(undefined),
    signMessage: jest.fn().mockResolvedValue('mock-signature'),
    signPsbt: jest.fn().mockResolvedValue('mock-signed-psbt'),
    sendBitcoin: jest.fn().mockResolvedValue('mock-txid'),
    getPublicKey: jest.fn().mockResolvedValue('mock-public-key'),
    getBalance: jest.fn().mockResolvedValue(100000),
    on: jest.fn((event, handler) => {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event).push(handler);
    }),
    off: jest.fn((event, handler) => {
      const handlers = listeners.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    }),
    _emit: jest.fn((event, ...args) => {
      const handlers = listeners.get(event);
      if (handlers) {
        handlers.forEach(handler => handler(...args));
      }
    }),
    _setState: jest.fn((newState) => {
      Object.assign(state, newState);
    }),
  };

  return adapter;
};

export const flushPromises = () => new Promise(resolve => setImmediate(resolve));