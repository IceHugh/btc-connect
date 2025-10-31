<template>
  <header class="sticky top-0 z-50 backdrop-blur-md border-b-2 border-orange-500 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Logo 和标题 -->
        <div class="flex items-center space-x-3">
          <!-- Bitcoin Logo -->
          <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56c-.21-.81-.84-1.29-1.84-1.29H10v8h2v-3h2.5c1 0 1.63-.48 1.84-1.29.2-.76-.01-1.58-.56-2.09.55-.51.76-1.33.56-2.09z"/>
            </svg>
          </div>

          <!-- 标题文字 -->
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              BTC Connect
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Nuxt.js 测试套件
            </p>
          </div>
        </div>

        <!-- 右侧钱包连接按钮 -->
        <div class="flex items-center space-x-4">
          <ClientOnly>
            <ConnectButton
              size="sm"
              variant="select"
              :theme="theme"
              show-balance
              show-address
              balance-precision="8"
              @connect="handleConnect"
              @disconnect="handleDisconnect"
              @error="handleError"
            />
          </ClientOnly>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// 组件配置
defineProps<{
  theme?: 'light' | 'dark'
}>();

// 事件处理
const handleConnect = (walletId: string) => {
  console.log('🔗 Header: Wallet connected:', walletId);

  // 显示连接成功的浏览器通知
  if (process.client && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('BTC Connect', {
      body: `成功连接到 ${walletId} 钱包`,
      icon: '/bitcoin-logo.png'
    });
  }
};

const handleDisconnect = () => {
  console.log('🔌 Header: Wallet disconnected');

  // 显示断开连接的浏览器通知
  if (process.client && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('BTC Connect', {
      body: '钱包已断开连接',
      icon: '/bitcoin-logo.png'
    });
  }
};

const handleError = (error: Error) => {
  console.error('❌ Header: Wallet error:', error);

  // 显示错误通知
  if (process.client && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('BTC Connect - 错误', {
      body: `连接错误: ${error.message}`,
      icon: '/bitcoin-logo.png'
    });
  }
};

// 请求通知权限
onMounted(() => {
  if (process.client && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
});

// 页面元数据
useHead({
  title: 'BTC Connect - Nuxt 3 完整测试套件',
  meta: [
    { name: 'description', content: 'Bitcoin wallet connection complete test suite using Nuxt 3' }
  ]
})
</script>

<style scoped>
/* 自定义样式 */
header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
}

.dark header {
  background: rgba(26, 26, 26, 0.95);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .flex.justify-between {
    flex-direction: column;
    gap: 1rem;
  }

  .flex.items-center.space-x-4 {
    width: 100%;
    justify-content: space-between;
  }

  .flex.items-center.space-x-3 {
    width: 100%;
  }

  .text-sm {
    display: none;
  }
}
</style>
