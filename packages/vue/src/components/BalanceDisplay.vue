<template>
  <div
    :class="[
      'btc-balance-section',
      `btc-balance-section--${theme}`,
      {
        'btc-balance-section--loading': isLoading,
        'btc-balance-section--error': !!error,
      }
    ]"
    :title="tooltip"
  >
    <!-- 加载状态 -->
    <div v-if="isLoading" class="btc-balance-loading">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="btc-balance-loading-icon"
        aria-label="Loading balance"
      >
        <title>Loading balance</title>
        <path
          d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="animate-spin"
        />
      </svg>
      <span class="btc-balance-loading-text">Loading...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="btc-balance-error">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="btc-balance-error-icon"
        aria-label="Balance loading failed"
      >
        <title>Balance loading failed</title>
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>

    <!-- 正常余额显示 -->
    <div v-else-if="formattedBalance" class="btc-balance-content">
      <p class="btc-balance-amount">
        <span class="btc-balance-value">{{ formattedBalance.value }}</span>
        <span v-if="showUnit" class="btc-balance-unit">{{ formattedBalance.unit }}</span>
      </p>
      <div v-if="showDetails" class="btc-balance-details">
        <span class="btc-balance-confirmed">Confirmed: {{ formatBTC(balance?.confirmed || 0) }}</span>
        <span v-if="hasUnconfirmed" class="btc-balance-unconfirmed">
          Pending: {{ formatBTC(balance?.unconfirmed || 0) }}
        </span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="btc-balance-empty">
      <span class="btc-balance-empty-text">No balance</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { BalanceDisplayProps } from '../types';
import { formatBTCBalance } from '../utils';

// Props
const props = withDefaults(defineProps<BalanceDisplayProps>(), {
  precision: 8,
  showUnit: true,
  theme: 'light',
  class: '',
  style: () => ({}),
});

// Emits
const emit = defineEmits<{
  error: [error: Error];
  refresh: [];
}>();

// Computed
const hasBalance = computed(() => {
  return props.balance && (props.balance.total > 0 || props.balance.confirmed > 0);
});

const formattedBalance = computed(() => {
  if (!hasBalance.value) return null;

  const value = formatBTCBalance(props.balance?.total || 0);
  const unit = props.showUnit ? 'BTC' : '';

  return { value, unit };
});

const hasUnconfirmed = computed(() => {
  return props.balance && props.balance.unconfirmed > 0;
});

const isLoading = computed(() => {
  return !props.balance && !props.error;
});

const error = computed(() => {
  return props.error;
});

const tooltip = computed(() => {
  if (error.value) {
    return 'Failed to load balance';
  }

  if (isLoading.value) {
    return 'Loading balance...';
  }

  if (!hasBalance.value) {
    return 'No balance available';
  }

  const details = [];
  if (props.balance?.confirmed) {
    details.push(`Confirmed: ${formatBTC(props.balance.confirmed)} BTC`);
  }
  if (props.balance?.unconfirmed) {
    details.push(`Unconfirmed: ${formatBTC(props.balance.unconfirmed)} BTC`);
  }
  if (props.balance?.total) {
    details.push(`Total: ${formatBTC(props.balance.total)} BTC`);
  }

  return details.join('\n');
});

const showDetails = computed(() => {
  return hasBalance.value && (hasUnconfirmed.value || props.balance?.confirmed !== props.balance?.total);
});

// Methods
const formatBTC = (amount: number): string => {
  return formatBTCBalance(amount);
};

const handleRefresh = () => {
  emit('refresh');
};

// Lifecycle
onMounted(() => {
  injectStyles();
});

// 样式注入
const injectStyles = () => {
  if (typeof document === 'undefined') return;

  const styleId = 'btc-balance-display-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = getStyles();
    document.head.appendChild(style);
  }
};

// 获取样式字符串
const getStyles = () => `
  .btc-balance-section {
    flex: 1;
    text-align: center;
    min-width: 0;
    transition: all 0.15s ease;
    position: relative;
  }

  .btc-balance-section--loading {
    opacity: 0.7;
  }

  .btc-balance-section--error {
    opacity: 0.5;
  }

  .btc-balance-amount {
    font-size: 12px;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s ease;
    line-height: 1.2;
  }

  .btc-balance-value {
    color: inherit;
  }

  .btc-balance-unit {
    font-weight: 600;
    color: #f7931a;
    margin-left: 2px;
  }

  .btc-balance-section:hover .btc-balance-value {
    color: #f7931a;
  }

  .btc-balance-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 4px;
    font-size: 9px;
    opacity: 0.8;
    line-height: 1.1;
  }

  .btc-balance-confirmed,
  .btc-balance-unconfirmed {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .btc-balance-unconfirmed {
    color: #f59e0b;
    font-style: italic;
  }

  /* 加载状态 */
  .btc-balance-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #6b7280;
  }

  .btc-balance-loading-text {
    font-size: 10px;
    white-space: nowrap;
  }

  .btc-balance-loading-icon {
    animation: spin 1s linear infinite;
  }

  /* 错误状态 */
  .btc-balance-error {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ef4444;
  }

  .btc-balance-error-icon {
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  .btc-balance-error-icon:hover {
    transform: scale(1.1);
  }

  /* 空状态 */
  .btc-balance-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
  }

  .btc-balance-empty-text {
    font-size: 10px;
    font-style: italic;
  }

  /* 主题适配 */
  .btc-balance-section--dark {
    color: #ffffff;
  }

  .btc-balance-section--dark .btc-balance-loading {
    color: #d1d5db;
  }

  .btc-balance-section--dark .btc-balance-error {
    color: #f87171;
  }

  .btc-balance-section--dark .btc-balance-empty {
    color: #6b7280;
  }

  /* 动画 */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* 响应式设计 */
  @media (max-width: 480px) {
    .btc-balance-amount {
      font-size: 11px;
    }

    .btc-balance-details {
      font-size: 8px;
    }

    .btc-balance-loading-text,
    .btc-balance-empty-text {
      font-size: 9px;
    }
  }

  /* 减少动画模式支持 */
  @media (prefers-reduced-motion: reduce) {
    .btc-balance-section,
    .btc-balance-amount,
    .btc-balance-loading-icon,
    .btc-balance-error-icon {
      transition: none;
      animation: none;
    }

    .btc-balance-loading-icon {
      border-top-color: currentColor;
      border-right-color: currentColor;
    }
  }

  /* 高对比度模式支持 */
  @media (prefers-contrast: high) {
    .btc-balance-unit {
      font-weight: 700;
    }

    .btc-balance-details {
      opacity: 1;
    }
  }
`;
</script>

<style scoped>
/* 使用注入的样式，这里留空 */
</style>