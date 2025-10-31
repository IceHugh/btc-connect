<template>
  <div v-if="isModalOpen" class="modal-overlay" @click="handleBackdropClick">
    <div class="modal-content" @click.stop>
      <!-- 模态框头部 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          选择钱包
        </h2>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- 模态框内容 -->
      <div class="p-6">
        <div class="space-y-3">
          <div
            v-for="wallet in availableWallets"
            :key="wallet.id"
            class="wallet-item"
            @click="handleWalletSelect(wallet)"
          >
            <div class="flex items-center space-x-4">
              <!-- 钱包图标 -->
              <div class="wallet-icon">
                <img
                  v-if="wallet.icon && wallet.icon.startsWith('http')"
                  :src="wallet.icon"
                  :alt="wallet.name"
                  class="w-8 h-8 object-contain"
                />
                <div v-else class="text-lg font-bold text-gray-600 dark:text-gray-400">
                  {{ wallet.name.charAt(0).toUpperCase() }}
                </div>
              </div>

              <!-- 钱包信息 -->
              <div class="flex-1">
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ wallet.name }}
                  <span v-if="isRecommended(wallet.id)" class="ml-1 text-yellow-500">⭐</span>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ getWalletDescription(wallet.id) }}
                </div>
              </div>

              <!-- 状态 -->
              <div class="wallet-status">
                {{ isWalletInstalled(wallet.id) ? '已安装' : '未安装' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 帮助信息 -->
        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">没有钱包？</h3>
              <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
                点击未安装的钱包将会跳转到官方下载页面
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 模态框底部 -->
      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
          连接钱包即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useWalletModal, useConnectWallet, useWalletInfo } from '@btc-connect/vue'

const { isOpen: isModalOpen, close: closeModal } = useWalletModal()
const { connect } = useConnectWallet()
const { availableWallets } = useWalletInfo()

// 钱包操作
const handleWalletSelect = async (wallet: any) => {
  if (isWalletInstalled(wallet.id)) {
    try {
      await connect(wallet.id)
      closeModal()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  } else {
    // 打开钱包下载页面
    openWalletDownload(wallet.id)
  }
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

// 钱包状态检测
const isWalletInstalled = (walletId: string) => {
  return availableWallets.value.some((w: { id: string }) => w.id === walletId)
}

const isRecommended = (walletId: string) => {
  return ['unisat', 'okx'].includes(walletId)
}

const getWalletDescription = (walletId: string): string => {
  const descriptions: Record<string, string> = {
    unisat: 'Bitcoin wallet for Chrome',
    okx: 'Multi-chain wallet',
    xverse: 'Bitcoin wallet for mobile'
  }
  return descriptions[walletId] || 'Bitcoin wallet'
}

const openWalletDownload = (walletId: string) => {
  const urls: Record<string, string> = {
    unisat: 'https://unisat.io/download',
    okx: 'https://www.okx.com/web3',
    xverse: 'https://www.xverse.app/download'
  }

  const url = urls[walletId]
  if (url) {
    window.open(url, '_blank')
  }
}

// ESC键关闭
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isModalOpen.value) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
})
</script>

<style scoped>
.wallet-item {
  @apply p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200;
}

.wallet-icon {
  @apply w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0;
}

.wallet-status {
  @apply px-3 py-1 text-xs font-medium rounded-full;
}

.wallet-item:hover .wallet-status {
  @apply bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300;
}

.wallet-item:not(:hover) .wallet-status {
  @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
}
</style>