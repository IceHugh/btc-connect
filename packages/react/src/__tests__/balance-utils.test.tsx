import { describe, expect, it } from 'bun:test';
import type { BalanceDetail } from '../types';
import { createBalanceDetail, normalizeBalance } from '../utils';

describe('Balance Utility Functions', () => {
  describe('createBalanceDetail', () => {
    it('should create BalanceDetail from number', () => {
      const balance = createBalanceDetail(1000);

      expect(balance.confirmed).toBe(1000);
      expect(balance.unconfirmed).toBe(0);
      expect(balance.total).toBe(1000);
    });

    it('should create BalanceDetail with zero balance', () => {
      const balance = createBalanceDetail(0);

      expect(balance.confirmed).toBe(0);
      expect(balance.unconfirmed).toBe(0);
      expect(balance.total).toBe(0);
    });

    it('should create BalanceDetail with large numbers', () => {
      const balance = createBalanceDetail(100000000);

      expect(balance.confirmed).toBe(100000000);
      expect(balance.unconfirmed).toBe(0);
      expect(balance.total).toBe(100000000);
    });
  });

  describe('normalizeBalance', () => {
    it('should return undefined for undefined input', () => {
      const result = normalizeBalance(undefined);
      expect(result).toBeUndefined();
    });

    it('should return BalanceDetail unchanged', () => {
      const input: BalanceDetail = {
        confirmed: 500,
        unconfirmed: 200,
        total: 700,
      };

      const result = normalizeBalance(input);
      expect(result).toBe(input);
      expect(result?.total).toBe(700);
    });

    it('should convert number to BalanceDetail', () => {
      const result = normalizeBalance(1500);

      expect(result).toBeDefined();
      expect(result?.confirmed).toBe(1500);
      expect(result?.unconfirmed).toBe(0);
      expect(result?.total).toBe(1500);
    });

    it('should handle zero number input', () => {
      const result = normalizeBalance(0);

      expect(result).toBeDefined();
      expect(result?.confirmed).toBe(0);
      expect(result?.unconfirmed).toBe(0);
      expect(result?.total).toBe(0);
    });
  });

  describe('Balance Calculations', () => {
    it('should correctly calculate total balance', () => {
      const balance = createBalanceDetail(5000);
      expect(balance.total).toBe(balance.confirmed + balance.unconfirmed);
    });

    it('should handle different balance scenarios', () => {
      // 场景1: 只有已确认余额
      const confirmedOnly = createBalanceDetail(1000);
      expect(confirmedOnly.confirmed).toBe(1000);
      expect(confirmedOnly.unconfirmed).toBe(0);
      expect(confirmedOnly.total).toBe(1000);

      // 场景2: 大额余额
      const largeBalance = createBalanceDetail(100000000);
      expect(largeBalance.total).toBe(100000000);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type consistency', () => {
      const balance = createBalanceDetail(1000);

      // TypeScript 应该确保这些属性都是 number 类型
      expect(typeof balance.confirmed).toBe('number');
      expect(typeof balance.unconfirmed).toBe('number');
      expect(typeof balance.total).toBe('number');
    });

    it('should handle BalanceDetail input types correctly', () => {
      const balanceDetail: BalanceDetail = {
        confirmed: 800,
        unconfirmed: 200,
        total: 1000,
      };

      const normalized = normalizeBalance(balanceDetail);

      if (normalized) {
        expect(typeof normalized.confirmed).toBe('number');
        expect(typeof normalized.unconfirmed).toBe('number');
        expect(typeof normalized.total).toBe('number');
      }
    });
  });
});
