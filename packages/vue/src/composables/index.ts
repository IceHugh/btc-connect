// 核心 Composables
export { useAccount } from './useAccount';
export { useBalance } from './useBalance';
export { useConnectWallet } from './useConnectWallet';
export { useCore } from './useCore';
export { useNetwork } from './useNetwork';
export { useSignature } from './useSignature';
export { useTransactions } from './useTransactions';
export { useWallet } from './useWallet';

// 上下文管理
export {
  useWalletContext,
  useWalletProvider,
  useWalletSafe,
} from './useWalletContext';

// 功能 Composables
export { useWalletDetection } from './useWalletDetection';
export { useWalletInfo } from './useWalletInfo';
export { useWalletModal } from './useWalletModal';

// 内部使用的 Composables（不对外导出）
// useAutoConnect - 自动连接
// useDebounce, useThrottle, usePerformanceMonitor, useMemoryMonitor, useNetworkDetector - 性能优化功能
// 这些功能保留为内部使用，不再对外导出

export { useTheme, useThemeAdvanced } from './useTheme'; // 主题管理
// 统一 Composables
export { useWalletEvent } from './useWalletEvent'; // 事件监听
export { useWalletManager, useWalletManagerAdvanced } from './useWalletManager'; // 访问当前 adapter
