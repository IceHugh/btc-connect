[根目录](../../CLAUDE.md) > [examples](../) > **nuxt-example**

# Nuxt 3 示例项目

## 变更记录 (Changelog)

### 2025-10-18 09:27:07
- 完成 Nuxt 3 示例项目文档生成
- 添加 SSR 兼容性详细说明和技术实现
- 补充性能监控和优化策略文档
- 记录客户端插件加载和组件保护机制

## 项目概述

这是一个展示如何在 Nuxt 3 应用中实现完整 SSR 兼容的 btc-connect 集成示例。该示例重点演示了服务器端渲染兼容性、客户端插件加载、性能监控和优化策略，是 btc-connect 在现代 Vue 全栈框架中的最佳实践展示。

## 项目结构

```
examples/nuxt-example/
├── assets/
│   └── css/
│       └── main.css              # 样式文件
├── components/
│   ├── BalanceInfoCard.vue       # 余额信息卡片
│   ├── NetworkInfoCard.vue       # 网络信息卡片
│   ├── PerformanceMonitorCard.vue # 性能监控卡片
│   ├── TransactionCard.vue       # 交易功能卡片
│   ├── TransactionDialog.vue     # 交易对话框
│   ├── WalletActionCard.vue      # 钱包操作卡片
│   ├── WalletModal.vue           # 钱包选择模态框
│   └── WalletStatusCard.vue      # 钱包状态卡片
├── layouts/
├── pages/
│   └── index.vue                 # 主页
├── plugins/
│   └── btc-connect.client.ts     # BTC Connect 客户端插件
├── nuxt.config.ts               # Nuxt 配置
├── package.json                 # 项目配置
├── README.md                    # 项目说明
├── CLAUDE.md                    # AI 助手文档
└── tsconfig.json               # TypeScript 配置
```

## 核心功能演示

### 1. SSR 兼容的客户端插件

项目使用 `.client.ts` 后缀确保 BTC Connect 插件只在客户端加载，避免 SSR 水合错误：

```typescript
// plugins/btc-connect.client.ts
import { BTCWalletPlugin } from '@btc-connect/vue'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    nuxtApp.vueApp.use(BTCWalletPlugin, {
      autoConnect: true,
      connectTimeout: 10000,
      theme: 'light',
      config: {
        walletOrder: ['unisat', 'okx', 'xverse'],
        featuredWallets: ['unisat', 'okx'],
        showTestnet: false,
        showRegtest: false
      }
    })
  }
})
```

### 2. 组件 SSR 保护

所有使用 BTC Connect 功能的组件都使用 `ClientOnly` 包装：

```vue
<template>
  <div>
    <!-- 普通内容可以正常 SSR -->
    <h1>Wallet Demo</h1>
    <p>This content is server-side rendered.</p>

    <!-- BTC Connect 组件需要客户端渲染 -->
    <ClientOnly>
      <WalletStatusCard />
      <BalanceInfoCard />
      <NetworkInfoCard />
    </ClientOnly>
  </div>
</template>
```

### 3. 性能监控系统

示例包含完整的性能监控组件，实时显示：

- 连接时间统计
- 内存使用情况
- 网络状态检测
- 缓存命中率
- 组件渲染性能

```vue
<!-- components/PerformanceMonitorCard.vue -->
<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-semibold mb-4">Performance Monitor</h3>

    <div class="space-y-2">
      <div class="flex justify-between">
        <span>Connection Time:</span>
        <span>{{ connectionTime }}ms</span>
      </div>
      <div class="flex justify-between">
        <span>Memory Usage:</span>
        <span>{{ memoryUsage }}MB</span>
      </div>
      <div class="flex justify-between">
        <span>Cache Hit Rate:</span>
        <span>{{ cacheHitRate }}%</span>
      </div>
    </div>
  </div>
</template>
```

### 4. 完整的钱包功能

项目展示了所有核心钱包功能：

- **钱包连接**: 多钱包选择和自动连接
- **账户管理**: 地址显示、余额查询、网络状态
- **交易功能**: 比特币发送、交易历史
- **签名功能**: 消息签名、PSBT 签名
- **事件监听**: 实时状态更新

### 5. SSR 状态检测

主页提供详细的 SSR 状态检测面板：

```vue
<template>
  <div>
    <!-- SSR 状态检测 -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3>SSR Status</h3>
      <div class="space-y-1">
        <p>Client Side: {{ isClient }}</p>
        <p>Hydrated: {{ isHydrated }}</p>
        <p>Mounted: {{ isMounted }}</p>
      </div>
    </div>

    <!-- 钱包功能区域 -->
    <ClientOnly>
      <!-- 所有钱包相关组件 -->
    </ClientOnly>
  </div>
</template>
```

## SSR 兼容性技术实现

### 核心原则

1. **客户端插件**: 使用 `.client.ts` 后缀确保插件只在客户端加载
2. **组件保护**: 使用 `ClientOnly` 包装所有钱包相关组件
3. **条件渲染**: 在组件内部进行客户端检测
4. **状态隔离**: 确保服务器端和客户端状态的一致性

### 实现步骤

1. **创建客户端插件**
   ```typescript
   // plugins/btc-connect.client.ts
   export default defineNuxtPlugin((nuxtApp) => {
     if (process.client) {
       // 仅在客户端执行
     }
   })
   ```

2. **组件包装保护**
   ```vue
   <ClientOnly>
     <WalletComponents />
   </ClientOnly>
   ```

3. **状态检测逻辑**
   ```vue
   <script setup>
   const isClient = process.client
   const isMounted = ref(false)

   onMounted(() => {
     isMounted.value = true
   })
   </script>
   ```

### 验证方法

1. **查看页面源代码**: 确认基础内容被 SSR
2. **禁用 JavaScript**: 验证基础内容仍可见
3. **启用 JavaScript**: 确认钱包组件变为可交互
4. **检查控制台**: 确认无水合错误

## 运行与开发

### 环境要求
- Node.js >= 18
- Nuxt 3 >= 3.0
- Vue 3 >= 3.0
- TypeScript >= 5.0

### 安装和运行
```bash
# 进入示例目录
cd examples/nuxt-example

# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 构建生产版本
bun run build

# 预览生产版本
bun run preview

# 生成静态站点
bun run generate
```

### 开发服务器
- 默认端口: 3001
- 热重载: 支持
- TypeScript 类型检查: 实时
- SSR 支持: 完整支持

## 配置说明

### Nuxt 配置
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 模块配置
  modules: ['@nuxtjs/tailwindcss'],

  // 构建配置
  build: {
    transpile: ['@btc-connect/vue']
  },

  // SSR 配置
  ssr: true,

  // 开发服务器配置
  devServer: {
    port: 3001
  },

  // TypeScript 配置
  typescript: {
    strict: true
  }
})
```

### 依赖配置
```json
{
  "name": "example-nuxt",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "dependencies": {
    "@btc-connect/core": "workspace:*",
    "@btc-connect/vue": "workspace:*",
    "nuxt": "^3.14.1592",
    "vue": "^3.5.12",
    "vue-router": "^4.4.5"
  },
  "devDependencies": {
    "@nuxtjs/tailwindcss": "^6.12.2",
    "typescript": "~5.8.3"
  }
}
```

## 测试指南

### SSR 测试步骤

1. **基础 SSR 测试**
   ```bash
   bun run build
   bun run preview
   # 访问 http://localhost:3001
   # 查看页面源代码，确认服务器端渲染内容
   ```

2. **水合测试**
   - 打开浏览器开发者工具
   - 禁用 JavaScript，刷新页面
   - 确认基础内容可见
   - 启用 JavaScript，确认钱包组件变为可交互
   - 检查控制台无水合错误

3. **性能测试**
   - 使用 Lighthouse 测试页面性能
   - 观察性能监控面板的数据
   - 验证连接时间和内存使用

4. **功能测试**
   - 测试钱包连接功能
   - 验证余额查询
   - 测试交易发送（测试网络）
   - 检查事件监听器

### 调试技巧

1. **SSR 调试**
   ```typescript
   // 在组件中添加调试信息
   console.log('SSR Render:', process.server)
   console.log('Client Render:', process.client)
   ```

2. **水合调试**
   ```bash
   # 启动开发时启用详细日志
   DEBUG=nuxt:* bun run dev
   ```

3. **性能调试**
   ```vue
   <script setup>
   // 性能监控
   const startTime = Date.now()

   onMounted(() => {
     console.log('Mount time:', Date.now() - startTime)
   })
   </script>
   ```

## 常见问题

### Q: 如何处理 SSR 环境下的钱包检测？
A: 使用客户端插件和组件保护：
```typescript
// plugins/btc-connect.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    nuxtApp.vueApp.use(BTCWalletPlugin)
  }
})
```

### Q: 如何避免水合错误？
A: 确保服务器端和客户端渲染一致：
- 使用 `ClientOnly` 包装钱包组件
- 在组件内部进行客户端检测
- 避免在服务端访问浏览器 API

### Q: 如何优化 SSR 性能？
A: 使用以下策略：
- 静态生成不依赖钱包的内容
- 客户端按需加载钱包组件
- 使用缓存策略减少重复请求
- 启用 Gzip 压缩

### Q: 如何监控钱包连接性能？
A: 使用内置的性能监控组件：
```vue
<template>
  <PerformanceMonitorCard />
</template>
```

## 扩展建议

### 功能扩展
1. **多语言支持**: 添加 @nuxtjs/i18n 模块
2. **PWA 支持**: 添加 @vite-pwa/nuxt 模块
3. **API 集成**: 添加 server API 路由
4. **状态管理**: 集成 Pinia 状态管理

### 性能优化
1. **代码分割**: 使用动态导入优化加载
2. **缓存策略**: 实现 SWR 或其他缓存策略
3. **图片优化**: 使用 @nuxt/image 模块
4. **CDN 集成**: 静态资源 CDN 加速

### 开发体验
1. **组件库**: 添加 Nuxt UI 组件库
2. **测试框架**: 添加 Vitest 测试
3. **部署配置**: 添加部署配置文件
4. **监控集成**: 添加错误监控服务

## 相关文件清单

### 核心文件
- `pages/index.vue` - 主页面，展示所有功能
- `plugins/btc-connect.client.ts` - BTC Connect 客户端插件
- `components/` - 所有钱包相关组件
- `assets/css/main.css` - 全局样式

### 配置文件
- `nuxt.config.ts` - Nuxt 配置
- `package.json` - 项目配置
- `tsconfig.json` - TypeScript 配置
- `tailwind.config.js` - Tailwind CSS 配置

### 文档文件
- `README.md` - 项目说明文档
- `CLAUDE.md` - AI 助手专用文档

## 变更记录 (Changelog)

### 2025-10-18 09:27:07
- 完成 Nuxt 3 示例项目文档生成
- 添加 SSR 兼容性详细说明和技术实现
- 补充性能监控和优化策略文档
- 记录客户端插件加载和组件保护机制