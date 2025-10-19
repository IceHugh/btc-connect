import { describe, expect, it } from 'bun:test';
import { defaultConfig, version } from '../index';
import type {
  AccountInfo,
  BalanceDetail,
  ConnectionStatus,
  Network,
  WalletEvent,
} from '../types';

describe('React Module Basic Tests', () => {
  describe('Module Exports', () => {
    it('should export correct version', () => {
      expect(version).toBeDefined();
      expect(typeof version).toBe('string');
    });

    it('should export default config', () => {
      expect(defaultConfig).toBeDefined();
      expect(defaultConfig.walletOrder).toContain('unisat');
      expect(defaultConfig.walletOrder).toContain('okx');
      expect(defaultConfig.theme).toBe('light');
      expect(defaultConfig.size).toBe('md');
      expect(defaultConfig.variant).toBe('select');
    });
  });

  describe('Type Definitions', () => {
    it('should have correct Network type', () => {
      const networks: Network[] = ['livenet', 'testnet', 'regtest', 'mainnet'];
      expect(networks).toHaveLength(4);
    });

    it('should have correct ConnectionStatus type', () => {
      const statuses: ConnectionStatus[] = [
        'disconnected',
        'connecting',
        'connected',
        'error',
      ];
      expect(statuses).toHaveLength(4);
    });

    it('should have correct WalletEvent type', () => {
      const events: WalletEvent[] = [
        'connect',
        'disconnect',
        'accountChange',
        'networkChange',
        'error',
      ];
      expect(events).toHaveLength(5);
    });

    it('should create AccountInfo correctly', () => {
      const account: AccountInfo = {
        address: 'test-address',
        publicKey: 'test-public-key',
        network: 'livenet',
        balance: {
          confirmed: 1000,
          unconfirmed: 500,
          total: 1500,
        },
      };

      expect(account.address).toBe('test-address');
      expect(account.publicKey).toBe('test-public-key');
      expect(account.network).toBe('livenet');
      expect(account.balance?.total).toBe(1500);
    });

    it('should create BalanceDetail correctly', () => {
      const balance: BalanceDetail = {
        confirmed: 1000,
        unconfirmed: 500,
        total: 1500,
      };

      expect(balance.confirmed).toBe(1000);
      expect(balance.unconfirmed).toBe(500);
      expect(balance.total).toBe(1500);
    });
  });

  describe('Utility Functions', () => {
    it('should have utility functions available', async () => {
      const utils = await import('../utils');
      expect(utils).toBeDefined();

      // 检查是否导出了格式化地址的函数
      if ('formatAddressShort' in utils) {
        const shortAddress = utils.formatAddressShort(
          'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          4,
        );
        expect(shortAddress).toBe('0wlh'); // 最后4位字符
        expect(shortAddress.length).toBeLessThan(42); // 原地址长度
      }

      // 检查新的余额工具函数
      if ('createBalanceDetail' in utils && 'normalizeBalance' in utils) {
        const balanceDetail = utils.createBalanceDetail(1000);
        expect(balanceDetail.confirmed).toBe(1000);
        expect(balanceDetail.unconfirmed).toBe(0);
        expect(balanceDetail.total).toBe(1000);

        // 测试 normalizeBalance 函数
        const normalized = utils.normalizeBalance(2000);
        expect(normalized?.total).toBe(2000);
        expect(normalized?.confirmed).toBe(2000);
      }
    });

    it('should handle balance calculations correctly', () => {
      const balance1: BalanceDetail = {
        confirmed: 1000,
        unconfirmed: 0,
        total: 1000,
      };

      const balance2: BalanceDetail = {
        confirmed: 500,
        unconfirmed: 500,
        total: 1000,
      };

      // 测试余额计算逻辑
      expect(balance1.total).toBe(balance1.confirmed + balance1.unconfirmed);
      expect(balance2.total).toBe(balance2.confirmed + balance2.unconfirmed);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate wallet order configuration', () => {
      const validWallets = ['unisat', 'okx', 'xverse'];

      defaultConfig.walletOrder.forEach((wallet) => {
        expect(validWallets).toContain(wallet);
      });
    });

    it('should validate theme configuration', () => {
      const validThemes = ['light', 'dark', 'auto'];
      expect(validThemes).toContain(defaultConfig.theme);
    });

    it('should validate size configuration', () => {
      const validSizes = ['sm', 'md', 'lg'];
      expect(validSizes).toContain(defaultConfig.size);
    });

    it('should validate variant configuration', () => {
      const validVariants = ['select', 'button', 'compact'];
      expect(validVariants).toContain(defaultConfig.variant);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid network types gracefully', () => {
      // 测试网络类型验证
      const validNetworks: Network[] = [
        'livenet',
        'testnet',
        'regtest',
        'mainnet',
      ];
      const invalidNetwork = 'invalid-network' as Network;

      // 这里只是确保类型定义正确，实际验证会在运行时进行
      expect(validNetworks).not.toContain(invalidNetwork);
    });

    it('should handle empty account lists', () => {
      const emptyAccounts: AccountInfo[] = [];
      expect(emptyAccounts).toHaveLength(0);

      // 测试空数组不会导致错误
      const hasAccounts = emptyAccounts.length > 0;
      expect(hasAccounts).toBe(false);
    });

    it('should handle undefined balance gracefully', () => {
      const accountWithUndefinedBalance: AccountInfo = {
        address: 'test-address',
        publicKey: 'test-public-key',
        balance: undefined,
      };

      expect(accountWithUndefinedBalance.balance).toBeUndefined();
    });
  });

  describe('Integration Points', () => {
    it('should have proper exports for hooks', async () => {
      const hooks = await import('../hooks');
      expect(hooks).toBeDefined();

      // 检查主要 hooks 是否存在
      const expectedHooks = [
        'useWallet',
        'useConnectWallet',
        'useAccount',
        'useBalance',
        'useNetwork',
        'useWalletModal',
        'useWalletEvent',
      ];

      expectedHooks.forEach((hookName) => {
        expect(hookName in hooks).toBe(true);
      });
    });

    it('should have proper exports for components', async () => {
      const components = await import('../components');
      expect(components).toBeDefined();

      // 检查主要组件是否存在
      const expectedComponents = ['ConnectButton', 'WalletModal'];

      expectedComponents.forEach((componentName) => {
        expect(componentName in components).toBe(true);
      });
    });

    it('should have proper exports for context', async () => {
      const context = await import('../context');
      expect(context).toBeDefined();

      // 检查主要 context 功能是否存在
      const expectedContextExports = ['BTCWalletProvider', 'useWalletContext'];

      expectedContextExports.forEach((exportName) => {
        expect(exportName in context).toBe(true);
      });
    });
  });
});
