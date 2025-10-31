<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 头部导航 -->
    <Header theme="light" />

    <!-- 主要内容 -->
    <main>
      <WalletTestSuite />
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