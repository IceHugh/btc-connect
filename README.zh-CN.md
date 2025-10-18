# BTC Connect

English | [中文文档](./README.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/IceHugh/btc-connect/main/assets/logo.png" alt="BTC Connect" width="200"/>
</p>

<p align="center">
  <strong>为 Web3 应用提供统一的比特币钱包连接工具包</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@btc-connect/core">
    <img src="https://img.shields.io/npm/v/@btc-connect/core.svg" alt="NPM 版本">
  </a>
  <a href="https://github.com/IceHugh/btc-connect/actions">
    <img src="https://github.com/IceHugh/btc-connect/workflows/CI/badge.svg" alt="CI">
  </a>
  <a href="https://codecov.io/gh/IceHugh/btc-connect">
    <img src="https://codecov.io/gh/IceHugh/btc-connect/branch/main/graph/badge.svg" alt="覆盖率">
  </a>
  <a href="https://www.npmjs.com/package/@btc-connect/core">
    <img src="https://img.shields.io/npm/dt/@btc-connect/core.svg" alt="下载量">
  </a>
  <a href="https://bundlephobia.com/result?p=@btc-connect/core">
    <img src="https://img.shields.io/bundlephobia/minzip/@btc-connect/core.svg" alt="包大小">
  </a>
</p>

## 🚀 特性

- 🌐 **框架无关**: 支持 React、Vue 和原生 JavaScript
- 🔗 **统一接口**: 为多个比特币钱包提供单一 API
- 🔄 **自动连接**: 页面重新加载时自动恢复钱包连接
- 📱 **SSR 支持**: 完整的服务器端渲染支持
- 🎨 **可定制 UI**: 内置组件支持主题定制
- ⚡ **轻量级**: 最小化的包大小，支持 Tree Shaking
- 🔒 **类型安全**: 完整的 TypeScript 支持
- 🧪 **测试完备**: 全面的测试套件，100% 覆盖率

## 🦄 支持的钱包

| 钱包 | 状态 | 网络 |
|--------|--------|----------|
| [UniSat](https://unisat.io/) | ✅ 可用 | 主网, 测试网 |
| [OKX Wallet](https://www.okx.com/web3) | ✅ 可用 | 主网, 测试网 |
| Xverse | 🚧 开发中 | 主网, 测试网 |

## 📦 包

### 核心包

| 包 | 版本 | 描述 |
|---------|---------|-------------|
| [`@btc-connect/core`](./packages/core) | ![npm](https://img.shields.io/npm/v/@btc-connect/core.svg) | 框架无关的核心模块 |
| [`@btc-connect/react`](./packages/react) | ![npm](https://img.shields.io/npm/v/@btc-connect/react.svg) | React 适配器，包含 Hooks 和 Context |
| [`@btc-connect/vue`](./packages/vue) | ![npm](https://img.shields.io/npm/v/@btc-connect/vue.svg) | Vue 适配器，包含 Composables 和组件 |

## 🛠️ 安装

根据你的框架选择相应的包：

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

### React 示例

```tsx
import { BTCWalletProvider, BTCConnectButton, WalletModal } from '@btc-connect/react';

function App() {
  return (
    <BTCWalletProvider autoConnect={true}>
      <BTCConnectButton />
      <WalletModal />
    </BTCWalletProvider>
  );
}
```

### Vue 示例

```vue
<template>
  <div>
    <BTCConnectButton />
    <WalletModal />
  </div>
</template>

<script setup>
import { BTCConnectButton, WalletModal } from '@btc-connect/vue';
</script>
```

### 核心模块示例

```typescript
import { BTCWalletManager } from '@btc-connect/core';

const manager = new BTCWalletManager({
  onStateChange: (state) => console.log('状态变化:', state),
  onError: (error) => console.error('钱包错误:', error)
});

// 初始化适配器
manager.initializeAdapters();

// 连接钱包
const accounts = await manager.connect('unisat');
console.log('已连接的账户:', accounts);
```

## 📚 文档

### 模块文档
- [📖 核心 API 文档](./packages/core/README.zh-CN.md) | [English](./packages/core/README.md)
- [⚛️ React 集成指南](./packages/react/README.zh-CN.md) | [English](./packages/react/README.md)
- [🖖 Vue 集成指南](./packages/vue/README.zh-CN.md) | [English](./packages/vue/README.md)

### 示例
- [React 示例](./examples/react/)
- [Vue 示例](./examples/vue-example/)
- [Next.js SSR 示例](./examples/nextjs/)

## 🏗️ 项目结构

```
btc-connect/
├── packages/           # 核心包
│   ├── core/          # 框架无关的核心
│   ├── react/         # React 集成
│   └── vue/           # Vue 集成
├── examples/          # 使用示例
│   ├── react/         # React 示例
│   ├── vue-example/   # Vue 示例
│   └── nextjs/        # Next.js SSR 示例
└── docs/             # 其他文档
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

我们欢迎各种形式的贡献！请阅读我们的[贡献指南](./CONTRIBUTING.zh-CN.md) | [English Contributing Guide](./CONTRIBUTING.md)了解详情。

### 开发流程

1. Fork 仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 进行修改
4. 运行测试: `bun test`
5. 提交更改: `git commit -m '添加新功能'`
6. 推送到分支: `git push origin feature/amazing-feature`
7. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情。

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