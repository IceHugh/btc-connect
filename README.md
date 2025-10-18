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
- 🔄 **Auto Connection**: Seamless wallet reconnection on page reload
- 📱 **SSR Support**: Full support for server-side rendering
- 🎨 **Customizable UI**: Built-in components with theming support
- ⚡ **Lightweight**: Minimal bundle size with tree-shaking support
- 🔒 **Type Safe**: Full TypeScript support
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

### React Example

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

### Vue Example

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

### Core Example

```typescript
import { BTCWalletManager } from '@btc-connect/core';

const manager = new BTCWalletManager({
  onStateChange: (state) => console.log('State changed:', state),
  onError: (error) => console.error('Wallet error:', error)
});

// Initialize adapters
manager.initializeAdapters();

// Connect wallet
const accounts = await manager.connect('unisat');
console.log('Connected accounts:', accounts);
```

## 📚 Documentation

### Module Documentation
- [📖 Core API Documentation](./packages/core/README.md) | [中文文档](./packages/core/README.zh-CN.md)
- [⚛️ React Integration Guide](./packages/react/README.md) | [中文文档](./packages/react/README.zh-CN.md)
- [🖖 Vue Integration Guide](./packages/vue/README.md) | [中文文档](./packages/vue/README.zh-CN.md)

### Examples
- [React Example](./examples/react/)
- [Vue Example](./examples/vue-example/)
- [Next.js SSR Example](./examples/nextjs/)

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