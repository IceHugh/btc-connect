// 导出新的基于 useReducer 的 Provider 和 hooks

// 导出优化的 hooks
export {
  useConnectWallet,
  useNetwork,
  useWallet,
  useWalletConnect,
  useWalletEvent,
  useWalletModal,
} from '../hooks';
export type { WalletContextType } from './provider';
export { BTCWalletProvider, useWalletContext } from './provider';
