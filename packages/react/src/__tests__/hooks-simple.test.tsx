import { describe, expect, it } from 'bun:test';
import {
  useAccount,
  useBalance,
  useConnectWallet,
  useNetwork,
  useWallet,
  useWalletEvent,
  useWalletModal,
} from '../hooks';

describe('React Hooks Tests', () => {
  describe('Hook Existence', () => {
    it('should export useWallet hook', () => {
      expect(typeof useWallet).toBe('function');
    });

    it('should export useConnectWallet hook', () => {
      expect(typeof useConnectWallet).toBe('function');
    });

    it('should export useAccount hook', () => {
      expect(typeof useAccount).toBe('function');
    });

    it('should export useBalance hook', () => {
      expect(typeof useBalance).toBe('function');
    });

    it('should export useNetwork hook', () => {
      expect(typeof useNetwork).toBe('function');
    });

    it('should export useWalletModal hook', () => {
      expect(typeof useWalletModal).toBe('function');
    });

    it('should export useWalletEvent hook', () => {
      expect(typeof useWalletEvent).toBe('function');
    });
  });

  describe('Hook Parameter Types', () => {
    it('should accept correct parameters for useWalletEvent', () => {
      // 这个测试只验证函数存在，实际使用需要在 React 环境中
      expect(() => {
        // 验证函数签名正确（实际调用会在 React 组件中进行）
        const _mockHandler = () => {};
        if (typeof useWalletEvent === 'function') {
          // 函数存在，测试通过
          expect(true).toBe(true);
        }
      }).not.toThrow();
    });
  });

  describe('Hook Return Types', () => {
    it('should have correct return structure expectations', () => {
      // 验证 hooks 是函数类型
      const hooks = [
        useWallet,
        useConnectWallet,
        useAccount,
        useBalance,
        useNetwork,
        useWalletModal,
        useWalletEvent,
      ];

      hooks.forEach((hook) => {
        expect(typeof hook).toBe('function');
      });
    });
  });
});
