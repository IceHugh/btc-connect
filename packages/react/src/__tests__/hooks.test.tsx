/**
 * React Hooks 测试
 */

import { renderHook, act } from '@testing-library/react';
import {
  useWallet,
  useConnectWallet,
  useWalletEvent,
  useNetwork,
  useAccount,
  useBalance
} from '../hooks/hooks';
import { createMockManager, createMockWalletState, flushPromises } from './setup';

// Mock the context provider
jest.mock('../context/provider', () => ({
  useWalletContext: jest.fn(),
}));

const { useWalletContext } = require('../context/provider');

describe('useWallet Hook', () => {
  let mockManager: ReturnType<typeof createMockManager>;

  beforeEach(() => {
    mockManager = createMockManager();
    useWalletContext.mockReturnValue({
      state: createMockWalletState(),
      currentWallet: { id: 'test-wallet', name: 'Test Wallet', icon: 'test-icon' },
      manager: mockManager,
      connect: jest.fn(),
      disconnect: jest.fn(),
      switchWallet: jest.fn(),
      availableWallets: [],
      isConnected: true,
      isConnecting: false,
      theme: 'light',
      isModalOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
      toggleModal: jest.fn(),
      refreshAccountInfo: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return wallet state', () => {
    const { result } = renderHook(() => useWallet());

    expect(result.current.status).toBe('connected');
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.address).toBe('tb1qexample1234567890abcdef');
    expect(result.current.balance).toEqual({
      confirmed: 100000,
      unconfirmed: 5000,
      total: 105000,
    });
  });

  it('should return null address when no current account', () => {
    const mockState = createMockWalletState({ currentAccount: undefined });
    useWalletContext.mockReturnValue({
      ...useWalletContext(),
      state: mockState,
    });

    const { result } = renderHook(() => useWallet());

    expect(result.current.address).toBeNull();
  });
});

describe('useConnectWallet Hook', () => {
  beforeEach(() => {
    const mockConnect = jest.fn();
    const mockDisconnect = jest.fn();
    const mockSwitchWallet = jest.fn();

    useWalletContext.mockReturnValue({
      state: createMockWalletState({ status: 'disconnected' }),
      currentWallet: null,
      manager: null,
      connect: mockConnect,
      disconnect: mockDisconnect,
      switchWallet: mockSwitchWallet,
      availableWallets: [],
      isConnected: false,
      isConnecting: false,
      theme: 'light',
      isModalOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
      toggleModal: jest.fn(),
      refreshAccountInfo: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return connect functions', () => {
    const { result } = renderHook(() => useConnectWallet());

    expect(typeof result.current.connect).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
    expect(typeof result.current.switchWallet).toBe('function');
    expect(Array.isArray(result.current.availableWallets)).toBe(true);
  });
});

describe('useWalletEvent Hook', () => {
  let mockManager: ReturnType<typeof createMockManager>;

  beforeEach(() => {
    mockManager = createMockManager();
    useWalletContext.mockReturnValue({
      state: createMockWalletState(),
      currentWallet: null,
      manager: mockManager,
      connect: jest.fn(),
      disconnect: jest.fn(),
      switchWallet: jest.fn(),
      availableWallets: [],
      isConnected: true,
      isConnecting: false,
      theme: 'light',
      isModalOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
      toggleModal: jest.fn(),
      refreshAccountInfo: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register and unregister event listeners', () => {
    const handler = jest.fn();

    const { unmount } = renderHook(() => useWalletEvent('connect', handler));

    expect(mockManager.on).toHaveBeenCalledWith('connect', handler);

    unmount();

    expect(mockManager.off).toHaveBeenCalledWith('connect', handler);
  });

  it('should not register listeners when no manager', () => {
    useWalletContext.mockReturnValue({
      ...useWalletContext(),
      manager: null,
    });

    const handler = jest.fn();

    renderHook(() => useWalletEvent('connect', handler));

    expect(mockManager.on).not.toHaveBeenCalled();
  });
});

describe('useNetwork Hook', () => {
  let mockManager: ReturnType<typeof createMockManager>;

  beforeEach(() => {
    mockManager = createMockManager();
    useWalletContext.mockReturnValue({
      state: createMockWalletState({ network: 'testnet' }),
      currentWallet: null,
      manager: mockManager,
      connect: jest.fn(),
      disconnect: jest.fn(),
      switchWallet: jest.fn(),
      availableWallets: [],
      isConnected: true,
      isConnecting: false,
      theme: 'light',
      isModalOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
      toggleModal: jest.fn(),
      refreshAccountInfo: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return current network', () => {
    const { result } = renderHook(() => useNetwork());

    expect(result.current.network).toBe('testnet');
    expect(typeof result.current.switchNetwork).toBe('function');
  });

  it('should update network when event is fired', async () => {
    const { result } = renderHook(() => useNetwork());

    act(() => {
      mockManager._emit('networkChange', 'mainnet');
    });

    await flushPromises();

    expect(result.current.network).toBe('mainnet');
  });
});

describe('useAccount Hook', () => {
  beforeEach(() => {
    useWalletContext.mockReturnValue({
      state: createMockWalletState(),
      currentWallet: null,
      manager: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      switchWallet: jest.fn(),
      availableWallets: [],
      isConnected: true,
      isConnecting: false,
      theme: 'light',
      isModalOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
      toggleModal: jest.fn(),
      refreshAccountInfo: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return account information', () => {
    const { result } = renderHook(() => useAccount());

    expect(result.current.accounts).toHaveLength(1);
    expect(result.current.currentAccount).toBeDefined();
    expect(result.current.hasAccounts).toBe(true);
  });

  it('should return empty when no accounts', () => {
    useWalletContext.mockReturnValue({
      ...useWalletContext(),
      state: createMockWalletState({ accounts: [] }),
    });

    const { result } = renderHook(() => useAccount());

    expect(result.current.accounts).toHaveLength(0);
    expect(result.current.currentAccount).toBeUndefined();
    expect(result.current.hasAccounts).toBe(false);
  });
});

describe('useBalance Hook', () => {
  beforeEach(() => {
    useWalletContext.mockReturnValue({
      state: createMockWalletState(),
      currentWallet: null,
      manager: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      switchWallet: jest.fn(),
      availableWallets: [],
      isConnected: true,
      isConnecting: false,
      theme: 'light',
      isModalOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
      toggleModal: jest.fn(),
      refreshAccountInfo: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return balance information', () => {
    const { result } = renderHook(() => useBalance());

    expect(result.current.balance).toEqual({
      confirmed: 100000,
      unconfirmed: 5000,
      total: 105000,
    });
    expect(result.current.confirmedBalance).toBe(100000);
    expect(result.current.unconfirmedBalance).toBe(5000);
    expect(result.current.totalBalance).toBe(105000);
  });

  it('should return zero when no balance', () => {
    useWalletContext.mockReturnValue({
      ...useWalletContext(),
      state: createMockWalletState({
        currentAccount: {
          address: 'test-address',
          balance: null,
        },
      }),
    });

    const { result } = renderHook(() => useBalance());

    expect(result.current.balance).toBeNull();
    expect(result.current.confirmedBalance).toBe(0);
    expect(result.current.unconfirmedBalance).toBe(0);
    expect(result.current.totalBalance).toBe(0);
  });
});