# Nuxt.js 配置指南

本文档提供 btc-connect 在 Nuxt.js 项目中的完整配置指南和最佳实践。

## 目录

- [快速开始](#快速开始)
- [项目配置](#项目配置)
- [SSR 兼容性](#ssr-兼容性)
- [插件配置](#插件配置)
- [组件使用](#组件使用)
- [环境变量](#环境变量)
- [部署配置](#部署配置)
- [性能优化](#性能优化)
- [常见问题](#常见问题)
- [完整示例](#完整示例)

## 快速开始

### 1. 安装依赖

```bash
npm install @btc-connect/vue
# 或
yarn add @btc-connect/vue
# 或
bun add @btc-connect/vue
```

### 2. 基础配置

创建插件 `plugins/btc-connect.client.ts`：

```typescript
import { BTCWalletPlugin } from '@btc-connect/vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BTCWalletPlugin, {
    autoConnect: true,
    connectTimeout: 5000,
    theme: 'auto',
    config: {
      walletOrder: ['unisat', 'okx', 'xverse'],
      featuredWallets: ['unisat', 'okx']
    }
  });
});
```

### 3. 创建钱包页面

`pages/wallet.vue`：

```vue
<template>
  <div>
    <h1>比特币钱包</h1>

    <ConnectButton @connect="handleConnect" />

    <div v-if="isConnected" class="wallet-info">
      <p>钱包: {{ currentWallet?.name }}</p>
      <p>地址: {{ formattedAddress }}</p>
      <p>余额: {{ formattedBalance }}</p>
      <p>网络: {{ network }}</p>

      <button @click="disconnect">断开连接</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useWallet } from '@btc-connect/vue';
import { ConnectButton } from '#components';

const {
  isConnected,
  address,
  balance,
  currentWallet,
  network,
  disconnect,
  utils
} = useWallet();

const formattedAddress = computed(() =>
  utils.formatAddress(address.value || '', { startChars: 6, endChars: 4 })
);

const formattedBalance = computed(() =>
  utils.formatBalance(balance.value || 0, { unit: 'BTC' })
);

const handleConnect = (walletId: string) => {
  console.log('连接到钱包:', walletId);
};
</script>
```

## 项目配置

### Nuxt 配置

在 `nuxt.config.ts` 中：

```typescript
export default defineNuxtConfig({
  // 启用 Vue 3 和 Composition API
  app: {
    head: {
      title: 'BTC Connect Nuxt App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  // 类型检查
  typescript: {
    strict: true,
    typeCheck: true
  },

  // 构建配置
  build: {
    transpile: ['@btc-connect/vue']
  },

  // 开发工具
  devtools: { enabled: true },

  // 模块配置
  modules: [
    // 其他模块
  ],

  // CSS 配置
  css: ['~/assets/css/main.css'],

  // 运行时配置
  runtimeConfig: {
    // 服务端私有配置
    walletSecret: process.env.WALLET_SECRET,

    // 客户端公开配置
    public: {
      walletApiUrl: process.env.WALLET_API_URL || 'https://api.example.com',
      walletTimeout: parseInt(process.env.WALLET_TIMEOUT || '5000')
    }
  },

  // SSR 渲染配置
  ssr: true,

  // 实验性功能
  experimental: {
    payloadExtraction: false
  }
});
```

### TypeScript 配置

`tsconfig.json`：

```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["@nuxt/types"]
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "**/*.vue",
    ".nuxt/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".nuxt",
    "dist"
  ]
}
```

## SSR 兼容性

### 客户端组件

确保钱包相关组件在客户端运行：

```vue
<template>
  <div>
    <ClientOnly>
      <ConnectButton />
      <WalletInfo />
    </ClientOnly>
  </div>
</template>
```

### 动态组件

使用 `<ClientOnly>` 包装钱包组件：

```vue
<template>
  <div>
    <h2>钱包功能</h2>
    <ClientOnly>
      <template #fallback>
        <div class="loading">加载钱包组件...</div>
      </template>

      <WalletModal />
      <NetworkSwitcher />
    </ClientOnly>
  </div>
</template>
```

### 混合渲染

为不同页面设置不同的渲染模式：

```typescript
// pages/wallet.vue
export default {
  name: 'WalletPage',

  // 客户端渲染
  ssr: false,

  // 或者使用 process.client 检查
  setup() {
    if (process.server) {
      return () => h('div', 'Loading...')
    }

    // 客户端逻辑
    const wallet = useWallet();
    // ...
  }
}
```

### 插件客户端限制

在插件名称中添加 `.client` 后缀：

```typescript
// plugins/btc-connect.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  // 只在客户端运行
  nuxtApp.vueApp.use(BTCWalletPlugin, options);
});
```

## 插件配置

### 基础插件

`plugins/btc-connect.client.ts`：

```typescript
import { BTCWalletPlugin } from '@btc-connect/vue';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  nuxtApp.vueApp.use(BTCWalletPlugin, {
    autoConnect: true,
    connectTimeout: config.public.walletTimeout,
    theme: 'auto',
    config: {
      walletOrder: ['unisat', 'okx', 'xverse'],
      featuredWallets: ['unisat', 'okx'],
      showTestnet: process.env.NODE_ENV === 'development',
      showRegtest: false,
      connectionPolicy: {
        tasks: [
          {
            run: async () => ({ success: true }),
            required: false,
            autoBehavior: 'run'
          }
        ],
        emitEventsOnAutoConnect: true
      }
    }
  });

  // 提供全局访问
  nuxtApp.provide('walletConfig', {
    apiUrl: config.public.walletApiUrl,
    timeout: config.public.walletTimeout
  });
});
```

### 组合式函数插件

`plugins/wallet-composables.client.ts`：

```typescript
import { useWallet, useWalletEvent, useWalletManager } from '@btc-connect/vue';

export default defineNuxtPlugin((nuxtApp) => {
  // 提供便捷的组合式函数
  const wallet = useWallet();

  // 全局错误处理
  useWalletEvent('error', (error) => {
    console.error('Wallet error:', error);
    // 可以在这里添加错误上报逻辑
  });

  // 自动重连逻辑
  useWalletEvent('disconnect', () => {
    // 可以在这里添加自动重连逻辑
    console.log('Wallet disconnected');
  });

  // 提供给全局
  nuxtApp.provide('wallet', wallet);
});
```

### 中间件插件

`plugins/wallet-middleware.client.ts`：

```typescript
export default defineNuxtPlugin(() => {
  addRouteMiddleware('wallet-auth', (to, from) => {
    const wallet = useWallet();

    // 检查是否需要钱包连接
    if (to.meta.requiresWallet && !wallet.isConnected.value) {
      // 重定向到钱包连接页面
      return navigateTo('/wallet');
    }
  });
});
```

## 组件使用

### 自动导入组件

在组件中使用 btc-connect 组件：

```vue
<!-- components/WalletConnect.vue -->
<template>
  <div class="wallet-connect">
    <ConnectButton
      theme="auto"
      size="lg"
      @connect="handleConnect"
      @error="handleError"
    />
  </div>
</template>

<script setup>
const handleConnect = (walletId: string) => {
  console.log('Connected to:', walletId);
};

const handleError = (error: Error) => {
  console.error('Connection error:', error);
};
</script>
```

### 钱包信息组件

```vue
<!-- components/WalletInfo.vue -->
<template>
  <ClientOnly>
    <div v-if="isConnected" class="wallet-info">
      <div class="info-header">
        <img :src="currentWallet?.icon" :alt="currentWallet?.name" class="wallet-icon" />
        <h3>{{ currentWallet?.name }}</h3>
      </div>

      <div class="info-content">
        <div class="info-item">
          <label>地址:</label>
          <span>{{ formattedAddress }}</span>
          <button @click="copyAddress" class="copy-btn">复制</button>
        </div>

        <div class="info-item">
          <label>余额:</label>
          <span>{{ formattedBalance }}</span>
        </div>

        <div class="info-item">
          <label>网络:</label>
          <span>{{ network }}</span>
          <button @click="switchNetwork" class="switch-btn">切换</button>
        </div>
      </div>

      <div class="info-actions">
        <button @click="disconnect" class="disconnect-btn">断开连接</button>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { computed } from 'vue';
import { useWallet } from '@btc-connect/vue';
import { copyToClipboard } from '@btc-connect/vue';

const {
  isConnected,
  address,
  balance,
  currentWallet,
  network,
  disconnect,
  switchNetwork,
  utils
} = useWallet();

const formattedAddress = computed(() =>
  utils.formatAddress(address.value || '', { startChars: 6, endChars: 4 })
);

const formattedBalance = computed(() =>
  utils.formatBalance(balance.value || 0, { unit: 'BTC' })
);

const copyAddress = async () => {
  if (address.value) {
    try {
      await copyToClipboard(address.value);
      // 显示复制成功提示
      alert('地址已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  }
};

const handleSwitchNetwork = async () => {
  try {
    const newNetwork = network.value === 'livenet' ? 'testnet' : 'livenet';
    await switchNetwork(newNetwork);
  } catch (error) {
    console.error('网络切换失败:', error);
  }
};
</script>

<style scoped>
.wallet-info {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.wallet-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.info-item label {
  font-weight: 600;
  color: #495057;
}

.copy-btn, .switch-btn {
  padding: 0.25rem 0.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
}

.info-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.disconnect-btn {
  padding: 0.75rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.disconnect-btn:hover {
  background: #c82333;
}
</style>
```

### 网络切换组件

```vue
<!-- components/NetworkSwitcher.vue -->
<template>
  <ClientOnly>
    <div class="network-switcher">
      <h3>网络切换</h3>
      <div class="network-list">
        <button
          v-for="net in networks"
          :key="net.value"
          @click="handleSwitchNetwork(net.value)"
          :class="['network-btn', { active: network === net.value }]"
          :disabled="isSwitching"
        >
          <div class="network-info">
            <span class="network-name">{{ net.name }}</span>
            <span class="network-status">{{ net.status }}</span>
          </div>
          <div v-if="network === net.value" class="current-indicator">✓</div>
        </button>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref } from 'vue';
import { useWallet, useWalletEvent } from '@btc-connect/vue';

const { network, switchNetwork } = useWallet();
const isSwitching = ref(false);

const networks = [
  { value: 'livenet', name: '主网', status: '推荐' },
  { value: 'testnet', name: '测试网', status: '开发测试' },
  { value: 'regtest', name: '回归测试', status: '本地测试' }
];

// 监听网络变化事件
useWalletEvent('networkChange', ({ network: newNetwork }) => {
  console.log('网络已切换到:', newNetwork);
});

const handleSwitchNetwork = async (targetNetwork: string) => {
  if (targetNetwork === network.value || isSwitching.value) {
    return;
  }

  isSwitching.value = true;

  try {
    await switchNetwork(targetNetwork);
  } catch (error) {
    console.error('网络切换失败:', error);
    // 可以在这里添加错误提示
  } finally {
    isSwitching.value = false;
  }
};
</script>

<style scoped>
.network-switcher {
  padding: 1rem;
}

.network-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.network-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.network-btn:hover {
  border-color: #007bff;
}

.network-btn.active {
  border-color: #28a745;
  background: #f8fff9;
}

.network-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.network-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.network-name {
  font-weight: 600;
  color: #212529;
}

.network-status {
  font-size: 0.875rem;
  color: #6c757d;
}

.current-indicator {
  color: #28a745;
  font-weight: bold;
}
</style>
```

## 环境变量

### 环境配置文件

`.env`：
```env
# 钱包配置
NUXT_PUBLIC_WALLET_AUTO_CONNECT=true
NUXT_PUBLIC_WALLET_TIMEOUT=5000
NUXT_PUBLIC_WALLET_THEME=auto

# API 配置
NUXT_PUBLIC_WALLET_API_URL=https://api.btc-connect.dev
NUXT_WALLET_API_SECRET=your-secret-key

# 功能开关
NUXT_PUBLIC_ENABLE_WALLET_MODAL=true
NUXT_PUBLIC_ENABLE_AUTO_CONNECT=true
NUXT_PUBLIC_ENABLE_TESTNET=false
```

`.env.development`：
```env
NUXT_PUBLIC_WALLET_AUTO_CONNECT=true
NUXT_PUBLIC_ENABLE_TESTNET=true
NUXT_PUBLIC_WALLET_API_URL=http://localhost:3000
```

`.env.production`：
```env
NUXT_PUBLIC_WALLET_AUTO_CONNECT=false
NUXT_PUBLIC_ENABLE_TESTNET=false
NUXT_PUBLIC_WALLET_API_URL=https://api.btc-connect.dev
```

### 在代码中使用

```typescript
// plugins/btc-connect.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  nuxtApp.vueApp.use(BTCWalletPlugin, {
    autoConnect: config.public.walletAutoConnect,
    connectTimeout: config.public.walletTimeout,
    theme: config.public.walletTheme,
    config: {
      showTestnet: config.public.enableTestnet,
      showRegtest: process.env.NODE_ENV === 'development'
    }
  });
});
```

```vue
<script setup>
const config = useRuntimeConfig();

// 客户端配置
const api_url = config.public.walletApiUrl;

// 服务端配置 (仅在服务端可用)
const api_secret = config.walletApiSecret;
</script>
```

## 部署配置

### Vercel 部署

`vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": ".output/public"
      }
    }
  ],
  "functions": {
    "app/**/*.ts": {
      "maxDuration": 30
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "NUXT_PUBLIC_WALLET_API_URL": "@wallet-api-url"
  }
}
```

### Netlify 部署

`netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[functions]
  directory = ".output/server"
```

### Docker 配置

`Dockerfile`：

```dockerfile
FROM node:18-alpine

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

ENV NUXT_HOST=0.0.0.0
ENV PORT=3000

CMD ["npm", "start"]
```

`docker-compose.yml`：

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NUXT_HOST=0.0.0.0
      - PORT=3000
      - NUXT_PUBLIC_WALLET_API_URL=http://localhost:8080
    volumes:
      - .:/app
      - /app/node_modules
```

### GitHub Actions

`.github/workflows/deploy.yml`：

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          NUXT_PUBLIC_WALLET_API_URL: ${{ secrets.WALLET_API_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 性能优化

### 组件懒加载

```vue
<!-- pages/wallet.vue -->
<template>
  <div>
    <h1>钱包功能</h1>

    <!-- 基础组件立即加载 -->
    <ConnectButton />

    <!-- 高级组件懒加载 -->
    <LazyWalletInfo v-if="showWalletInfo" />
    <LazyNetworkSwitcher v-if="showNetworkSwitcher" />
    <LazyTransactionHistory v-if="showTransactions" />

    <button @click="showWalletInfo = !showWalletInfo">
      切换钱包信息
    </button>
  </div>
</template>

<script setup>
const showWalletInfo = ref(false);
const showNetworkSwitcher = ref(false);
const showTransactions = ref(false);
</script>
```

### 组合式函数优化

```typescript
// composables/useWalletOptimized.ts
import { computed, shallowRef } from 'vue';
import { useWallet, useWalletEvent } from '@btc-connect/vue';

export function useWalletOptimized() {
  const {
    isConnected,
    address,
    balance,
    currentWallet,
    network,
    connect,
    disconnect,
    utils
  } = useWallet();

  // 使用 shallowRef 减少响应式开销
  const isLoading = shallowRef(false);
  const lastError = shallowRef<string | null>(null);

  // 缓存计算结果
  const formattedAddress = computed(() => {
    if (!address.value) return '';
    return utils.formatAddress(address.value, { startChars: 6, endChars: 4 });
  });

  const formattedBalance = computed(() => {
    if (!balance.value) return '0 BTC';
    return utils.formatBalance(balance.value, { unit: 'BTC' });
  });

  // 优化的连接函数
  const handleConnect = async (walletId: string) => {
    if (isLoading.value) return;

    isLoading.value = true;
    lastError.value = null;

    try {
      await connect(walletId);
    } catch (error) {
      lastError.value = (error as Error).message;
    } finally {
      isLoading.value = false;
    }
  };

  // 事件监听优化
  useWalletEvent('connect', () => {
    isLoading.value = false;
    lastError.value = null;
  });

  useWalletEvent('error', (error) => {
    isLoading.value = false;
    lastError.value = error.message;
  });

  return {
    isConnected,
    address,
    balance,
    currentWallet,
    network,
    isLoading,
    lastError,
    formattedAddress,
    formattedBalance,
    handleConnect,
    disconnect,
    utils
  };
}
```

### 缓存策略

```typescript
// utils/walletCache.ts
import type { AccountInfo, WalletInfo } from '@btc-connect/core';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class WalletCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5分钟

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const walletCache = new WalletCache();

// 定期清理缓存
if (process.client) {
  setInterval(() => {
    walletCache.cleanup();
  }, 60000); // 每分钟清理一次
}
```

### 请求优化

```typescript
// composables/useWalletData.ts
import { ref, computed, watch } from 'vue';
import { useWallet } from '@btc-connect/vue';

export function useWalletData() {
  const { isConnected, address } = useWallet();

  const balance = ref<number | null>(null);
  const transactions = ref<any[]>([]);
  const isLoading = ref(false);

  // 监听地址变化，自动获取数据
  watch(address, async (newAddress) => {
    if (!newAddress) {
      balance.value = null;
      transactions.value = [];
      return;
    }

    isLoading.value = true;

    try {
      // 并行获取数据
      const [balanceResult, txResult] = await Promise.all([
        fetchBalance(newAddress),
        fetchTransactions(newAddress)
      ]);

      balance.value = balanceResult;
      transactions.value = txResult;
    } catch (error) {
      console.error('获取钱包数据失败:', error);
    } finally {
      isLoading.value = false;
    }
  }, { immediate: true });

  const formattedBalance = computed(() => {
    if (!balance.value) return '0 BTC';
    return (balance.value / 100000000).toFixed(8) + ' BTC';
  });

  return {
    balance,
    transactions,
    isLoading,
    formattedBalance
  };
}

async function fetchBalance(address: string): Promise<number> {
  const response = await $fetch(`/api/wallet/balance?address=${address}`);
  return response.balance;
}

async function fetchTransactions(address: string): Promise<any[]> {
  const response = await $fetch(`/api/wallet/transactions?address=${address}`);
  return response.transactions;
}
```

## 常见问题

### Q: 为什么在 SSR 中出现 "window is not defined" 错误？

A: btc-connect 需要在浏览器环境中运行。确保：

1. 插件文件名包含 `.client` 后缀
2. 使用 `<ClientOnly>` 组件包装钱包相关组件
3. 在组合式函数中检查 `process.client`

```typescript
export function useWalletSafe() {
  if (process.server) {
    // 返回默认值
    return {
      isConnected: ref(false),
      address: ref(''),
      // ...其他默认值
    };
  }

  return useWallet();
}
```

### Q: 如何处理路由切换时的钱包状态保持？

A: 使用 `keepalive` 配置或在布局中提供钱包状态：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/wallet/**': { ssr: false }
  }
});
```

### Q: 如何在多个页面间共享钱包状态？

A: 在插件中全局注册或使用 Pinia 状态管理：

```typescript
// plugins/btc-connect.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BTCWalletPlugin, options);

  // 提供全局钱包实例
  const wallet = useWallet();
  nuxtApp.provide('wallet', wallet);
});

// 在其他页面中使用
const wallet = inject('wallet') as ReturnType<typeof useWallet>;
```

### Q: 如何优化包大小？

A: 使用动态导入和代码分割：

```typescript
// components/WalletModal.vue
export default defineComponent({
  async setup() {
    // 动态导入大型组件
    const { default: HeavyComponent } = await import('./HeavyComponent.vue');

    return () => h(HeavyComponent);
  }
});
```

### Q: 如何处理钱包连接的超时问题？

A: 配置合适的超时时间和重试机制：

```typescript
// composables/useWalletWithRetry.ts
export function useWalletWithRetry() {
  const { connect } = useWallet();

  const connectWithRetry = async (walletId: string, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await connect(walletId);
      } catch (error) {
        if (i === maxRetries - 1) throw error;

        // 指数退避
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  };

  return { connectWithRetry };
}
```

## 完整示例

### 项目结构

```
btc-nuxt-app/
├── plugins/
│   ├── btc-connect.client.ts
│   ├── wallet-composables.client.ts
│   └── wallet-middleware.client.ts
├── composables/
│   ├── useWalletState.ts
│   ├── useWalletData.ts
│   └── useWalletOptimized.ts
├── components/
│   ├── ConnectButton.vue
│   ├── WalletInfo.vue
│   ├── NetworkSwitcher.vue
│   ├── TransactionHistory.vue
│   └── ui/
│       ├── LoadingSpinner.vue
│       └── ErrorMessage.vue
├── pages/
│   ├── index.vue
│   ├── wallet.vue
│   ├── transactions.vue
│   └── settings.vue
├── layouts/
│   ├── default.vue
│   └── wallet.vue
├── middleware/
│   └── wallet-auth.ts
├── server/api/
│   ├── wallet/
│   │   ├── balance.get.ts
│   │   └── transactions.get.ts
├── assets/
│   ├── css/
│   │   └── main.css
│   └── images/
├── utils/
│   ├── walletCache.ts
│   └── formatters.ts
├── .env
├── .env.example
├── nuxt.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 主布局

`layouts/default.vue`：

```vue
<template>
  <div class="app-layout">
    <header class="app-header">
      <nav>
        <NuxtLink to="/">首页</NuxtLink>
        <NuxtLink to="/wallet">钱包</NuxtLink>
        <NuxtLink to="/transactions">交易</NuxtLink>
      </nav>

      <div class="header-actions">
        <ThemeSwitcher />
        <ClientOnly>
          <ConnectButton />
        </ClientOnly>
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>

    <footer class="app-footer">
      <p>&copy; 2024 BTC Connect Nuxt App</p>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  padding: 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header nav {
  display: flex;
  gap: 2rem;
}

.app-header a {
  text-decoration: none;
  color: #495057;
  font-weight: 500;
}

.app-header a:hover,
.app-header a.router-link-active {
  color: #007bff;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #e9ecef;
  color: #6c757d;
}
</style>
```

### 钱包页面

`pages/wallet.vue`：

```vue
<template>
  <div class="wallet-page">
    <div class="wallet-header">
      <h1>比特币钱包</h1>
      <p class="subtitle">管理和操作您的比特币资产</p>
    </div>

    <div class="wallet-content">
      <!-- 连接状态 -->
      <div class="connection-section">
        <ClientOnly>
          <ConnectStatus @connect="handleConnect" />
        </ClientOnly>
      </div>

      <!-- 钱包信息 -->
      <div class="info-section">
        <ClientOnly>
          <LazyWalletInfo v-if="isConnected" />
        </ClientOnly>
      </div>

      <!-- 功能区域 -->
      <div class="features-section" v-if="isConnected">
        <div class="features-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
          >
            {{ tab.name }}
          </button>
        </div>

        <div class="tab-content">
          <ClientOnly>
            <LazyNetworkSwitcher v-if="activeTab === 'network'" />
            <LazyTransactionHistory v-if="activeTab === 'transactions'" />
            <LazyWalletSettings v-if="activeTab === 'settings'" />
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useWalletState } from '~/composables/useWalletState';

const { isConnected } = useWalletState();
const activeTab = ref('network');

const tabs = [
  { id: 'network', name: '网络管理' },
  { id: 'transactions', name: '交易历史' },
  { id: 'settings', name: '钱包设置' }
];

const handleConnect = (walletId: string) => {
  console.log('Connected to wallet:', walletId);
};

// SEO 配置
useHead({
  title: '比特币钱包 - BTC Connect',
  meta: [
    { name: 'description', content: '管理和操作您的比特币资产' }
  ]
});

// 面包守卫
definePageMeta({
  middleware: ['wallet-auth']
});
</script>

<style scoped>
.wallet-page {
  max-width: 1200px;
  margin: 0 auto;
}

.wallet-header {
  text-align: center;
  margin-bottom: 3rem;
}

.wallet-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.125rem;
  color: #6c757d;
}

.connection-section {
  margin-bottom: 2rem;
}

.info-section {
  margin-bottom: 2rem;
}

.features-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
}

.features-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #6c757d;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #495057;
}

.tab-btn.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-content {
  min-height: 300px;
}
</style>
```

### 组合式函数

`composables/useWalletState.ts`：

```typescript
import { ref, computed } from 'vue';
import { useWallet, useWalletEvent } from '@btc-connect/vue';

export function useWalletState() {
  const {
    isConnected,
    address,
    balance,
    currentWallet,
    network,
    connect,
    disconnect,
    utils
  } = useWallet();

  const isLoading = ref(false);
  const lastError = ref<string | null>(null);

  // 缓存计算结果
  const formattedAddress = computed(() => {
    if (!address.value) return '';
    return utils.formatAddress(address.value, {
      startChars: 6,
      endChars: 4
    });
  });

  const formattedBalance = computed(() => {
    if (!balance.value) return '0 BTC';
    return utils.formatBalance(balance.value, { unit: 'BTC' });
  });

  const walletIcon = computed(() => {
    return currentWallet.value?.icon || '/images/wallet-default.png';
  });

  // 连接处理
  const handleConnect = async (walletId: string) => {
    if (isLoading.value) return;

    isLoading.value = true;
    lastError.value = null;

    try {
      await connect(walletId);
    } catch (error) {
      lastError.value = (error as Error).message;
    } finally {
      isLoading.value = false;
    }
  };

  // 断开连接处理
  const handleDisconnect = async () => {
    try {
      await disconnect();
      lastError.value = null;
    } catch (error) {
      lastError.value = (error as Error).message;
    }
  };

  // 事件监听
  useWalletEvent('connect', () => {
    isLoading.value = false;
    lastError.value = null;
  });

  useWalletEvent('error', (error) => {
    isLoading.value = false;
    lastError.value = error.message;
  });

  useWalletEvent('disconnect', () => {
    lastError.value = null;
  });

  return {
    // 响应式状态
    isConnected,
    address,
    balance,
    currentWallet,
    network,
    isLoading,
    lastError,

    // 计算属性
    formattedAddress,
    formattedBalance,
    walletIcon,

    // 方法
    handleConnect,
    handleDisconnect,

    // 工具函数
    utils
  };
}
```

### 中间件

`middleware/wallet-auth.ts`：

```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  const wallet = useWallet();

  // 检查页面是否需要钱包连接
  if (to.meta.requiresWallet && !wallet.isConnected.value) {
    // 显示提示或重定向
    const nuxtApp = useNuxtApp();

    // 可以使用 toast 或其他提示方式
    console.log('需要连接钱包才能访问此页面');

    // 重定向到钱包连接页面
    return navigateTo('/wallet');
  }

  // 检查特定网络要求
  if (to.meta.requiredNetwork && wallet.network.value !== to.meta.requiredNetwork) {
    console.log(`需要 ${to.meta.requiredNetwork} 网络`);
    return navigateTo('/wallet');
  }
});
```

---

更多详细信息请参考：
- [📘 完整API文档](./api.md)
- [🎯 统一指南](../UNIFICATION_GUIDE.md)
- [📝 变更记录](../CHANGELOG.md)
- [📖 快速开始](../QUICK_START.md)
- [Nuxt.js 官方文档](https://nuxt.com/docs)