# BTC Connect

中文文档 | [English](./README.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/IceHugh/btc-connect/main/assets/logo.png" alt="BTC Connect" width="200"/>
</p>

<p align="center">
  <strong>为 Web3 应用设计的统一比特币钱包连接工具包</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@btc-connect/core">
    <img src="https://img.shields.io/npm/v/@btc-connect/core.svg" alt="NPM Version">
  </a>
  <a href="https://github.com/IceHugh/btc-connect/actions">
    <img src="https://github.com/IceHugh/btc-connect/workflows/CI/badge.svg" alt="CI">
  </a>
  <a href="https://codecov.io/gh/IceHugh/btc-connect">
    <img src="https://codecov.io/gh/IceHugh/btc-connect/branch/main/graph/badge.svg" alt="Coverage">
  </a>
  <a href="https://www.npmjs.com/package/@btc-connect/core">
    <img src="https://img.shields.io/npm/dt/@btc-connect/core.svg" alt="Downloads">
  </a>
  <a href="https://bundlephobia.com/result?p=@btc-connect/core">
    <img src="https://img.shields.io/bundlephobia/minzip/@btc-connect/core.svg" alt="Bundle Size">
  </a>
</p>

## 🚀 特性

- 🌐 **框架无关**: 支持 React、Vue 和原生 JavaScript
- 🔗 **统一接口**: 为多个比特币钱包提供单一 API
- 🎯 **统一 Hooks/Composables**: React 和 Vue 提供完全一致的接口
- 🎣 **增强的 useWallet**: 单一访问点涵盖所有钱包功能
- 🔄 **自动连接**: 页面重新加载时无缝重新连接钱包
- 📱 **SSR 支持**: 完整支持服务器端渲染
- 🎨 **高级主题系统**: 支持亮色/暗色/自动主题和自定义
- 📊 **事件管理**: 跨框架事件监听，自动清理
- 🎛️ **钱包管理器**: 高级钱包适配器管理
- 🛠️ **丰富工具函数**: 10+ 个跨框架工具函数
- ⚡ **轻量级**: 最小包体积，支持 Tree Shaking
- 🔒 **类型安全**: 完整的 TypeScript 支持和统一类型系统
- 🧪 **充分测试**: 完整的测试套件，100% 覆盖率

## 🦄 支持的钱包

| 钱包 | 状态 | 网络 |
|--------|--------|----------|
| [UniSat](https://unisat.io/) | ✅ 活跃 | 主网、测试网 |
| [OKX Wallet](https://www.okx.com/web3) | ✅ 活跃 | 主网、测试网 |
| Xverse | 🚧 开发中 | 主网、测试网 |

## 📦 包

### 核心包

| 包 | 版本 | 描述 |
|---------|---------|-------------|
| [`@btc-connect/core`](./packages/core) | ![npm](https://img.shields.io/npm/v/@btc-connect/core.svg) | 框架无关的核心模块 |
| [`@btc-connect/react`](./packages/react) | ![npm](https://img.shields.io/npm/v/@btc-connect/react.svg) | React 适配器，包含 Hooks 和 Context |
| [`@btc-connect/vue`](./packages/vue) | ![npm](https://img.shields.io/npm/v/@btc-connect/vue.svg) | Vue 适配器，包含 Composables 和组件 |

## 🛠️ 安装

选择适合您框架的包：

### 核心（框架无关）

```bash
npm install @btc-connect/core
```

### React

```bash
npm install @btc-connect/react
```

### Vue

```bash
npm install @btc-connect/vue
```

## 🎯 快速开始

### 🚀 5分钟快速开始

1. **安装包**
```bash
# React
npm install @btc-connect/react

# Vue
npm install @btc-connect/vue

# 核心（框架无关）
npm install @btc-connect/core
```

2. **基础使用**
```tsx
// React
import { BTCWalletProvider, ConnectButton } from '@btc-connect/react';

function App() {
  return (
    <BTCWalletProvider autoConnect={true}>
      <ConnectButton />
    </BTCWalletProvider>
  );
}
```

```vue
<!-- Vue -->
<template>
  <ConnectButton />
</template>

<script setup>
import { ConnectButton } from '@btc-connect/vue';
</script>
```

3. **获取钱包状态**
```tsx
// React
import { useWallet } from '@btc-connect/react';

function WalletInfo() {
  const { isConnected, address, balance, connect, disconnect } = useWallet();

  // 单一 Hook 访问所有功能
  return (
    <div>
      {isConnected ? (
        <div>
          <p>已连接: {address}</p>
          <p>余额: {balance}</p>
          <button onClick={disconnect}>断开</button>
        </div>
      ) : (
        <button onClick={() => connect('unisat')}>连接钱包</button>
      )}
    </div>
  );
}
```

```vue
<!-- Vue -->
<script setup>
import { useWallet } from '@btc-connect/vue';

const { isConnected, address, balance, connect, disconnect } = useWallet();
// 响应式状态，自动更新UI
</script>
```

### 🎯 核心特性

- **统一API**: React和Vue提供完全一致的接口
- **单一访问点**: `useWallet` Hook/Composable 包含所有功能
- **类型安全**: 完整的TypeScript支持
- **SSR兼容**: 完整的服务器端渲染支持
- **丰富功能**: 事件监听、主题管理、工具函数等

### 📚 完整文档

- [📘 完整API文档](./docs/api.md) - 所有API的详细说明和示例
- [🔧 Next.js配置指南](./docs/nextjs.md) - Next.js特殊配置和最佳实践
- [🔧 Nuxt.js配置指南](./docs/nuxt.md) - Nuxt.js特殊配置和最佳实践
- [📖 快速开始](./QUICK_START.md) - 5分钟快速集成指南
- [📝 变更记录](./CHANGELOG.md) - 完整版本变更记录

## 📚 详细文档

### 📖 API 参考
- [📘 完整API文档](./docs/api.md) - 所有API的详细说明和示例
- [🔧 Next.js配置指南](./docs/nextjs.md) - Next.js特殊配置和最佳实践
- [🔧 Nuxt.js配置指南](./docs/nuxt.md) - Nuxt.js特殊配置和最佳实践

### 🏗️ 项目示例
- [React示例](./examples/react/) - 基础React集成示例
- [Vue示例](./examples/vue-example/) - 基础Vue集成示例
- [Next.js示例](./examples/nextjs/) - Next.js SSR完整示例
- [Nuxt.js示例](./examples/nuxt-example/) - Nuxt 3 SSR完整示例

### 🔄 迁移和更新
- [📝 变更日志](./CHANGELOG.md) - 完整版本变更记录

## 🏗️ 项目结构

```
btc-connect/
├── packages/           # 核心包
│   ├── core/          # 框架无关核心
│   ├── react/         # React 集成
│   └── vue/           # Vue 集成
├── examples/          # 使用示例
│   ├── react/         # React 示例
│   ├── vue-example/   # Vue 示例
│   └── nextjs/        # Next.js SSR 示例
└── docs/             # 附加文档
```

## 🧪 开发

### 环境要求

- Node.js >= 18
- Bun >= 1.0
- TypeScript >= 5.0

### 设置

```bash
# 克隆仓库
git clone https://github.com/IceHugh/btc-connect.git
cd btc-connect

# 安装依赖
bun install

# 构建所有包
bun run build

# 运行测试
bun test

# 启动开发模式
bun dev
```

### 测试

```bash
# 运行所有测试
bun test

# 运行特定包的测试
bun test packages/core
bun test packages/react
bun test packages/vue

# 运行测试并生成覆盖率报告
bun test --coverage
```

## 🤝 贡献

我们欢迎所有形式的贡献！请阅读我们的[贡献指南](./CONTRIBUTING.md) | [中文贡献指南](./CONTRIBUTING.zh-CN.md) 了解详情。

### 开发工作流

1. Fork 仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 进行更改
4. 运行测试: `bun test`
5. 提交更改: `git commit -m 'Add amazing feature'`
6. 推送到分支: `git push origin feature/amazing-feature`
7. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参见 [LICENSE](./LICENSE) 文件。

## 🙏 致谢

- [UniSat](https://unisat.io/) - 比特币钱包提供商
- [OKX](https://www.okx.com/web3) - Web3 钱包提供商
- [React](https://reactjs.org/) - UI 框架
- [Vue](https://vuejs.org/) - 渐进式框架

## 📞 支持

- 📧 邮箱: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [问题反馈](https://github.com/IceHugh/btc-connect/issues)
- 📖 [文档](https://docs.btc-connect.dev)

---

<div align="center">
  <p>由 BTC Connect 团队用 ❤️ 制作</p>
  <p>
    <a href="#top">回到顶部</a>
  </p>
</div>