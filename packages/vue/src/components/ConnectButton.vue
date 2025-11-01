<template>
  <!-- 已连接状态 - 保持与 React 相同的 DOM 结构 -->
  <div
    v-if="isConnected && currentAccount?.address"
    ref="containerRef"
    :class="`btc-connected-status theme-${computedTheme}`"
    :style="getButtonStyles()"
    @click="handleToggleDropdown"
    role="button"
    tabindex="0"
    @keydown="(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggleDropdown();
      }
    }"
  >
    <div class="btc-balance-section">
      <p class="btc-balance-amount">
        {{ formatBTCBalance(balance?.total || 0) }}
        <span class="btc-balance-unit">BTC</span>
      </p>
    </div>

    <button
      :class="`btc-address-section theme-${computedTheme}`"
      @click="handleAddressClick"
      :title="currentAccount.address"
      type="button"
      :aria-label="`复制地址: ${currentAccount.address}`"
    >
      <svg
        v-if="copied"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="btc-copied-icon"
        aria-label="复制成功"
      >
        <title>复制成功</title>
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p v-else class="btc-address-text">
        {{ formatAddressShort(currentAccount.address, 4) }}
      </p>
    </button>

    <!-- 下拉菜单 -->
    <div
      v-if="showDropdown"
      ref="dropdownRef"
      :class="`btc-dropdown theme-${computedTheme}`"
    >
      <button class="btc-dropdown-item" @click="handleDisconnect">
        Disconnect
      </button>
    </div>
  </div>

  <!-- 连接按钮 -->
  <button
    v-else
    :class="`btc-connect-button theme-${computedTheme} ${props.class || ''}`"
    :style="getButtonStyles()"
    @click="handleConnect"
    :disabled="disabled"
  >
    <!-- Bitcoin 图标 -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      aria-label="比特币"
      role="img"
    >
      <title>比特币</title>
      <path fill="none" d="M0 0h48v48H0z" />
      <path d="M42 36v2c0 2.21-1.79 4-4 4H10c-2.21 0-4-1.79-4-4V10c0-2.21 1.79-4 4-4h28c2.21 0 4 1.79 4 4v2H24c-2.21 0-4 1.79-4 4v16c0 2.21 1.79 4 4 4h18zm-18-4h20V16H24v16zm8-5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
    </svg>
    {{ label }}
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
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { ConnectButtonProps } from '../types';
import { useWallet } from '../composables/useWallet';
import { useWalletModal } from '../composables/useWalletModal';
import { useCore } from '../composables/useCore';
import { useConfig } from '../config';
import { useBalance } from '../composables/useBalance';
import { formatAddressShort, formatBTCBalance } from '../utils';
import { isClient } from '../index';
import WalletModal from './WalletModal.vue';

// Props
const props = withDefaults(defineProps<ConnectButtonProps>(), {
  size: 'md',
  variant: 'select',
  label: 'Connect',
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
const { isConnected, currentWallet, connect, disconnect, availableWallets } = useCore();
const { currentAccount } = useWallet();
const { balance } = useBalance();
const { isOpen: modalIsOpen, open: openModal, close: closeModal } = useWalletModal('ConnectButton');
const config = useConfig();

// State
const showDropdown = ref(false);
const copied = ref(false);
const copiedTimer = ref<NodeJS.Timeout | null>(null);
const containerRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();

// Computed
const computedTheme = computed(() => {
  return props.theme || config.getThemeConfig().mode;
});

// Methods
const getButtonStyles = () => {
  const styles: Record<string, string | number> = {};

  // 处理Vue的StyleValue类型
  if (props.style) {
    if (typeof props.style === 'string') {
      // 如果是字符串，暂时跳过处理
    } else if (Array.isArray(props.style)) {
      // 如果是数组，暂时跳过处理
    } else {
      // 如果是对象，合并到styles中
      Object.assign(styles, props.style);
    }
  }

  if (props.size === 'sm') {
    styles.minHeight = '32px';
    styles.padding = '4px 12px';
    styles.fontSize = '12px';
  } else if (props.size === 'lg') {
    styles.minHeight = '48px';
    styles.padding = '12px 24px';
    styles.fontSize = '16px';
  }

  return styles;
};

const handleConnect = () => {
  if (props.disabled) return;
  openModal();
  emit('connect', 'modal_opened');
};

const handleDisconnect = () => {
  showDropdown.value = false;
  disconnect?.();
  emit('disconnect');
};

const handleAddressClick = async (event: Event) => {
  event.stopPropagation(); // 阻止事件冒泡，防止触发父容器的点击事件
  await handleCopyAddress();
};

const handleCopyAddress = async () => {
  if (!currentAccount.value?.address) return;

  try {
    await navigator.clipboard.writeText(currentAccount.value.address);
    copied.value = true;

    // 清理之前的定时器
    if (copiedTimer.value) {
      clearTimeout(copiedTimer.value);
    }

    // 设置新的定时器
    const timer = setTimeout(() => {
      copied.value = false;
    }, 1200);
    copiedTimer.value = timer;
  } catch (error) {
    console.error('Failed to copy address:', error);
  }
};

const handleToggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const handleWalletConnect = async (walletId: string) => {
  try {
    const accounts = await connect(walletId);
    closeModal();
    emit('connect', walletId);
  } catch (error) {
    console.error('Failed to connect to wallet:', error);
    emit('error', error instanceof Error ? error : new Error(`Failed to connect to ${walletId}`));
  }
};

const handleModalClose = () => {
  closeModal();
};

// Lifecycle
onMounted(() => {
  injectStyles();
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
  if (copiedTimer.value) {
    clearTimeout(copiedTimer.value);
  }
});

// 处理外部点击
const handleOutsideClick = (event: MouseEvent) => {
  if (
    containerRef.value &&
    !containerRef.value.contains(event.target as Node)
  ) {
    showDropdown.value = false;
  }
};

// 样式注入
const injectStyles = () => {
  if (typeof document !== 'undefined') {
    const styleId = 'btc-connect-button-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = getStyles();
      document.head.appendChild(style);
    }
  }
};

// 获取样式
const getStyles = () => `
  .btc-connect-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    background-color: #ffffff;
    color: #333333;
    cursor: pointer;
    transition: all 0.15s ease;
    box-sizing: border-box;
    user-select: none;
    min-height: 40px;
  }

  .btc-connect-button:hover:not(:disabled) {
    background-color: #f8f9fa;
    border-color: #adb5bd;
  }

  .btc-connect-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px #f7931a;
  }

  .btc-connect-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btc-connect-button.theme-dark {
    background-color: #1a1a1a;
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .btc-connect-button.theme-dark:hover:not(:disabled) {
    background-color: #2a2a2a;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .btc-connect-button svg {
    width: 18px;
    height: 18px;
    fill: #f7931a;
    flex-shrink: 0;
  }

  .btc-connected-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 4px;
    min-width: 160px;
    max-width: 98vw;
    height: 40px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    cursor: pointer;
    transition: all 0.15s ease;
    box-sizing: border-box;
    font-size: 12px;
    position: relative;
  }

  .btc-connected-status.theme-dark {
    background-color: #2a2a2a;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .btc-connected-status.theme-light {
    background-color: #ffffff;
    color: #333333;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .btc-connected-status:hover {
    opacity: 0.9;
  }

  .btc-balance-section {
    flex: 1;
    text-align: center;
    min-width: 0;
  }

  .btc-balance-amount {
    font-size: 12px;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .btc-balance-unit {
    font-weight: 600;
    color: #f7931a;
    margin-left: 2px;
  }

  .btc-address-section {
    width: 48px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: #e9ecef;
    border: 1px solid #dee2e6;
    transition: all 0.15s ease;
    overflow: hidden;
    padding: 0 6px;
    flex-shrink: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 10px;
    font-weight: 500;
    color: #333333;
    box-sizing: border-box;
    user-select: none;
  }

  .btc-address-section:hover {
    background-color: #f8f9fa;
    border-color: #adb5bd;
  }

  .btc-address-section:focus {
    outline: none;
    box-shadow: 0 0 0 2px #f7931a;
  }

  .btc-address-section.theme-dark {
    background-color: #3a3a3a;
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .btc-address-section.theme-dark:hover {
    background-color: #4a4a4a;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .btc-address-text {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .btc-copied-icon {
    color: #22c55e;
    pointer-events: none;
  }

  .btc-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 1000;
    width: auto;
    min-width: 120px;
    max-width: 200px;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid #e9ecef;
    background-color: #ffffff;
    user-select: none;
  }

  .btc-dropdown.theme-dark {
    background-color: #2a2a2a;
    border-color: #404040;
    color: #ffffff;
  }

  .btc-dropdown-item {
    width: 100%;
    appearance: none;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.15s ease;
    background-color: transparent;
    color: inherit;
    text-align: left;
    font-family: inherit;
    font-size: inherit;
    user-select: none;
  }

  .btc-dropdown-item:hover {
    background-color: #f8f9fa;
  }

  .btc-dropdown.theme-dark .btc-dropdown-item:hover {
    background-color: #3a3a3a;
  }

  @media (max-width: 480px) {
    .btc-connect-button,
    .btc-connected-status {
      width: 100%;
      min-width: auto;
      max-width: 98vw;
    }

    .btc-dropdown {
      max-width: 100%;
      width: auto;
    }
  }
`;
</script>

<style scoped>
/* 基础样式已通过外部CSS文件注入，这里只添加组件特定样式 */
</style>
