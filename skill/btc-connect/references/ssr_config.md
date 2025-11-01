# SSR 环境配置指南

## Next.js SSR 配置

### 1. 项目设置
确保Next.js项目支持btc-connect的SSR：

```bash
# 创建Next.js项目
npx create-next-app@latest my-btc-app --typescript --tailwind --app

# 安装btc-connect
cd my-btc-app
bun add @btc-connect/core @btc-connect/react
```

### 2. 动态导入客户端组件
由于btc-connect需要在客户端运行，需要使用动态导入：

```tsx
// components/WalletConnector.tsx
'use client'

import { useState, useEffect } from 'react'
import { useWallet, useNetwork } from '@btc-connect/react'

export default function WalletConnector() {
  const [mounted, setMounted] = useState(false)
  const {
    wallet,
    isConnected,
    isConnecting,
    connect,
    disconnect
  } = useWallet()

  const { network, switchNetwork } = useNetwork()

  // 避免SSR和客户端不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="p-4 border rounded">
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">钱包连接</h2>

      {!isConnected ? (
        <div className="space-x-2">
          <button
            onClick={() => connect('unisat')}
            disabled={isConnecting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isConnecting ? '连接中...' : '连接 UniSat'}
          </button>
          <button
            onClick={() => connect('okx')}
            disabled={isConnecting}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isConnecting ? '连接中...' : '连接 OKX'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="font-semibold">地址:</p>
            <p className="font-mono text-sm">{wallet?.address}</p>
          </div>
          <div>
            <p className="font-semibold">网络:</p>
            <p>{network}</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              断开连接
            </button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">网络切换</h3>
            <div className="space-x-2">
              <button
                onClick={() => switchNetwork('mainnet')}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                主网
              </button>
              <button
                onClick={() => switchNetwork('testnet')}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                测试网
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 3. 页面中使用
```tsx
// app/page.tsx
import dynamic from 'next/dynamic'

// 动态导入钱包组件
const WalletConnector = dynamic(() => import('@/components/WalletConnector'), {
  ssr: false,
  loading: () => <div className="p-4 border rounded">加载钱包组件中...</div>
})

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          BTC-Connect Next.js 示例
        </h1>

        <div className="grid gap-8">
          <WalletConnector />

          {/* 其他内容 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">应用内容</h2>
            <p>
              这里是你的应用主要内容。钱包连接状态在上方显示。
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
```

### 4. 提供者配置
```tsx
// app/providers.tsx
'use client'

import { BTCWalletProvider } from '@btc-connect/react'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BTCWalletProvider>
      {children}
    </BTCWalletProvider>
  )
}
```

### 5. 布局文件
```tsx
// app/layout.tsx
import Providers from './providers'

export const metadata = {
  title: 'BTC-Connect Next.js App',
  description: 'Bitcoin wallet connection with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

### 6. 环境变量配置
```env
# .env.local
NEXT_PUBLIC_DEFAULT_NETWORK=livenet
NEXT_PUBLIC_SUPPORTED_WALLETS=unisat,okx
```

## Nuxt 4 SSR 配置

### 1. 项目设置
```bash
# 创建Nuxt 4项目
npx nuxi@latest init my-btc-nuxt-app

cd my-btc-nuxt-app
bun add @btc-connect/core @btc-connect/vue
```

### 2. 客户端插件配置
创建btc-connect插件：

```typescript
// plugins/btc-connect.client.ts
import { defineNuxtPlugin } from '#app'
import { BTCWalletPlugin } from '@btc-connect/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BTCWalletPlugin)
})
```

### 3. 钱包组件
```vue
<!-- components/WalletConnector.vue -->
<template>
  <div class="wallet-connector">
    <h2>钱包连接</h2>

    <div v-if="!mounted">
      <p>加载中...</p>
    </div>

    <div v-else-if="!isConnected">
      <button
        @click="handleConnect('unisat')"
        :disabled="isConnecting"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mr-2"
      >
        {{ isConnecting ? '连接中...' : '连接 UniSat' }}
      </button>
      <button
        @click="handleConnect('okx')"
        :disabled="isConnecting"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
      >
        {{ isConnecting ? '连接中...' : '连接 OKX' }}
      </button>
    </div>

    <div v-else class="space-y-4">
      <div>
        <p class="font-semibold">地址:</p>
        <p class="font-mono text-sm">{{ wallet?.address }}</p>
      </div>
      <div>
        <p class="font-semibold">网络:</p>
        <p>{{ network }}</p>
      </div>

      <div class="space-x-2">
        <button
          @click="disconnect"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          断开连接
        </button>
      </div>

      <div>
        <h3 class="font-semibold mb-2">网络切换</h3>
        <div class="space-x-2">
          <button
            @click="switchToMainnet"
            class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
          >
            主网
          </button>
          <button
            @click="switchToTestnet"
            class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            测试网
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWallet, useNetwork } from '@btc-connect/vue'

const {
  wallet,
  isConnected,
  isConnecting,
  connect,
  disconnect
} = useWallet()

const { network, switchNetwork } = useNetwork()

// 避免SSR不匹配
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

const handleConnect = async (walletId: string) => {
  try {
    await connect(walletId)
  } catch (error) {
    console.error('连接失败:', error)
  }
}

const switchToMainnet = async () => {
  try {
    await switchNetwork('mainnet')
  } catch (error) {
    console.error('切换失败:', error)
  }
}

const switchToTestnet = async () => {
  try {
    await switchNetwork('testnet')
  } catch (error) {
    console.error('切换失败:', error)
  }
}
</script>

<style scoped>
.wallet-connector {
  @apply p-4 border rounded-lg;
}

.space-y-4 > * + * {
  @apply mt-4;
}

.space-x-2 > * + * {
  @apply ml-2;
}

.mr-2 {
  @apply mr-2;
}
</style>
```

### 4. 页面使用
```vue
<!-- app.vue -->
<template>
  <div>
    <NuxtWelcome />
    <WalletConnector />
  </div>
</template>
```

或创建自定义页面：

```vue
<!-- pages/index.vue -->
<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-center mb-8">
        BTC-Connect Nuxt 4 示例
      </h1>

      <div class="grid gap-8">
        <WalletConnector />

        <!-- 其他内容 -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-bold mb-4">应用内容</h2>
          <p>
            这里是你的应用主要内容。钱包连接状态在上方显示。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 5. 配置文件
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    // 如果需要额外的模块
  ],

  // 运行时配置
  runtimeConfig: {
    // 私有配置，只在服务端可用
    privateKey: process.env.PRIVATE_KEY,

    // 公共配置，在客户端和服务端都可用
    public: {
      defaultNetwork: process.env.NUXT_PUBLIC_DEFAULT_NETWORK || 'livenet',
      supportedWallets: process.env.NUXT_PUBLIC_SUPPORTED_WALLETS || 'unisat,okx'
    }
  },

  // 优化构建
  optimizeDeps: {
    include: ['@btc-connect/core']
  }
})
```

### 6. 环境变量
```env
# .env
NUXT_PUBLIC_DEFAULT_NETWORK=livenet
NUXT_PUBLIC_SUPPORTED_WALLETS=unisat,okx
```

## 通用SSR注意事项

### 1. 避免SSR/客户端不匹配
```typescript
// 检查是否在客户端环境
const isClient = typeof window !== 'undefined'

// 或使用onMounted钩子
onMounted(() => {
  // 客户端特有的逻辑
})
```

### 2. 动态导入钱包相关组件
```typescript
// Next.js 动态导入
const WalletConnector = dynamic(() => import('./WalletConnector'), {
  ssr: false,
  loading: () => <p>Loading wallet...</p>
})

// Nuxt 动态导入
const WalletConnector = defineAsyncComponent(() =>
  import('./WalletConnector.vue')
)
```

### 3. 错误边界处理
```tsx
// Next.js 错误边界
'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Wallet connection error:', error)
  }, [error])

  return (
    <div className="p-4 border border-red-300 rounded-lg bg-red-50">
      <h2 className="text-red-800 font-bold">钱包连接出错</h2>
      <p className="text-red-600">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        重试
      </button>
    </div>
  )
}
```

### 4. 钱包检测增强
```typescript
// 增强的钱包检测，处理延迟注入
async function detectWalletsWithDelay() {
  const maxAttempts = 20
  const interval = 300

  for (let i = 0; i < maxAttempts; i++) {
    if (typeof window !== 'undefined') {
      if (window.unisat || window.okxwallet) {
        return {
          unisat: !!window.unisat,
          okx: !!window.okxwallet
        }
      }
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }

  return {
    unisat: false,
    okx: false
  }
}
```

### 5. 服务端兼容性
确保代码在服务端环境不会报错：

```typescript
// 安全的window访问
const safeWindowAccess = () => {
  if (typeof window === 'undefined') {
    return null
  }
  return window
}

// 安全的localStorage访问
const getLocalStorageItem = (key: string) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }
  return window.localStorage.getItem(key)
}
```

### 6. 性能优化
```typescript
// 预加载钱包检测
if (typeof window !== 'undefined') {
  // 在页面加载完成后开始检测钱包
  window.addEventListener('load', () => {
    detectWalletsWithDelay().then(wallets => {
      console.log('检测到的钱包:', wallets)
    })
  })
}
```

## SSR最佳实践

### 1. 组件设计原则
- 客户端组件使用`'use client'`指令 (Next.js)
- 或使用`.client.vue`后缀 (Nuxt)
- 避免在服务端组件中直接使用钱包API

### 2. 状态管理
- 使用适当的SSR兼容状态管理
- 考虑使用localStorage或sessionStorage持久化连接状态
- 处理页面刷新后的状态恢复

### 3. 错误处理
- 实现完整的错误边界
- 提供用户友好的错误信息
- 包含重试机制

### 4. 性能优化
- 使用动态导入减少初始包大小
- 实现代码分割
- 优化钱包检测逻辑

### 5. 安全考虑
- 验证所有用户输入
- 安全地处理敏感信息
- 使用HTTPS连接

这些配置确保了btc-connect在SSR环境中能正常工作，同时避免了常见的服务器端渲染问题。