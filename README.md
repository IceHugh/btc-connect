# BTC Connect

[中文文档](./README.zh-CN.md) | English

<p align="center">
  <img src="https://raw.githubusercontent.com/IceHugh/btc-connect/main/assets/logo.png" alt="BTC Connect" width="200"/>
</p>

<p align="center">
  <strong>A unified Bitcoin wallet connection toolkit for Web3 applications</strong>
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

## 🚀 Features

- 🌐 **Framework Agnostic**: Works with React, Vue, and vanilla JavaScript
- 🔗 **Unified Interface**: Single API for multiple Bitcoin wallets
- 🎯 **Unified Hooks/Composables**: React and Vue provide completely consistent interfaces
- 🎣 **Enhanced useWallet**: Single access point for all wallet functionality
- 🔄 **Auto Connection**: Seamless wallet reconnection on page reload
- 📱 **SSR Support**: Full support for server-side rendering
- 🎨 **Advanced Theme System**: Light/dark/auto themes with customization
- 📊 **Event Management**: Cross-framework event listening with auto-cleanup
- 🎛️ **Wallet Manager**: Advanced wallet adapter management
- 🛠️ **Rich Utility Functions**: 10+ cross-framework utility functions
- ⚡ **Lightweight**: Minimal bundle size with tree-shaking support
- 🔒 **Type Safe**: Full TypeScript support with unified type system
- 🧪 **Well Tested**: Comprehensive test suite with 100% coverage

## 🦄 Supported Wallets

| Wallet | Status | Networks |
|--------|--------|----------|
| [UniSat](https://unisat.io/) | ✅ Active | Mainnet, Testnet |
| [OKX Wallet](https://www.okx.com/web3) | ✅ Active | Mainnet, Testnet |
| Xverse | 🚧 In Development | Mainnet, Testnet |

## 📦 Packages

### Core Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`@btc-connect/core`](./packages/core) | ![npm](https://img.shields.io/npm/v/@btc-connect/core.svg) | Framework-agnostic core module |
| [`@btc-connect/react`](./packages/react) | ![npm](https://img.shields.io/npm/v/@btc-connect/react.svg) | React adapter with Hooks and Context |
| [`@btc-connect/vue`](./packages/vue) | ![npm](https://img.shields.io/npm/v/@btc-connect/vue.svg) | Vue adapter with Composables and Components |

## 🛠️ Installation

Choose the package that matches your framework:

### Core (Framework Agnostic)

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

## 🎯 Quick Start

### 🚀 5分钟快速开始

1. **安装包**
```bash
# React
npm install @btc-connect/react

# Vue
npm install @btc-connect/vue

# 核心 (框架无关)
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

### 🏗️ 项目示例
- [React示例](./examples/react/) - 基础React集成示例
- [Vue示例](./examples/vue-example/) - 基础Vue集成示例
- [Next.js示例](./examples/nextjs/) - Next.js SSR完整示例
- [Nuxt.js示例](./examples/nuxt-example/) - Nuxt 3 SSR完整示例

## 🏗️ Project Structure

```
btc-connect/
├── packages/           # Core packages
│   ├── core/          # Framework-agnostic core
│   ├── react/         # React integration
│   └── vue/           # Vue integration
├── examples/          # Usage examples
│   ├── react/         # React example
│   ├── vue-example/   # Vue example
│   └── nextjs/        # Next.js SSR example
└── docs/             # Additional documentation
```

## 🧪 Development

### Prerequisites

- Node.js >= 18
- Bun >= 1.0
- TypeScript >= 5.0

### Setup

```bash
# Clone the repository
git clone https://github.com/IceHugh/btc-connect.git
cd btc-connect

# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun test

# Start development mode
bun dev
```

### Testing

```bash
# Run all tests
bun test

# Run tests for specific package
bun test packages/core
bun test packages/react
bun test packages/vue

# Run tests with coverage
bun test --coverage
```

## 🤝 Contributing

We welcome all kinds of contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) | [中文贡献指南](./CONTRIBUTING.zh-CN.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `bun test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [UniSat](https://unisat.io/) - Bitcoin wallet provider
- [OKX](https://www.okx.com/web3) - Web3 wallet provider
- [React](https://reactjs.org/) - UI framework
- [Vue](https://vuejs.org/) - Progressive framework

## 📞 Support

- 📧 Email: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [Issues](https://github.com/IceHugh/btc-connect/issues)
- 📖 [Documentation](https://docs.btc-connect.dev)

---

<div align="center">
  <p>Made with ❤️ by the BTC Connect team</p>
  <p>
    <a href="#top">Back to top</a>
  </p>
</div>
