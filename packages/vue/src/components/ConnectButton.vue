<template>
  <!-- 已连接状态 - 显示钱包状态 -->
  <WalletStatus
    v-if="isConnected && currentAccount?.address"
    :theme="computedTheme"
    :size="size"
    :show-balance="showBalance"
    :show-address="showAddress"
    :balance-precision="balancePrecision"
    :class="computedClass"
    :style="computedStyle"
    @disconnect="handleDisconnect"
    @error="handleError"
    @address-copied="handleAddressCopied"
    @balance-refreshed="handleBalanceRefreshed"
  />

  <!-- 连接按钮 -->
  <button
    v-else
    :class="computedClasses"
    :style="computedStyle"
    @click="handleConnect"
    :disabled="disabled || isConnecting"
    :aria-label="`${isConnecting ? 'Connecting' : label}`"
    :aria-busy="isConnecting"
  >
    <!-- 加载状态 -->
    <svg
      v-if="isConnecting"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="btc-connect-button-loading"
      aria-hidden="true"
    >
      <title>Connecting</title>
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416" class="animate-spin" />
    </svg>

    <!-- Bitcoin 图标 -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 48 48"
      class="btc-bitcoin-icon"
      aria-hidden="true"
    >
      <title>Bitcoin</title>
      <path fill="none" d="M0 0h48v48H0z" />
      <path
        d="M42 36v2c0 2.21-1.79 4-4 4H10c-2.21 0-4-1.79-4-4V10c0-2.21 1.79-4 4-4h28c2.21 0 4 1.79 4 4v2H24c-2.21 0-4 1.79-4 4v16c0 2.21 1.79 4 4 4h18zm-18-4h20V16H24v16zm8-5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
        fill="currentColor"
      />
    </svg>

    <!-- 按钮文本 -->
    <span class="btc-connect-button-text">
      {{ isConnecting ? 'Connecting...' : label }}
    </span>
  </button>

  <!-- 集成的钱包模态框 -->
  <Teleport to="body" v-if="isClient">
    <WalletModal
      :is-open="modalIsOpen"
      :theme="computedTheme"
      :wallets="availableWallets"
      @connect="handleWalletConnect"
      @close="handleModalClose"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import type { ConnectButtonProps } from '../types';
import { useWallet } from '../composables/useWallet';
import { useWalletModal } from '../composables/useWalletModal';
import { useCore } from '../composables/useCore';
import { useConfig } from '../config';
import { isClient } from '../index';
import WalletStatus from './WalletStatus.vue';
import WalletModal from './WalletModal.vue';

// Props
const props = withDefaults(defineProps<ConnectButtonProps>(), {
  size: 'md',
  variant: 'select',
  label: 'Connect Wallet',
  disabled: false,
  theme: undefined, // 将从配置中获取
  showBalance: true,
  showAddress: true,
  balancePrecision: 8,
  class: '',
  style: () => ({}),
});

// Emits
const emit = defineEmits<{
  connect: [walletId: string];
  disconnect: [];
  error: [error: Error];
  addressCopied: [address: string];
  balanceRefreshed: [];
}>();

// Composables
const { isConnected, isConnecting, currentWallet, connect, disconnect, availableWallets } = useCore();
const { currentAccount } = useWallet();
const { isOpen: modalIsOpen, open: openModal, close: closeModal } = useWalletModal('ConnectButton');
const config = useConfig();

// Computed
const computedTheme = computed(() => {
  return props.theme || config.getThemeConfig().mode;
});

const computedClass = computed(() => {
  const classes = [
    'btc-connect-button',
    `btc-connect-button--${props.size}`,
    `btc-connect-button--${props.variant}`,
    `btc-connect-button--${computedTheme.value}`,
  ];

  if (props.disabled) {
    classes.push('btc-connect-button--disabled');
  }

  if (isConnecting.value) {
    classes.push('btc-connect-button--loading');
  }

  if (props.class) {
    classes.push(props.class);
  }

  return classes.join(' ');
});

const computedClasses = computed(() => {
  const classes = [
    'btc-connect-button',
    `btc-connect-button--${props.size}`,
    `btc-connect-button--${props.variant}`,
    `btc-connect-button--${computedTheme.value}`,
  ];

  if (props.disabled) {
    classes.push('btc-connect-button--disabled');
  }

  if (isConnecting.value) {
    classes.push('btc-connect-button--loading');
  }

  if (props.class) {
    classes.push(props.class);
  }

  return classes.join(' ');
});

const computedStyle = computed(() => {
  const styles: Record<string, any> = {};

  // 处理样式对象
  if (props.style && typeof props.style === 'object' && !Array.isArray(props.style)) {
    Object.assign(styles, props.style);
  }

  // 根据尺寸调整样式
  if (props.size === 'sm') {
    styles.minHeight = '32px';
    styles.padding = '4px 12px';
    styles.fontSize = '12px';
    styles.gap = '6px';
  } else if (props.size === 'lg') {
    styles.minHeight = '48px';
    styles.padding = '12px 24px';
    styles.fontSize = '16px';
    styles.gap = '10px';
  }

  // 根据变体调整样式
  if (props.variant === 'compact') {
    styles.gap = '4px';
    styles.padding = styles.padding || '6px 12px';
  } else if (props.variant === 'select') {
    styles.minWidth = '160px';
  }

  return styles;
});

// Methods
const handleConnect = () => {
  if (props.disabled || isConnecting.value) return;

  try {
    openModal();
    emit('connect', 'modal_opened');
  } catch (error) {
    console.error('Failed to open wallet modal:', error);
    emit('error', error instanceof Error ? error : new Error('Failed to open wallet modal'));
  }
};

const handleWalletConnect = async (walletId: string) => {
  try {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`🔗 [ConnectButton] Connecting to wallet: ${walletId}`);
    }

    // 调用核心连接方法
    const accounts = await connect(walletId);

    // 关闭模态框
    closeModal();

    emit('connect', walletId);

    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`✅ [ConnectButton] Successfully connected to ${walletId}:`, accounts);
    }
  } catch (error) {
    console.error(`❌ [ConnectButton] Failed to connect to ${walletId}:`, error);
    emit('error', error instanceof Error ? error : new Error(`Failed to connect to ${walletId}`));
  }
};

const handleModalClose = () => {
  closeModal();

  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔒 [ConnectButton] Modal closed by user');
  }
};

const handleDisconnect = async () => {
  try {
    await disconnect();
    emit('disconnect');
  } catch (error) {
    console.error('Failed to disconnect wallet:', error);
    emit('error', error instanceof Error ? error : new Error('Failed to disconnect wallet'));
  }
};

const handleError = (error: Error) => {
  emit('error', error);
};

const handleAddressCopied = (address: string) => {
  emit('addressCopied', address);
};

const handleBalanceRefreshed = () => {
  emit('balanceRefreshed');
};

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled || isConnecting.value) return;

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleConnect();
  }
};

// Lifecycle
onMounted(() => {
  injectStyles();
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// 样式注入
const injectStyles = () => {
  if (typeof document === 'undefined') return;

  const styleId = 'btc-connect-button-component-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = getComponentStyles();
    document.head.appendChild(style);
  }
};

// 获取组件特定样式
const getComponentStyles = () => `
  .btc-connect-button-text {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .btc-connect-button-loading {
    animation: spin 1s linear infinite;
  }

  .btc-connect-button--loading .btc-connect-button-text {
    animation: fadeIn 0.3s ease;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* 可访问性增强 */
  .btc-connect-button:focus-visible {
    outline: 2px solid #f7931a;
    outline-offset: 2px;
  }

  /* 高对比度模式支持 */
  @media (prefers-contrast: high) {
    .btc-connect-button {
      border-width: 2px;
    }

    .btc-connect-button:focus-visible {
      outline-width: 3px;
    }
  }

  /* 减少动画模式支持 */
  @media (prefers-reduced-motion: reduce) {
    .btc-connect-button-loading {
      animation: none;
    }

    .btc-connect-button--loading .btc-connect-button-text {
      animation: none;
    }

    .btc-connect-button-loading {
      stroke-dasharray: none;
      stroke-dashoffset: 0;
    }
  }
`;
</script>

<style scoped>
/* 基础样式已通过外部CSS文件注入，这里只添加组件特定样式 */
</style>