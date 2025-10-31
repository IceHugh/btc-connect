<template>
  <div
    ref="containerRef"
    :class="[
      'btc-connected-status',
      `btc-connected-status--${theme}`,
      `btc-connected-status--${size}`,
      {
        'btc-connected-status--open': showDropdown,
        'btc-connected-status--loading': isConnecting,
      }
    ]"
    :style="computedStyle"
    @click="toggleDropdown"
    role="button"
    tabindex="0"
    :aria-label="`Connected wallet: ${address || 'Unknown'}`"
    :aria-expanded="showDropdown"
    :aria-busy="isConnecting"
    @keydown="handleKeydown"
  >
    <!-- 余额显示 -->
    <BalanceDisplay
      v-if="showBalance && balance"
      :balance="balance"
      :theme="theme"
      :precision="balancePrecision"
      :show-unit="true"
      class="btc-wallet-status-balance"
    />

    <!-- 地址显示 -->
    <AddressDisplay
      v-if="showAddress && address"
      :address="address"
      :theme="theme"
      :copyable="true"
      class="btc-wallet-status-address"
      @copy="handleAddressCopy"
      @error="handleError"
    />

    <!-- 连接状态指示器 -->
    <div class="btc-wallet-status-indicator">
      <div
        :class="[
          'btc-status-dot',
          {
            'btc-status-dot--connected': isConnected,
            'btc-status-dot--connecting': isConnecting,
            'btc-status-dot--disconnected': !isConnected,
          }
        ]"
      />
    </div>

    <!-- 下拉菜单 -->
    <Teleport to="body" v-if="isClient">
      <Transition name="btc-dropdown">
        <div
          v-if="showDropdown"
          ref="dropdownRef"
          :class="[
            'btc-dropdown',
            `btc-dropdown--${theme}`,
            'btc-wallet-status-dropdown'
          ]"
          @click.stop
        >
          <!-- 钱包信息 -->
          <div class="btc-dropdown-header">
            <div class="btc-dropdown-wallet-info">
              <img
                v-if="currentWallet?.icon"
                :src="currentWallet.icon"
                :alt="currentWallet.name"
                class="btc-dropdown-wallet-icon"
              />
              <span class="btc-dropdown-wallet-name">{{ currentWallet?.name || 'Unknown Wallet' }}</span>
            </div>
            <div class="btc-dropdown-network">
              Network: {{ networkDisplay }}
            </div>
          </div>

          <div class="btc-dropdown-divider" />

          <!-- 操作项 -->
          <div class="btc-dropdown-actions">
            <button
              class="btc-dropdown-item"
              @click="handleCopyAddress"
              :disabled="!address"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="btc-dropdown-icon">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Copy Address
            </button>

            <button
              class="btc-dropdown-item"
              @click="handleRefreshBalance"
              :disabled="isLoading"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="btc-dropdown-icon">
                <path d="M23 4v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M1 20v-6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Refresh Balance
            </button>

            <div class="btc-dropdown-divider" />

            <button
              class="btc-dropdown-item btc-dropdown-item--danger"
              @click="handleDisconnect"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="btc-dropdown-icon">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="16 17 21 12 16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Disconnect
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type { ComponentSize, ThemeMode } from '../types';
import { isClient } from '../index';
import { useCore } from '../composables';
import { useWallet } from '../composables/useWallet';
import { useBalance } from '../composables/useBalance';
import { useNetwork } from '../composables/useNetwork';
import BalanceDisplay from './BalanceDisplay.vue';
import AddressDisplay from './AddressDisplay.vue';

// Props
interface Props {
  /** 主题模式 */
  theme?: ThemeMode;
  /** 组件尺寸 */
  size?: ComponentSize;
  /** 是否显示余额 */
  showBalance?: boolean;
  /** 是否显示地址 */
  showAddress?: boolean;
  /** 余额显示精度 */
  balancePrecision?: number;
  /** 自定义类名 */
  class?: string;
  /** 自定义样式 */
  style?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  size: 'md',
  showBalance: true,
  showAddress: true,
  balancePrecision: 8,
  class: '',
  style: () => ({}),
});

// Emits
const emit = defineEmits<{
  disconnect: [];
  error: [error: Error];
  addressCopied: [address: string];
  balanceRefreshed: [];
}>();

// Composables
const { isConnected, isConnecting, currentWallet, disconnect } = useCore();
const { address } = useWallet();
const { balance, isLoading, refreshBalance } = useBalance();
const { network, getNetworkInfo } = useNetwork();

// State
const showDropdown = ref(false);
const containerRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();

// Computed
const computedStyle = computed(() => {
  const styles: Record<string, any> = { ...props.style };

  // 根据尺寸调整样式
  if (props.size === 'sm') {
    styles.minHeight = '32px';
    styles.fontSize = '11px';
  } else if (props.size === 'lg') {
    styles.minHeight = '48px';
    styles.fontSize = '14px';
    styles.gap = '12px';
  }

  return styles;
});

const networkDisplay = computed(() => {
  if (!network.value) return 'Unknown';
  const info = getNetworkInfo(network.value.network);
  return info.name;
});

// Methods
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  showDropdown.value = false;
};

const handleDisconnect = async () => {
  closeDropdown();
  try {
    await disconnect();
    emit('disconnect');
  } catch (error) {
    console.error('Failed to disconnect:', error);
    emit('error', error instanceof Error ? error : new Error('Failed to disconnect'));
  }
};

const handleCopyAddress = () => {
  closeDropdown();
  if (address.value) {
    emit('addressCopied', address.value);
  }
};

const handleAddressCopy = (address: string) => {
  emit('addressCopied', address);
};

const handleRefreshBalance = async () => {
  try {
    await refreshBalance();
    emit('balanceRefreshed');
  } catch (error) {
    console.error('Failed to refresh balance:', error);
    emit('error', error instanceof Error ? error : new Error('Failed to refresh balance'));
  }
};

const handleError = (error: Error) => {
  emit('error', error);
};

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      toggleDropdown();
      break;
    case 'Escape':
      if (showDropdown.value) {
        event.preventDefault();
        closeDropdown();
      }
      break;
  }
};

const handleOutsideClick = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

const handleKeydownOutside = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDropdown();
  }
};

// Lifecycle
onMounted(() => {
  if (isClient) {
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeydownOutside);
  }
  injectStyles();
});

onUnmounted(() => {
  if (isClient) {
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('keydown', handleKeydownOutside);
  }
});

// 监听连接状态变化，关闭下拉菜单
watch(isConnected, (connected) => {
  if (!connected) {
    closeDropdown();
  }
});

// 样式注入
const injectStyles = () => {
  if (typeof document === 'undefined') return;

  const styleId = 'btc-wallet-status-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = getStyles();
    document.head.appendChild(style);
  }
};

// 获取样式字符串
const getStyles = () => `
  .btc-wallet-status-balance {
    flex: 1;
    min-width: 0;
  }

  .btc-wallet-status-address {
    flex-shrink: 0;
  }

  .btc-wallet-status-indicator {
    display: flex;
    align-items: center;
    margin-left: 4px;
  }

  .btc-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    transition: all 0.15s ease;
  }

  .btc-status-dot--connected {
    background-color: #22c55e;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
  }

  .btc-status-dot--connecting {
    background-color: #f59e0b;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .btc-status-dot--disconnected {
    background-color: #ef4444;
  }

  .btc-wallet-status-dropdown {
    min-width: 240px;
    max-width: 320px;
  }

  .btc-dropdown-header {
    padding: 8px 0;
  }

  .btc-dropdown-wallet-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .btc-dropdown-wallet-icon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }

  .btc-dropdown-wallet-name {
    font-weight: 600;
    font-size: 14px;
  }

  .btc-dropdown-network {
    font-size: 12px;
    opacity: 0.8;
  }

  .btc-dropdown-divider {
    height: 1px;
    background-color: #e5e7eb;
    margin: 8px 0;
  }

  .btc-dropdown-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .btc-dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    appearance: none;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.15s ease;
    background-color: transparent;
    color: inherit;
    text-align: left;
    font-family: inherit;
    font-size: 13px;
    user-select: none;
    outline: none;
  }

  .btc-dropdown-item:hover:not(:disabled) {
    background-color: #f3f4f6;
    transform: translateX(2px);
  }

  .btc-dropdown-item:focus-visible {
    background-color: #f3f4f6;
    box-shadow: inset 0 0 0 2px #f7931a;
  }

  .btc-dropdown-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btc-dropdown-item--danger {
    color: #ef4444;
  }

  .btc-dropdown-item--danger:hover:not(:disabled) {
    background-color: #fef2f2;
    color: #dc2626;
  }

  .btc-dropdown-icon {
    flex-shrink: 0;
    opacity: 0.7;
  }

  .btc-dropdown-enter-active,
  .btc-dropdown-leave-active {
    transition: all 0.2s ease;
  }

  .btc-dropdown-enter-from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }

  .btc-dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* 深色主题适配 */
  .btc-dropdown--dark .btc-dropdown-divider {
    background-color: #374151;
  }

  .btc-dropdown--dark .btc-dropdown-item:hover:not(:disabled) {
    background-color: #374151;
  }

  .btc-dropdown--dark .btc-dropdown-item--danger:hover:not(:disabled) {
    background-color: #450a0a;
    color: #f87171;
  }

  /* 减少动画模式支持 */
  @media (prefers-reduced-motion: reduce) {
    .btc-status-dot,
    .btc-dropdown-item,
    .btc-dropdown-enter-active,
    .btc-dropdown-leave-active {
      transition: none;
    }

    .btc-status-dot--connecting {
      animation: none;
    }

    .btc-dropdown-item:hover:not(:disabled) {
      transform: none;
    }

    .btc-dropdown-enter-from,
    .btc-dropdown-leave-to {
      transform: none;
    }
  }
`;
</script>

<style scoped>
/* 使用注入的样式，这里留空 */
</style>