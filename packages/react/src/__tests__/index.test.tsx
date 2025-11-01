/**
 * @btc-connect/react React包测试套件
 */

// 设置 DOM 环境
import { TextDecoder, TextEncoder } from 'util';
global.TextDecoder = TextDecoder as any;
global.TextEncoder = TextEncoder as any;

// 模拟 DOM 环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window as any;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'bun:test';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  BTCWalletProvider,
  formatAddress,
  formatBalance
} from '../index';

describe('BTCWalletProvider', () => {
  it('应该渲染子组件', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );

    // 测试Provider是否正常渲染，不抛出错误
    expect(() => {
      renderHook(() => ({ test: true }), { wrapper });
    }).not.toThrow();
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

    expect(() => {
      renderHook(() => ({ config }), { wrapper });
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

describe('基础React功能', () => {
  let wrapper: ({ children }: { children: ReactNode }) => React.JSX.Element;

  beforeEach(() => {
    wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );
  });

  it('应该能够使用基本的hook', () => {
    const { result } = renderHook(() => ({ test: true }), { wrapper });

    expect(result.current.test).toBe(true);
  });

  it('应该能够处理异步操作', async () => {
    const { result } = renderHook(
      () => {
        const [loading, setLoading] = React.useState(false);
        return { loading, setLoading };
      },
      { wrapper }
    );

    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.loading).toBe(true);
  });
});

describe('错误处理', () => {
  it('应该能够捕获和处理错误', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <BTCWalletProvider>{children}</BTCWalletProvider>
    );

    expect(() => {
      renderHook(() => {
        throw new Error('Test error');
      }, { wrapper });
    }).toThrow('Test error');
  });
});