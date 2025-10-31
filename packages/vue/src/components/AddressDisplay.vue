<template>
  <button
    :class="[
      'btc-address-section',
      `btc-address-section--${theme}`,
      {
        'btc-address-section--copied': copied,
        'btc-address-section--loading': isLoading,
      }
    ]"
    @click="copyAddress"
    :disabled="!address || disabled"
    :title="address"
    type="button"
    :aria-label="`Copy address: ${address}`"
    :aria-busy="isLoading"
  >
    <!-- 加载状态 -->
    <svg
      v-if="isLoading"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="btc-loading-icon"
      aria-label="Loading"
    >
      <title>Loading</title>
      <path
        d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="animate-spin"
      />
    </svg>

    <!-- 复制成功状态 -->
    <svg
      v-else-if="copied"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="btc-copied-icon"
      aria-label="Copied"
    >
      <title>Copied</title>
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <!-- 正常地址显示 -->
    <p v-else class="btc-address-text">
      {{ displayAddress }}
    </p>
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { AddressDisplayProps } from '../types';
import { formatAddressShort } from '../utils';

// Props
const props = withDefaults(defineProps<AddressDisplayProps>(), {
  maxLength: 4,
  copyable: true,
  theme: 'light',
  class: '',
  style: () => ({}),
});

// Emits
const emit = defineEmits<{
  copy: [address: string];
  error: [error: Error];
}>();

// State
const copied = ref(false);
const isLoading = ref(false);
const copiedTimer = ref<NodeJS.Timeout | null>(null);

// Computed
const displayAddress = computed(() => {
  if (!props.address) return '';
  return formatAddressShort(props.address, props.maxLength);
});

// Methods
const copyAddress = async () => {
  if (!props.address || !props.copyable || isLoading.value) return;

  // 检查是否支持剪贴板API
  if (!navigator.clipboard) {
    emit('error', new Error('Clipboard API not supported'));
    return;
  }

  isLoading.value = true;

  try {
    await navigator.clipboard.writeText(props.address);
    copied.value = true;
    emit('copy', props.address);

    // 清除之前的定时器
    if (copiedTimer.value) {
      clearTimeout(copiedTimer.value);
    }

    // 设置新的定时器
    copiedTimer.value = setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy address:', error);
    emit('error', error instanceof Error ? error : new Error('Failed to copy address'));
  } finally {
    isLoading.value = false;
  }
};

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if ((event.key === 'Enter' || event.key === ' ') && props.copyable) {
    event.preventDefault();
    copyAddress();
  }
};

// Lifecycle
onMounted(() => {
  // 注入样式
  injectStyles();

  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  // 清理定时器
  if (copiedTimer.value) {
    clearTimeout(copiedTimer.value);
  }

  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeydown);
});

// 监听地址变化，重置复制状态
watch(
  () => props.address,
  () => {
    copied.value = false;
    if (copiedTimer.value) {
      clearTimeout(copiedTimer.value);
      copiedTimer.value = null;
    }
  }
);

// 样式注入
const injectStyles = () => {
  if (typeof document === 'undefined') return;

  const styleId = 'btc-address-display-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = getStyles();
    document.head.appendChild(style);
  }
};

// 获取样式字符串
const getStyles = () => `
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
    outline: none;
    position: relative;
  }

  .btc-address-section:hover:not(:disabled) {
    background-color: #f8f9fa;
    border-color: #adb5bd;
    transform: scale(1.05);
  }

  .btc-address-section:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #f7931a;
  }

  .btc-address-section:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .btc-address-section--dark {
    background-color: #3a3a3a;
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .btc-address-section--dark:hover:not(:disabled) {
    background-color: #4a4a4a;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .btc-address-section--copied {
    background-color: #dcfce7;
    border-color: #22c55e;
  }

  .btc-address-section--copied.btc-address-section--dark {
    background-color: #14532d;
    border-color: #22c55e;
  }

  .btc-address-text {
    font-size: 10px;
    font-weight: 500;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s ease;
  }

  .btc-copied-icon {
    color: #22c55e;
    pointer-events: none;
    animation: fadeIn 0.2s ease;
  }

  .btc-loading-icon {
    color: #f7931a;
    animation: spin 1s linear infinite;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .btc-address-section,
    .btc-copied-icon,
    .btc-loading-icon {
      transition: none;
      animation: none;
    }

    .btc-address-section:hover:not(:disabled) {
      transform: none;
    }

    .btc-loading-icon {
      border-top-color: #f7931a;
      border-right-color: #f7931a;
    }
  }
`;
</script>

<style scoped>
/* 使用注入的样式，这里留空 */
</style>