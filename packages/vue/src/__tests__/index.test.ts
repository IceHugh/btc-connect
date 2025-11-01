/**
 * @btc-connect/vue Vue包测试套件
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'bun:test';
import { ref, computed, nextTick } from 'vue';
import {
  BTCWalletPlugin,
  formatAddress,
  formatBalance
} from '../index';
import { createApp, App } from 'vue';

describe('插件安装', () => {
  let app: App;

  beforeEach(() => {
    app = createApp({});
  });

  afterEach(() => {
    try {
      app.unmount();
    } catch (error) {
      // 忽略卸载错误
    }
  });

  it('应该成功安装插件', () => {
    expect(() => {
      app.use(BTCWalletPlugin);
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
      app.use(BTCWalletPlugin, config);
    }).not.toThrow();
  });
});

describe('工具函数', () => {
  it('应该能够格式化地址', () => {
    const address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
    const formatted = formatAddress(address);

    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('应该能够格式化余额', () => {
    const satoshis = 100000000; // 1 BTC
    const formatted = formatBalance(satoshis);

    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('BTC');
  });

  it('应该能够处理零余额格式化', () => {
    const satoshis = 0;
    const formatted = formatBalance(satoshis);

    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('0');
  });
});

describe('版本信息', () => {
  it('应该导出版本信息', async () => {
    const { version } = await import('../index');

    expect(typeof version).toBe('string');
    expect(version.length).toBeGreaterThan(0);
  });

  it('应该导出默认配置', async () => {
    const { defaultConfig } = await import('../index');

    expect(typeof defaultConfig).toBe('object');
    expect(defaultConfig).toHaveProperty('walletOrder');
    expect(defaultConfig).toHaveProperty('theme');
  });
});

describe('环境检测', () => {
  it('应该正确检测客户端环境', async () => {
    const { isClient, isServer } = await import('../index');

    expect(typeof isClient).toBe('boolean');
    expect(typeof isServer).toBe('boolean');
  });
});

describe('响应式基础功能', () => {
  it('应该能够创建响应式引用', () => {
    const count = ref(0);

    expect(count.value).toBe(0);
    expect(typeof count.value).toBe('number');
  });

  it('应该能够创建计算属性', () => {
    const count = ref(5);
    const doubled = computed(() => count.value * 2);

    expect(doubled.value).toBe(10);
  });

  it('应该能够等待下一个tick', async () => {
    const count = ref(0);

    count.value = 1;
    await nextTick();

    expect(count.value).toBe(1);
  });
});