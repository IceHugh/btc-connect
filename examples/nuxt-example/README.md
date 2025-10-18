# BTC Connect - Nuxt 3 Example

这是一个使用 Nuxt 3 框架演示 @btc-connect/vue 包的完整示例，重点展示 SSR（服务器端渲染）兼容性。

## 特性

- ✅ **SSR 兼容**: 基于 onMounted 策略，优先支持普通 Vue 项目
- ✅ **完整功能**: 展示所有 @btc-connect/vue 的核心功能
- ✅ **性能优化**: 使用性能监控和优化策略
- ✅ **现代 UI**: 基于 Tailwind CSS 的响应式设计
- ✅ **TypeScript**: 完整的类型支持
- ✅ **多钱包支持**: UniSat、OKX、Xverse 等主流比特币钱包

## 快速开始

### 安装依赖

```bash
# 进入项目目录
cd examples/nuxt-example

# 安装依赖
bun install
```

### 开发模式

```bash
# 启动开发服务器
bun run dev
```

访问 [http://localhost:3001](http://localhost:3001) 查看示例。

### 构建和预览

```bash
# 构建生产版本
bun run build

# 预览生产版本
bun run preview
```

### 静态生成

```bash
# 生成静态站点
bun run generate
```

## 项目结构

```
nuxt-example/
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
│   └── btc-connect.client.ts     # BTC Connect 插件
├── nuxt.config.ts               # Nuxt 配置
├── package.json                 # 项目配置
├── README.md                    # 项目文档
└── tsconfig.json               # TypeScript 配置
```

## SSR 兼容性设计

### 插件策略

使用 `.client.ts` 后缀确保 BTC Connect 插件只在客户端加载：

```typescript
// plugins/btc-connect.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    nuxtApp.vueApp.use(BTCWalletPlugin, {
      autoConnect: true,
      // ... 其他配置
    })
  }
})
```

### 组件 SSR 保护

所有使用 BTC Connect 功能的组件都使用 `ClientOnly` 包装：

```vue
<template>
  <ClientOnly>
    <WalletStatusCard />
  </ClientOnly>
</template>
```

### 状态检测

首页提供详细的 SSR 状态检测：

- 客户端检测
- 水合完成状态
- 组件挂载状态

## 功能演示

### 1. 钱包连接

- 支持多钱包选择
- 自动连接功能
- 连接状态实时显示

### 2. 账户管理

- 地址显示和复制
- 余额信息展示
- 网络状态监控

### 3. 交易功能

- 比特币发送
- 交易历史记录
- 矿工费设置

### 4. 性能监控

- 连接时间监控
- 内存使用统计
- 网络状态检测
- 缓存状态管理

### 5. SSR 测试

- 渲染模式显示
- 水合过程监控
- 性能指标展示

## 配置选项

### BTC Connect 插件配置

```typescript
// plugins/btc-connect.client.ts
nuxtApp.vueApp.use(BTCWalletPlugin, {
  autoConnect: true,           // 自动连接
  connectTimeout: 10000,       // 连接超时时间
  theme: 'light',              // 主题设置
  config: {
    walletOrder: ['unisat', 'okx', 'xverse'],
    featuredWallets: ['unisat', 'okx'],
    showTestnet: false,
    showRegtest: false
  }
})
```

### Nuxt 配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
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
  }
})
```

## 支持的钱包

- **UniSat**: Chrome 扩展钱包
- **OKX**: 多链钱包
- **Xverse**: Bitcoin 生态钱包

## 开发指南

### 添加新组件

1. 在 `components/` 目录下创建组件
2. 使用 `ClientOnly` 包装需要 BTC Connect 功能的组件
3. 在页面中导入和使用组件

### 自定义样式

修改 `assets/css/main.css` 文件来自定义样式。

### 调试 SSR 问题

1. 检查浏览器控制台的水合错误
2. 使用 Vue DevTools 检查组件状态
3. 查看网络面板确认客户端初始化

## 技术栈

- **框架**: Nuxt 3 + Vue 3
- **样式**: Tailwind CSS
- **类型**: TypeScript
- **钱包库**: @btc-connect/vue
- **构建工具**: Vite

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！