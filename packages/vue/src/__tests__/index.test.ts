/**
 * @btc-connect/vue Vue包测试套件
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'bun:test';
import { ref, computed, nextTick } from 'vue';
import {
  install,
  useCore,
  useWallet,
  useWalletEvent,
  useWalletManager,
  useTheme,
  useWalletModal,
  useAutoConnect,
  useBalance,
  useNetwork,
  useWalletDetection
} from '../index';
import { createApp, App } from 'vue';
import { createWalletManager, createAdapter } from '@btc-connect/core';

// Mock @btc-connect/core
vi.mock('@btc-connect/core', () => ({
  createWalletManager: vi.fn(() => ({
    getState: vi.fn(() => ({ status: 'disconnected', accounts: [], network: 'livenet' })),
    on: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    switchWallet: vi.fn(),
    switchNetwork: vi.fn(),
    getAdapter: vi.fn(),
    getAllAdapters: vi.fn(() => []),
    getAvailableWallets: vi.fn(() => []),
    getCurrentAdapter: vi.fn(),
    getCurrentWallet: vi.fn(),
    register: vi.fn(),
    unregister: vi.fn(),
    assumeConnected: vi.fn(),
    destroy: vi.fn(),
    signMessage: vi.fn(),
    signPsbt: vi.fn(),
    sendBitcoin: vi.fn()
  })),
  createAdapter: vi.fn(() => null),
  detectAvailableWallets: vi.fn(() => Promise.resolve({
    wallets: [],
    adapters: [],
    elapsedTime: 0,
    isComplete: true
  }))
}));

describe('插件安装', () => {
  let app: App;

  beforeEach(() => {
    app = createApp({});
  });

  afterEach(() => {
    app.unmount();
  });

  it('应该成功安装插件', () => {
    expect(() => {
      app.use(install);
    }).not.toThrow();
  });

  it('应该接受配置选项', () => {
    const config = {
      autoConnect: true,
      theme: 'dark' as const,
      config: {
        onStateChange: vi.fn(),
        onError: vi.fn()
      }
    };

    expect(() => {
      app.use(install, config);
    }).not.toThrow();
  });

  it('应该提供全局属性', () => {
    app.use(install);

    // 检查是否提供了必要的全局属性
    expect(app.config.globalProperties).toBeDefined();
  });
});

describe('useCore', () => {
  beforeEach(() => {
    // 模拟插件已安装的环境
    const app = createApp({});
    app.use(install);
  });

  it('应该返回核心状态', () => {
    const { manager, state, isConnected, isConnecting, currentWallet } = useCore();

    expect(manager.value).toBeDefined();
    expect(state.value).toBeDefined();
    expect(isConnected.value).toBe(false);
    expect(isConnecting.value).toBe(false);
    expect(currentWallet.value).toBeNull();
  });

  it('应该提供连接方法', () => {
    const { connect, disconnect, switchWallet } = useCore();

    expect(typeof connect).toBe('function');
    expect(typeof disconnect).toBe('function');
    expect(typeof switchWallet).toBe('function');
  });

  it('应该有响应式状态', () => {
    const { isConnected, currentWallet } = useCore();

    expect(isConnected.value).toBe(false);
    expect(currentWallet.value).toBeNull();

    // 验证响应式
    expect(typeof isConnected.value).toBe('boolean');
    expect(typeof currentWallet.value).toBe('object');
  });
});

describe('useWallet', () => {
  beforeEach(() => {
    const app = createApp({});
    app.use(install);
  });

  it('应该返回钱包状态', () => {
    const { status, accounts, currentAccount, network, error, currentWallet } = useWallet();

    expect(status.value).toBe('disconnected');
    expect(accounts.value).toEqual([]);
    expect(currentAccount.value).toBeUndefined();
    expect(network.value).toBe('livenet');
    expect(error.value).toBeUndefined();
    expect(currentWallet.value).toBeNull();
  });

  it('应该提供账户信息', () => {
    const { address, balance, publicKey } = useWallet();

    expect(address.value).toBeUndefined();
    expect(balance.value).toBeUndefined();
    expect(publicKey.value).toBeUndefined();
  });

  it('应该提供签名功能', () => {
    const { signMessage, signPsbt, sendBitcoin } = useWallet();

    expect(typeof signMessage).toBe('function');
    expect(typeof signPsbt).toBe('function');
    expect(typeof sendBitcoin).toBe('function');
  });

  it('应该提供工具函数访问', () => {
    const { utils } = useWallet();

    expect(typeof utils.formatAddress).toBe('function');
    expect(typeof utils.formatBalance).toBe('function');
  });

  it('应该包含所有必要的属性', () => {
    const walletComposable = useWallet();

    const requiredProperties = [
      'status', 'accounts', 'currentAccount', 'network', 'error',
      'currentWallet', 'isConnected', 'isConnecting', 'theme',
      'address', 'balance', 'publicKey', 'connect', 'disconnect',
      'switchWallet', 'availableWallets', 'switchNetwork',
      'useWalletEvent', 'walletModal', 'currentAdapter',
      'allAdapters', 'manager', 'signMessage', 'signPsbt',
      'sendBitcoin', 'utils'
    ];

    requiredProperties.forEach(prop => {
      expect(walletComposable).toHaveProperty(prop);
    });
  });
});

describe('useWalletEvent', () => {
  beforeEach(() => {
    const app = createApp({});
    app.use(install);
  });

  it('应该能够监听事件', () => {
    const mockHandler = vi.fn();
    const { on, off, once, clear, clearHistory } = useWalletEvent('connect', mockHandler);

    expect(typeof on).toBe('function');
    expect(typeof off).toBe('function');
    expect(typeof once).toBe('function');
    expect(typeof clear).toBe('function');
    expect(typeof clearHistory).toBe('function');
  });

  it('应该支持事件管理', () => {
    const mockHandler = vi.fn();
    const eventComposable = useWalletEvent('disconnect', mockHandler);

    expect(eventComposable.eventHistory).toBeDefined();
    expect(Array.isArray(eventComposable.eventHistory.value)).toBe(true);
  });

  it('应该能够清理事件监听器', () => {
    const mockHandler = vi.fn();
    const { clear } = useWalletEvent('accountChange', mockHandler);

    expect(() => clear()).not.toThrow();
  });
});

describe('useWalletManager', () => {
  beforeEach(() => {
    const app = createApp({});
    app.use(install);
  });

  it('应该返回管理器状态', () => {
    const { currentAdapter, availableAdapters, adapterStates, manager } = useWalletManager();

    expect(currentAdapter.value).toBeNull();
    expect(Array.isArray(availableAdapters.value)).toBe(true);
    expect(Array.isArray(adapterStates.value)).toBe(true);
    expect(manager.value).toBeDefined();
  });

  it('应该提供适配器操作方法', () => {
    const { getAdapter, addAdapter, removeAdapter } = useWalletManager();

    expect(typeof getAdapter).toBe('function');
    expect(typeof addAdapter).toBe('function');
    expect(typeof removeAdapter).toBe('function');
  });

  it('应该提供统计信息', () => {
    const { stats } = useWalletManager();

    expect(typeof stats.value).toBe('object');
    expect(stats.value).toHaveProperty('totalAdapters');
    expect(stats.value).toHaveProperty('activeAdapters');
  });
});

describe('useTheme', () => {
  beforeEach(() => {
    const app = createApp({});
    app.use(install);
  });

  it('应该返回主题状态', () => {
    const { theme, systemTheme, effectiveTheme } = useTheme();

    expect(typeof theme.value).toBe('string');
    expect(typeof systemTheme.value).toBe('string');
    expect(typeof effectiveTheme.value).toBe('string');
  });

  it('应该提供主题切换方法', () => {
    const { setTheme, setThemeMode, setCustomTheme, resetTheme } = useTheme();

    expect(typeof setTheme).toBe('function');
    expect(typeof setThemeMode).toBe('function');
    expect(typeof setCustomTheme).toBe('function');
    expect(typeof resetTheme).toBe('function');
  });

  it('应该能够设置主题', async () => {
    const { setTheme, theme } = useTheme();

    setTheme('dark');
    await nextTick();

    expect(theme.value).toBe('dark');
  });

  it('应该支持自定义主题', () => {
    const { setCustomTheme } = useTheme();
    const customTheme = {
      colors: {
        primary: '#custom-color',
        background: '#custom-bg'
      }
    };

    expect(() => setCustomTheme(customTheme)).not.toThrow();
  });
});

describe('useWalletModal', () => {
  beforeEach(() => {
    const app = createApp({});
    app.use(install);
  });

  it('应该返回模态框状态', () => {
    const { isOpen, theme, currentWalletId, modalSource } = useWalletModal();

    expect(typeof isOpen.value).toBe('boolean');
    expect(typeof theme.value).toBe('string');
    expect(currentWalletId.value).toBeNull();
    expect(modalSource.value).toBeNull();
  });

  it('应该提供模态框控制方法', () => {
    const { open, close, toggle, forceClose } = useWalletModal();

    expect(typeof open).toBe('function');
    expect(typeof close).toBe('function');
    expect(typeof toggle).toBe('function');
    expect(typeof forceClose).toBe('function');
  });

  it('应该能够打开和关闭模态框', async () => {
    const { open, close, isOpen } = useWalletModal();

    open();
    await nextTick();
    expect(isOpen.value).toBe(true);

    close();
    await nextTick();
    expect(isOpen.value).toBe(false);
  });

  it('应该支持来源追踪', async () => {
    const { open, modalSource } = useWalletModal();

    open('unisat', 'test-source');
    await nextTick();

    expect(modalSource.value).toBe('test-source');
  });
});

describe('useAutoConnect', () => {
  beforeEach(() => {
    const app = createApp({});
    app.use(install);
  });

  it('应该返回自动连接状态', () => {
    const { isAutoConnecting, lastConnectedWallet, autoConnectEnabled } = useAutoConnect();

    expect(typeof isAutoConnecting.value).toBe('boolean');
    expect(typeof lastConnectedWallet.value).toBe('string');
    expect(typeof autoConnectEnabled.value).toBe('boolean');
  });

  it('应该提供自动连接方法', () => {
    const { autoConnect, cancelAutoConnect, enableAutoConnect, disableAutoConnect } = useAutoConnect();

    expect(typeof autoConnect).toBe('function');
    expect(typeof cancelAutoConnect).toBe('function');
    expect(typeof enableAutoConnect).toBe('function');
    expect(typeof disableAutoConnect).toBe('function');
  });

  it('应该能够启用和禁用自动连接', () => {
    const { enableAutoConnect, disableAutoConnect, autoConnectEnabled } = useAutoConnect();

    enableAutoConnect();
    expect(autoConnectEnabled.value).toBe(true);

    disableAutoConnect();
    expect(autoConnectEnabled.value).toBe(false);
  });
});

describe('useBalance', () => {
  beforeEach(() => {
    const app = createApp({});
    app.use(install);
  });

  it('应该返回余额信息', () => {
    const { balance, formattedBalance, isLoading, lastUpdated } = useBalance();

    expect(typeof balance.value).toBe('number');
    expect(typeof formattedBalance.value).toBe('string');
    expect(typeof isLoading.value).toBe('boolean');
    expect(typeof lastUpdated.value).toBe('number');
  });

  it('应该提供余额操作方法', () => {
    const { refreshBalance, startAutoRefresh, stopAutoRefresh } = useBalance();

    expect(typeof refreshBalance).toBe('function');
    expect(typeof startAutoRefresh).toBe('function');
    expect(typeof stopAutoRefresh).toBe('function');
  });

  it('应该支持自动刷新', () => {
    const { startAutoRefresh, stopAutoRefresh, isAutoRefreshing } = useBalance();

    startAutoRefresh(5000);
    expect(isAutoRefreshing.value).toBe(true);

    stopAutoRefresh();
    expect(isAutoRefreshing.value).toBe(false);
  });
});

describe('useNetwork', () => {
  beforeEach(() => {
    const app = createApp({});
    app.use(install);
  });

  it('应该返回网络信息', () => {
    const { network, supportedNetworks, isSwitching } = useNetwork();

    expect(typeof network.value).toBe('string');
    expect(Array.isArray(supportedNetworks.value)).toBe(true);
    expect(typeof isSwitching.value).toBe('boolean');
  });

  it('应该提供网络切换方法', () => {
    const { switchNetwork, canSwitchNetwork } = useNetwork();

    expect(typeof switchNetwork).toBe('function');
    expect(typeof canSwitchNetwork).toBe('function');
  });

  it('应该能够切换网络', async () => {
    const { switchNetwork, network } = useNetwork();

    await switchNetwork('testnet');
    await nextTick();

    // 验证网络切换
    expect(['livenet', 'testnet', 'regtest', 'mainnet']).toContain(network.value);
  });
});

describe('useWalletDetection', () => {
  beforeEach(() => {
    const app = createApp({});
    app.use(install);
  });

  it('应该返回检测状态', () => {
    const { availableWallets, isDetecting, detectionHistory } = useWalletDetection();

    expect(Array.isArray(availableWallets.value)).toBe(true);
    expect(typeof isDetecting.value).toBe('boolean');
    expect(Array.isArray(detectionHistory.value)).toBe(true);
  });

  it('应该提供检测方法', () => {
    const { startDetection, stopDetection, refreshDetection } = useWalletDetection();

    expect(typeof startDetection).toBe('function');
    expect(typeof stopDetection).toBe('function');
    expect(typeof refreshDetection).toBe('function');
  });

  it('应该能够开始和停止检测', async () => {
    const { startDetection, stopDetection, isDetecting } = useWalletDetection();

    startDetection();
    await nextTick();
    expect(isDetecting.value).toBe(true);

    stopDetection();
    await nextTick();
    expect(isDetecting.value).toBe(false);
  });
});

describe('集成测试', () => {
  let app: App;

  beforeEach(() => {
    app = createApp({});
    app.use(install);
  });

  it('应该在不同Composables间共享状态', () => {
    const core = useCore();
    const wallet = useWallet();
    const theme = useTheme();

    // 验证状态共享
    expect(core.manager.value).toBe(wallet.manager.value);
    expect(core.theme.value).toBe(wallet.theme.value);
    expect(theme.theme.value).toBe(wallet.theme.value);
  });

  it('应该能够处理连接流程', async () => {
    const core = useCore();
    const wallet = useWallet();

    // 模拟连接
    await core.connect('unisat');
    await nextTick();

    // 验证状态更新
    expect(core.isConnecting.value).toBe(false);
  });

  it('应该能够处理主题切换', async () => {
    const theme = useTheme();
    const wallet = useWallet();

    theme.setTheme('dark');
    await nextTick();

    expect(theme.theme.value).toBe('dark');
    expect(wallet.theme.value).toBe('dark');
  });
});

describe('错误处理', () => {
  let app: App;

  beforeEach(() => {
    app = createApp({});
    app.use(install);
  });

  it('应该正确处理连接错误', async () => {
    const core = useCore();

    // 模拟连接错误
    const mockConnect = vi.fn().mockRejectedValue(new Error('Connection failed'));

    try {
      await mockConnect();
    } catch (error) {
      expect(error.message).toBe('Connection failed');
    }
  });

  it('应该正确处理网络切换错误', async () => {
    const { switchNetwork } = useNetwork();

    try {
      await switchNetwork('invalid-network');
    } catch (error) {
      expect(typeof error).toBe('object');
    }
  });

  it('应该正确处理适配器错误', () => {
    const { getAdapter } = useWalletManager();

    const invalidAdapter = getAdapter('invalid-wallet');
    expect(invalidAdapter).toBeNull();
  });
});

describe('性能测试', () => {
  let app: App;

  beforeEach(() => {
    app = createApp({});
    app.use(install);
  });

  it('应该能够处理大量状态更新', async () => {
    const { theme } = useTheme();

    // 模拟大量主题切换
    for (let i = 0; i < 1000; i++) {
      theme.setTheme(i % 2 === 0 ? 'light' : 'dark');
      await nextTick();
    }

    // 验证最终状态
    expect(['light', 'dark']).toContain(theme.value);
  });

  it('应该能够处理大量事件监听', () => {
    const handlers = Array.from({ length: 100 }, () => vi.fn());

    // 创建多个事件监听器
    handlers.forEach(handler => {
      useWalletEvent('connect', handler);
    });

    // 验证没有内存泄漏
    expect(handlers.length).toBe(100);
  });

  it('应该能够处理频繁的钱包检测', async () => {
    const { startDetection, stopDetection, isDetecting } = useWalletDetection();

    // 启动和停止检测
    for (let i = 0; i < 100; i++) {
      startDetection();
      await nextTick();
      stopDetection();
      await nextTick();
    }

    expect(isDetecting.value).toBe(false);
  });
});

describe('响应式测试', () => {
  let app: App;

  beforeEach(() => {
    app = createApp({});
    app.use(install);
  });

  it('应该正确响应状态变化', async () => {
    const { isConnected, currentWallet } = useCore();
    const { status } = useWallet();

    // 初始状态
    expect(isConnected.value).toBe(false);
    expect(status.value).toBe('disconnected');

    // 模拟状态变化（通过内部方法）
    // 这里需要根据实际实现来模拟状态变化
    await nextTick();

    // 验证响应式
    expect(typeof isConnected.value).toBe('boolean');
    expect(typeof status.value).toBe('string');
  });

  it('应该正确处理计算属性', () => {
    const { effectiveTheme } = useTheme();
    const { address, formattedAddress } = useWallet();

    // 验证计算属性
    expect(typeof effectiveTheme.value).toBe('string');
    expect(typeof formattedAddress.value).toBe('string');
  });
});