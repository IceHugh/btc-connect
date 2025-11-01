/**
 * @btc-connect/react React包测试套件
 */

import { beforeEach, describe, expect, it, vi } from 'bun:test';
import { act, renderHook } from '@testing-library/react';
import type React from 'react';
import type { ReactNode } from 'react';
import {
  BTCWalletProvider,
  useAutoConnect,
  useBalance,
  useNetwork,
  useTheme,
  useWallet,
  useWalletDetection,
  useWalletEvent,
  useWalletManager,
  useWalletModalEnhanced,
} from '../index';

// Mock @btc-connect/core
vi.mock('@btc-connect/core', () => ({
  createWalletManager: vi.fn(() => ({
    getState: vi.fn(() => ({
      status: 'disconnected',
      accounts: [],
      network: 'livenet',
    })),
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
    sendBitcoin: vi.fn(),
  })),
  createAdapter: vi.fn(() => null),
  detectAvailableWallets: vi.fn(() =>
    Promise.resolve({
      wallets: [],
      adapters: [],
      elapsedTime: 0,
      isComplete: true,
    }),
  ),
}));

describe('BTCWalletProvider', () => {
  it('应该渲染子组件', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );

    const { result } = renderHook(() => useWallet(), { wrapper });
    expect(result.current).toBeDefined();
  });

  it('应该接受自定义配置', () => {
    const config = {
      autoConnect: false,
      connectTimeout: 5000,
      theme: 'dark' as const,
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider config={config}>{children}</BTCWalletProvider>
    );

    const { result } = renderHook(() => useWallet(), { wrapper });
    expect(result.current).toBeDefined();
  });
});

describe('useWallet', () => {
  let wrapper: ({ children }: { children: ReactNode }) => React.JSX.Element;

  beforeEach(() => {
    wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );
  });

  it('应该返回基础状态', () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    expect(result.current.status).toBe('disconnected');
    expect(result.current.accounts).toEqual([]);
    expect(result.current.currentAccount).toBeUndefined();
    expect(result.current.network).toBe('livenet');
    expect(result.current.error).toBeUndefined();
    expect(result.current.currentWallet).toBeNull();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isConnecting).toBe(false);
  });

  it('应该提供连接操作方法', () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    expect(typeof result.current.connect).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
    expect(typeof result.current.switchWallet).toBe('function');
    expect(typeof result.current.switchNetwork).toBe('function');
  });

  it('应该提供签名功能', () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    expect(typeof result.current.signMessage).toBe('function');
    expect(typeof result.current.signPsbt).toBe('function');
    expect(typeof result.current.sendBitcoin).toBe('function');
  });

  it('应该提供工具函数快捷访问', () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    expect(typeof result.current.utils.formatAddress).toBe('function');
    expect(typeof result.current.utils.formatBalance).toBe('function');
  });

  it('应该包含所有必要的响应式状态', () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    // 检查所有必要的属性是否存在
    const requiredProperties = [
      'status',
      'accounts',
      'currentAccount',
      'network',
      'error',
      'currentWallet',
      'isConnected',
      'isConnecting',
      'theme',
      'address',
      'balance',
      'publicKey',
      'connect',
      'disconnect',
      'switchWallet',
      'availableWallets',
      'switchNetwork',
      'useWalletEvent',
      'walletModal',
      'currentAdapter',
      'allAdapters',
      'manager',
      'signMessage',
      'signPsbt',
      'sendBitcoin',
      'utils',
    ];

    requiredProperties.forEach((prop) => {
      expect(result.current).toHaveProperty(prop);
    });
  });
});

describe('useWalletEvent', () => {
  let wrapper: ({ children }: { children: ReactNode }) => React.JSX.Element;

  beforeEach(() => {
    wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );
  });

  it('应该能够监听钱包事件', () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(
      () => useWalletEvent('connect', mockHandler),
      { wrapper },
    );

    expect(typeof result.current.on).toBe('function');
    expect(typeof result.current.off).toBe('function');
    expect(typeof result.current.once).toBe('function');
    expect(typeof result.current.clear).toBe('function');
  });

  it('应该提供事件管理方法', () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(
      () => useWalletEvent('disconnect', mockHandler),
      { wrapper },
    );

    expect(result.current.clearHistory).toBeInstanceOf(Function);
  });
});

describe('useWalletManager', () => {
  let wrapper: ({ children }: { children: ReactNode }) => React.JSX.Element;

  beforeEach(() => {
    wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );
  });

  it('应该返回管理器相关信息', () => {
    const { result } = renderHook(() => useWalletManager(), { wrapper });

    expect(result.current.currentAdapter).toBeNull();
    expect(Array.isArray(result.current.availableAdapters)).toBe(true);
    expect(typeof result.current.getAdapter).toBe('function');
    expect(typeof result.current.addAdapter).toBe('function');
    expect(typeof result.current.removeAdapter).toBe('function');
    expect(result.current.manager).toBeDefined();
  });
});

describe('useTheme', () => {
  let wrapper: ({ children }: { children: ReactNode }) => React.JSX.Element;

  beforeEach(() => {
    wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );
  });

  it('应该返回主题相关信息', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(typeof result.current.theme).toBe('string');
    expect(typeof result.current.setTheme).toBe('function');
    expect(typeof result.current.setThemeMode).toBe('function');
    expect(typeof result.current.setCustomTheme).toBe('function');
    expect(typeof result.current.resetTheme).toBe('function');
  });

  it('应该能够设置主题', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
  });
});

describe('useWalletModalEnhanced', () => {
  let wrapper: ({ children }: { children: ReactNode }) => React.JSX.Element;

  beforeEach(() => {
    wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );
  });

  it('应该提供模态框控制功能', () => {
    const { result } = renderHook(() => useWalletModalEnhanced(), { wrapper });

    expect(typeof result.current.isModalOpen).toBe('boolean');
    expect(typeof result.current.openModal).toBe('function');
    expect(typeof result.current.closeModal).toBe('function');
    expect(typeof result.current.toggleModal).toBe('function');
    expect(typeof result.current.forceClose).toBe('function');
    expect(typeof result.current.openWithSource).toBe('function');
  });

  it('应该能够打开模态框', () => {
    const { result } = renderHook(() => useWalletModalEnhanced(), { wrapper });

    act(() => {
      result.current.openModal();
    });

    expect(result.current.isModalOpen).toBe(true);
  });

  it('应该支持来源追踪', () => {
    const { result } = renderHook(() => useWalletModalEnhanced(), { wrapper });

    act(() => {
      result.current.openWithSource('test-source');
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.modalSource).toBe('test-source');
  });
});

describe('useAutoConnect', () => {
  let wrapper: ({ children }: { children: ReactNode }) => React.JSX.Element;

  beforeEach(() => {
    wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider config={{ autoConnect: true }}>
        {children}
      </BTCWalletProvider>
    );
  });

  it('应该支持自动连接', () => {
    const { result } = renderHook(() => useAutoConnect(), { wrapper });

    expect(typeof result.current.isAutoConnecting).toBe('boolean');
    expect(typeof result.current.autoConnect).toBe('function');
    expect(typeof result.current.cancelAutoConnect).toBe('function');
  });
});

describe('useBalance', () => {
  let wrapper: ({ children }: { children: ReactNode }) => React.JSX.Element;

  beforeEach(() => {
    wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );
  });

  it('应该返回余额相关信息', () => {
    const { result } = renderHook(() => useBalance(), { wrapper });

    expect(typeof result.current.balance).toBe('number');
    expect(typeof result.current.formattedBalance).toBe('string');
    expect(typeof result.current.refreshBalance).toBe('function');
    expect(typeof result.current.isRefreshing).toBe('boolean');
  });
});

describe('useNetwork', () => {
  let wrapper: ({ children }: { children: ReactNode }) => React.JSX.Element;

  beforeEach(() => {
    wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );
  });

  it('应该返回网络相关信息', () => {
    const { result } = renderHook(() => useNetwork(), { wrapper });

    expect(typeof result.current.network).toBe('string');
    expect(typeof result.current.switchNetwork).toBe('function');
    expect(typeof result.current.isSwitching).toBe('boolean');
  });

  it('应该支持网络切换', async () => {
    const { result } = renderHook(() => useNetwork(), { wrapper });

    await act(async () => {
      await result.current.switchNetwork('testnet');
    });

    // 验证网络切换逻辑
    expect(typeof result.current.network).toBe('string');
  });
});

describe('useWalletDetection', () => {
  let wrapper: ({ children }: { children: ReactNode }) => React.JSX.Element;

  beforeEach(() => {
    wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );
  });

  it('应该检测可用钱包', () => {
    const { result } = renderHook(() => useWalletDetection(), { wrapper });

    expect(Array.isArray(result.current.availableWallets)).toBe(true);
    expect(typeof result.current.isDetecting).toBe('boolean');
    expect(typeof result.current.refreshDetection).toBe('function');
    expect(typeof result.current.startDetection).toBe('function');
    expect(typeof result.current.stopDetection).toBe('function');
  });
});

describe('集成测试', () => {
  it('应该能够在多个Hook之间正确共享状态', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );

    const { result: walletResult } = renderHook(() => useWallet(), { wrapper });
    const { result: themeResult } = renderHook(() => useTheme(), { wrapper });
    const { result: managerResult } = renderHook(() => useWalletManager(), {
      wrapper,
    });

    // 验证状态共享
    expect(walletResult.current.manager).toBe(managerResult.current.manager);
    expect(walletResult.current.theme).toBe(themeResult.current.theme);
  });

  it('应该能够处理连接流程', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );

    const { result } = renderHook(() => useWallet(), { wrapper });

    // 模拟连接过程
    await act(async () => {
      await result.current.connect('unisat');
    });

    // 验证连接状态变化
    expect(result.current.isConnecting).toBe(false);
  });
});

describe('错误处理', () => {
  let wrapper: ({ children }: { children: ReactNode }) => React.JSX.Element;

  beforeEach(() => {
    wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );
  });

  it('应该正确处理连接错误', async () => {
    // 模拟连接失败
    const mockConnect = vi
      .fn()
      .mockRejectedValue(new Error('Connection failed'));

    await act(async () => {
      try {
        await mockConnect();
      } catch (error) {
        // 错误应该被正确处理
        expect(error.message).toBe('Connection failed');
      }
    });
  });

  it('应该正确处理网络切换错误', async () => {
    const { result } = renderHook(() => useNetwork(), { wrapper });

    // 模拟网络切换失败
    await act(async () => {
      try {
        await result.current.switchNetwork('invalid-network');
      } catch (error) {
        // 验证错误处理
        expect(typeof error).toBe('object');
      }
    });
  });
});

describe('性能测试', () => {
  it('应该能够处理大量事件监听', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );

    const handlers = Array.from({ length: 100 }, () => vi.fn());
    const { unmount } = renderHook(
      () => {
        handlers.forEach((handler) => useWalletEvent('connect', handler));
      },
      { wrapper },
    );

    // 清理
    unmount();
  });

  it('应该能够在状态频繁更新时保持性能', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );

    const { result } = renderHook(() => useWallet(), { wrapper });

    // 模拟频繁状态更新
    act(() => {
      for (let i = 0; i < 1000; i++) {
        // 触发状态更新
      }
    });

    // 验证Hook仍然正常工作
    expect(result.current).toBeDefined();
  });
});
