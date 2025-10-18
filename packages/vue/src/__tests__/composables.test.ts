/**
 * Vue Composables 测试
 */

import { beforeAll, afterAll, beforeEach, afterEach, describe, it, expect, jest } from 'bun:test';
import { ref, computed, nextTick } from 'vue';
import { createMockAccountInfo, createMockWalletState, createMockManager, flushPromises } from './setup';

// Mock the wallet context
const mockContext = {
  manager: ref(null),
  state: computed(() => createMockWalletState()),
  currentWallet: computed(() => ({ id: 'test-wallet', name: 'Test Wallet', icon: 'test-icon' })),
  availableWallets: ref([]),
  isConnected: computed(() => true),
  isConnecting: computed(() => false),
  isModalOpen: ref(false),
  theme: computed(() => 'light' as const),
  connect: jest.fn(),
  disconnect: jest.fn(),
  switchWallet: jest.fn(),
  openModal: jest.fn(),
  closeModal: jest.fn(),
  toggleModal: jest.fn(),
  _stateUpdateTrigger: ref(0),
};

// Mock the wallet context module
jest.mock('../walletContext', () => ({
  useWalletContext: jest.fn(() => mockContext),
  createWalletContext: jest.fn(() => mockContext),
  BTCWalletPlugin: {
    install: jest.fn(),
  },
}));

describe('Vue Composables', () => {
  let mockManager: ReturnType<typeof createMockManager>;

  beforeEach(() => {
    mockManager = createMockManager();
    mockContext.manager.value = mockManager as any;
    mockContext.state = computed(() => createMockWalletState());
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Mock Context Setup', () => {
    it('should create mock context correctly', () => {
      expect(mockContext.manager).toBeDefined();
      expect(mockContext.state).toBeDefined();
      expect(mockContext.isConnected).toBeDefined();
      expect(mockContext.connect).toBeDefined();
      expect(mockContext.disconnect).toBeDefined();
    });

    it('should create mock manager with required methods', () => {
      expect(mockManager.connect).toBeDefined();
      expect(mockManager.disconnect).toBeDefined();
      expect(mockManager.getState).toBeDefined();
      expect(mockManager.on).toBeDefined();
      expect(mockManager.off).toBeDefined();
    });

    it('should create mock account info', () => {
      const account = createMockAccountInfo();
      expect(account.address).toBe('tb1qexample1234567890abcdef');
      expect(account.balance?.total).toBe(105000);
    });

    it('should create mock wallet state', () => {
      const state = createMockWalletState();
      expect(state.status).toBe('connected');
      expect(state.accounts).toHaveLength(1);
      expect(state.currentAccount).toBeDefined();
    });
  });

  describe('Context State Management', () => {
    it('should handle state updates correctly', async () => {
      const newState = createMockWalletState({
        status: 'disconnected',
        network: 'mainnet'
      });

      mockContext.state = computed(() => newState);
      await nextTick();

      expect(mockContext.state.value.status).toBe('disconnected');
      expect(mockContext.state.value.network).toBe('mainnet');
    });

    it('should handle connection status changes', async () => {
      // Mock disconnected state
      mockContext.state = computed(() => createMockWalletState({ status: 'disconnected' }));
      await nextTick();
      expect(mockContext.state.value.status).toBe('disconnected');

      // Mock connected state
      mockContext.state = computed(() => createMockWalletState({ status: 'connected' }));
      await nextTick();
      expect(mockContext.state.value.status).toBe('connected');
    });

    it('should handle wallet info updates', async () => {
      const newWallet = { id: 'new-wallet', name: 'New Wallet', icon: 'new-icon' };
      mockContext.currentWallet = computed(() => newWallet);
      await nextTick();

      expect(mockContext.currentWallet.value.id).toBe('new-wallet');
      expect(mockContext.currentWallet.value.name).toBe('New Wallet');
    });
  });

  describe('Context Methods', () => {
    it('should handle connect method calls', async () => {
      const testAccounts = [createMockAccountInfo()];
      mockContext.connect.mockResolvedValue(testAccounts);

      const result = await mockContext.connect('test-wallet');

      expect(mockContext.connect).toHaveBeenCalledWith('test-wallet');
      expect(result).toEqual(testAccounts);
    });

    it('should handle disconnect method calls', async () => {
      mockContext.disconnect.mockResolvedValue(undefined);

      await mockContext.disconnect();

      expect(mockContext.disconnect).toHaveBeenCalled();
    });

    it('should handle switch wallet method calls', async () => {
      const testAccounts = [createMockAccountInfo()];
      mockContext.switchWallet.mockResolvedValue(testAccounts);

      const result = await mockContext.switchWallet('new-wallet');

      expect(mockContext.switchWallet).toHaveBeenCalledWith('new-wallet');
      expect(result).toEqual(testAccounts);
    });

    it('should handle modal operations', () => {
      // Open modal
      mockContext.openModal();
      expect(mockContext.openModal).toHaveBeenCalled();

      // Close modal
      mockContext.closeModal();
      expect(mockContext.closeModal).toHaveBeenCalled();

      // Toggle modal
      mockContext.toggleModal();
      expect(mockContext.toggleModal).toHaveBeenCalled();
    });
  });

  describe('Manager Event System', () => {
    it('should handle event registration', () => {
      const handler = jest.fn();

      mockManager.on('connect', handler);
      expect(mockManager.on).toHaveBeenCalledWith('connect', handler);

      mockManager.off('connect', handler);
      expect(mockManager.off).toHaveBeenCalledWith('connect', handler);
    });

    it('should handle event emission', async () => {
      const handler = jest.fn();
      mockManager.on('connect', handler);

      const testAccounts = [createMockAccountInfo()];
      mockManager._emit('connect', testAccounts);

      await flushPromises();
      expect(handler).toHaveBeenCalledWith(testAccounts);
    });

    it('should handle multiple event handlers', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      mockManager.on('accountChange', handler1);
      mockManager.on('accountChange', handler2);

      const testAccount = createMockAccountInfo();
      mockManager._emit('accountChange', testAccount);

      await flushPromises();
      expect(handler1).toHaveBeenCalledWith(testAccount);
      expect(handler2).toHaveBeenCalledWith(testAccount);
    });
  });

  describe('State Transitions', () => {
    it('should handle network changes', async () => {
      const initialState = createMockWalletState({ network: 'testnet' });
      const changedState = createMockWalletState({ network: 'mainnet' });

      mockContext.state = computed(() => initialState);
      await nextTick();
      expect(mockContext.state.value.network).toBe('testnet');

      mockContext.state = computed(() => changedState);
      await nextTick();
      expect(mockContext.state.value.network).toBe('mainnet');
    });

    it('should handle account changes', async () => {
      const initialAccount = createMockAccountInfo({ address: 'tb1qinitial1234567890abcdef' });
      const newAccount = createMockAccountInfo({ address: 'tb1qnew1234567890abcdef' });

      const initialState = createMockWalletState({ currentAccount: initialAccount });
      const changedState = createMockWalletState({ currentAccount: newAccount });

      mockContext.state = computed(() => initialState);
      await nextTick();
      expect(mockContext.state.value.currentAccount?.address).toBe('tb1qinitial1234567890abcdef');

      mockContext.state = computed(() => changedState);
      await nextTick();
      expect(mockContext.state.value.currentAccount?.address).toBe('tb1qnew1234567890abcdef');
    });

    it('should handle error states', async () => {
      const error = new Error('Connection failed');
      const errorState = createMockWalletState({
        status: 'error',
        error
      });

      mockContext.state = computed(() => errorState);
      await nextTick();

      expect(mockContext.state.value.status).toBe('error');
      expect(mockContext.state.value.error?.message).toBe('Connection failed');
    });
  });

  describe('Balance Management', () => {
    it('should handle balance updates', async () => {
      const accountWithBalance = createMockAccountInfo({
        balance: {
          confirmed: 200000,
          unconfirmed: 15000,
          total: 215000
        }
      });

      const stateWithBalance = createMockWalletState({
        currentAccount: accountWithBalance
      });

      mockContext.state = computed(() => stateWithBalance);
      await nextTick();

      expect(mockContext.state.value.currentAccount?.balance?.confirmed).toBe(200000);
      expect(mockContext.state.value.currentAccount?.balance?.total).toBe(215000);
    });

    it('should handle zero balance', async () => {
      const accountWithZeroBalance = createMockAccountInfo({
        balance: {
          confirmed: 0,
          unconfirmed: 0,
          total: 0
        }
      });

      const stateWithZeroBalance = createMockWalletState({
        currentAccount: accountWithZeroBalance
      });

      mockContext.state = computed(() => stateWithZeroBalance);
      await nextTick();

      expect(mockContext.state.value.currentAccount?.balance?.total).toBe(0);
    });
  });

  describe('Available Wallets', () => {
    it('should handle available wallets list updates', async () => {
      const wallets = [
        { id: 'unisat', name: 'UniSat', icon: 'unisat-icon' },
        { id: 'okx', name: 'OKX', icon: 'okx-icon' }
      ];

      mockContext.availableWallets.value = wallets;
      await nextTick();

      expect(mockContext.availableWallets.value).toHaveLength(2);
      expect(mockContext.availableWallets.value[0].id).toBe('unisat');
    });

    it('should handle empty available wallets', async () => {
      mockContext.availableWallets.value = [];
      await nextTick();

      expect(mockContext.availableWallets.value).toHaveLength(0);
    });
  });
});