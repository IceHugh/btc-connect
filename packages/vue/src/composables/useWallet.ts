import type { EventHandler, WalletEvent } from '@btc-connect/core';
import { computed } from 'vue';
import { useWalletContext } from '../walletContext';
import { useTheme } from './useTheme';
import { useWalletEvent } from './useWalletEvent';
import { useWalletManager } from './useWalletManager';

/**
 * 统一钱包状态 Composable - 提供完整的钱包功能访问
 *
 * 这是 Vue 包的核心 Hook，提供对所有钱包功能的统一访问点
 *
 * @example
 * ```vue
 * <script setup>
 * import { useWallet } from '@btc-connect/vue';
 *
 * const {
 *   // === 基础状态 ===
 *   status, accounts, currentAccount, network, error,
 *   currentWallet, isConnected, isConnecting, theme,
 *   address, balance, publicKey,
 *
 *   // === 连接操作 ===
 *   connect, disconnect, switchWallet, availableWallets,
 *
 *   // === 网络管理 ===
 *   switchNetwork,
 *
 *   // === 事件监听功能 ===
 *   useWalletEvent,
 *
 *   // === 模态框控制 ===
 *   walletModal,
 *
 *   // === 钱包管理器功能 ===
 *   currentAdapter, allAdapters, manager,
 *
 *   // === 签名功能 ===
 *   signMessage, signPsbt,
 *
 *   // === 交易功能 ===
 *   sendBitcoin,
 *
 *   // === 工具函数快捷访问 ===
 *   utils
 * } = useWallet();
 *
 * // 使用示例
 * const handleConnect = async (walletId: string) => {
 *   try {
 *     const accounts = await connect(walletId);
 *     console.log('连接成功:', accounts);
 *   } catch (error) {
 *     console.error('连接失败:', error.message);
 *   }
 * };
 *
 * // 监听连接事件
 * useWalletEvent('connect', (accounts) => {
 *   console.log('钱包已连接:', accounts);
 * });
 *
 * // 切换到测试网
 * const switchToTestnet = async () => {
 *   await switchNetwork('testnet');
 * };
 * </script>
 *
 * <template>
 *   <div class="wallet-info">
 *     <p>状态: {{ status }}</p>
 *     <p>地址: {{ address }}</p>
 *     <p>余额: {{ balance?.total }} satoshis</p>
 *     <p>网络: {{ network }}</p>
 *
 *     <button @click="handleConnect('unisat')" :disabled="isConnected">
 *       连接 UniSat
 *     </button>
 *
 *     <button @click="disconnect" :disabled="!isConnected">
 *       断开连接
 *     </button>
 *
 *     <button @click="switchToTestnet" :disabled="!isConnected">
 *       切换到测试网
 *     </button>
 *   </div>
 * </template>
 * ```
 */
export function useWallet() {
  const ctx = useWalletContext();
  const { currentAdapter, availableAdapters, manager } = useWalletManager();
  const { theme } = useTheme();

  // === 基础状态 ===
  const status = computed(() => ctx.state.value.status);
  const accounts = computed(() => ctx.state.value.accounts);
  const currentAccount = computed(() => ctx.state.value.currentAccount);
  const network = computed(() => ctx.state.value.network);
  const error = computed(() => ctx.state.value.error);
  const currentWallet = ctx.currentWallet;
  const isConnected = ctx.isConnected;
  const isConnecting = ctx.isConnecting;

  // === 账户信息 ===
  const address = computed(() => currentAccount.value?.address || null);
  const balance = computed(() => {
    const accBalance = currentAccount.value?.balance;
    const result =
      accBalance && typeof accBalance === 'object' ? accBalance : null;
    return result;
  });
  const publicKey = computed(() => currentAccount.value?.publicKey || null);

  // === 连接操作 ===
  const connect = async (walletId: string) => {
    if (!ctx.manager.value) {
      throw new Error('Manager not available');
    }
    return await ctx.manager.value.connect(walletId);
  };

  const disconnect = async () => {
    if (!ctx.manager.value) {
      return;
    }
    return await ctx.manager.value.disconnect();
  };

  const switchWallet = async (walletId: string) => {
    if (!ctx.manager.value) {
      throw new Error('Manager not available');
    }
    return await ctx.manager.value.switchWallet(walletId);
  };

  const availableWallets = computed(() => {
    if (!ctx.manager.value) {
      return [];
    }
    // 由于 getWallets 方法不存在，我们使用已知的钱包列表
    return ['unisat', 'okx', 'xverse'].map((id) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      icon: `/icons/${id}.png`,
    }));
  });

  // === 网络管理 ===
  const switchNetwork = async (network: string) => {
    if (!ctx.manager.value) {
      throw new Error('Manager not available');
    }
    return await ctx.manager.value.switchNetwork(network as any);
  };

  // === 模态框控制 ===
  const walletModal = {
    isModalOpen: ctx.isModalOpen,
    openModal: ctx.openModal,
    closeModal: ctx.closeModal,
    toggleModal: ctx.toggleModal,
  };

  // === 签名功能 ===
  const signMessage = async (message: string): Promise<string> => {
    const adapter = currentAdapter;
    if (!adapter || typeof adapter.signMessage !== 'function') {
      throw new Error('Message signing not supported');
    }
    return await adapter.signMessage(message);
  };

  const signPsbt = async (psbt: string): Promise<string> => {
    const adapter = currentAdapter;
    if (!adapter || typeof adapter.signPsbt !== 'function') {
      throw new Error('PSBT signing not supported');
    }
    return await adapter.signPsbt(psbt);
  };

  // === 交易功能 ===
  const sendBitcoin = async (
    toAddress: string,
    amount: number,
  ): Promise<string> => {
    const adapter = currentAdapter;
    if (!adapter || typeof adapter.sendBitcoin !== 'function') {
      throw new Error('Bitcoin sending not supported');
    }
    return await adapter.sendBitcoin(toAddress, amount);
  };

  // === 工具函数快捷访问 ===
  const utils = {
    formatAddress: (address: string, options?: any) => {
      if (
        typeof options?.startChars === 'number' &&
        typeof options?.endChars === 'number'
      ) {
        const start = address.slice(0, options.startChars);
        const end = address.slice(-options.endChars);
        const separator = options.separator || '...';
        return `${start}${separator}${end}`;
      }
      return address;
    },
    formatBalance: (satoshis: number, options?: any) => {
      const btc = satoshis / 100000000;
      const precision = options?.precision || 8;
      return `${btc.toFixed(precision)} BTC`;
    },
  };

  // === 事件监听功能 ===
  const wrappedUseWalletEvent = <T extends WalletEvent>(
    event: T,
    handler: EventHandler<T>,
  ) => {
    return useWalletEvent(event, handler);
  };

  return {
    // === 基础状态 ===
    status,
    accounts,
    currentAccount,
    network,
    error,
    currentWallet,
    isConnected,
    isConnecting,
    theme,

    // === 账户信息 ===
    address,
    balance,
    publicKey,

    // === 连接操作 ===
    connect,
    disconnect,
    switchWallet,
    availableWallets,

    // === 网络管理 ===
    switchNetwork,

    // === 事件监听功能 ===
    useWalletEvent: wrappedUseWalletEvent,

    // === 模态框控制 ===
    walletModal,

    // === 钱包管理器功能 ===
    currentAdapter,
    allAdapters: availableAdapters,
    manager,

    // === 签名功能 ===
    signMessage,
    signPsbt,

    // === 交易功能 ===
    sendBitcoin,

    // === 工具函数快捷访问 ===
    utils,
  };
}
