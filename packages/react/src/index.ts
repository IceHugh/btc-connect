/// <reference types="./types/jsx" />

// 组件
export {
  ConnectButton,
  WalletModal,
} from './components';
// 上下文和提供者
export {
  BTCWalletProvider,
  useConnectWallet,
  useNetwork,
  useWallet,
  useWalletContext,
  useWalletEvent,
} from './context';

// Hooks
export {
  useBalance,
  useRefreshAccountInfo,
  useSignature,
  useTransactions,
  useWalletModal,
} from './hooks';

// 类型定义
export type {
  ConnectionPolicy,
  ConnectionPolicyTask,
  ConnectionPolicyTaskContext,
  ConnectionPolicyTaskResult,
  Network,
  ThemeMode,
  WalletContext,
} from './types';

// 从 core 包重新导出的类型
export type {
  AccountInfo,
  ConnectionStatus,
  WalletEvent,
  WalletInfo,
  WalletManagerConfig,
  WalletState,
} from './types/core';

// 工具函数
export * from './utils';

// 版本信息
export const version = '0.1.4';

// 默认配置
export const defaultConfig = {
  // 钱包配置
  walletOrder: ['unisat', 'okx', 'xverse'],
  featuredWallets: ['unisat', 'okx'],

  // UI 配置
  theme: 'light',
  animation: 'scale' as 'fade' | 'slide' | 'scale',

  // 网络配置
  showTestnet: false,
  showRegtest: false,

  // 样式配置
  size: 'md' as 'sm' | 'md' | 'lg',
  variant: 'select' as 'select' | 'button' | 'compact',
};
