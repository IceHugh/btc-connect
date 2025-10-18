/**
 * Vue 测试环境设置
 */

import { beforeAll, afterAll, jest } from 'bun:test';

// 全局测试设置
global.setTimeout = global.setTimeout || setTimeout;
global.clearTimeout = global.clearTimeout || clearTimeout;

// Mock console methods for testing
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

// Mock 数据
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

export const createMockManager = () => {
  const state = createMockWalletState();
  const listeners = new Map();

  return {
    config: {},
    register: jest.fn(),
    unregister: jest.fn(),
    getAdapter: jest.fn(),
    getAllAdapters: jest.fn(() => []),
    getAvailableWallets: jest.fn(() => []),
    connect: jest.fn().mockResolvedValue(state.accounts),
    disconnect: jest.fn().mockResolvedValue(undefined),
    switchWallet: jest.fn().mockResolvedValue(state.accounts),
    assumeConnected: jest.fn().mockResolvedValue(state.accounts),
    getState: jest.fn(() => state),
    getCurrentAdapter: jest.fn(() => null),
    getCurrentWallet: jest.fn(() => null),
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
    destroy: jest.fn(),
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
};

// Helper to flush promises
export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));