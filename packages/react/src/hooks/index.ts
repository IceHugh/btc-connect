// 核心 Hooks
// 保持向后兼容的导出
export {
  useAccount,
  useBalance,
  useConnectWallet,
  useNetwork,
  useRefreshAccountInfo, // 已弃用，功能已集成到 useWallet
  useWallet,
  useWalletEvent,
  useWalletModal,
} from './hooks';
// 功能 Hooks
export { useSignature } from './useSignature';
export { useTheme } from './useTheme';
export { useTransactions } from './useTransactions';
export { useWalletDetection } from './useWalletDetection';
// 新增 Hooks
export { useWalletManager } from './useWalletManager';
export { useWalletModalEnhanced } from './useWalletModalEnhanced';

// useAutoConnect 是内部使用的 Hook，不对外导出
