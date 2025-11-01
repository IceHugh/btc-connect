<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 头部导航 -->
    <Header theme="light" />

    <!-- 主要内容 -->
    <main>
      <ClientOnly>
        <WalletTestSuite />

        <!-- 加载占位符 -->
        <template #fallback>
          <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div class="max-w-7xl mx-auto">
              <!-- 加载骨架屏 -->
              <div class="animate-pulse">
                <div class="bitcoin-gradient text-white shadow-lg mb-8 h-32 rounded-lg flex items-center justify-center">
                  <div class="text-center">
                    <div class="h-8 bg-white/20 rounded w-64 mx-auto mb-2"></div>
                    <div class="h-4 bg-white/10 rounded w-48 mx-auto"></div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg">
                    <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div class="h-4 bg-gray-100 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg">
                    <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div class="h-4 bg-gray-100 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg">
                    <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div class="h-4 bg-gray-100 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>

                <div class="text-center py-8">
                  <div class="inline-flex items-center space-x-2 text-orange-500">
                    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>正在加载钱包功能...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </ClientOnly>
    </main>

    <!-- WalletModal 已集成到 ConnectButton 中，无需单独引用 -->
  </div>
</template>

<script setup lang="ts">
// 页面元数据
useHead({
  title: 'BTC Connect - 完整测试套件',
  meta: [
    { name: 'description', content: 'Bitcoin wallet connection complete test suite using Nuxt 3' }
  ]
})

// SEO优化
useSeoMeta({
  ogTitle: 'BTC Connect - 完整测试套件',
  ogDescription: 'Bitcoin wallet connection complete test suite',
  ogImage: '/bitcoin-logo.png',
  twitterCard: 'summary_large_image'
})
</script>