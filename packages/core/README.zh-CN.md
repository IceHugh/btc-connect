# @btc-connect/core

English | [中文文档](./README.zh-CN.md)

<p align="center">
  <strong>框架无关的比特币钱包连接工具包</strong>
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
  <a href="https://bundlephobia.com/result?p=@btc-connect/core">
    <img src="https://img.shields.io/bundlephobia/minzip/@btc-connect/core.svg" alt="包大小">
  </a>
</p>

## 概述

`@btc-connect/core` 是一个框架无关的比特币钱包连接库，为各种比特币钱包提供统一的接口。它采用适配器模式来抽象钱包特定的实现，使得在不同钱包提供商之间切换变得简单。

## 特性

- 🔌 **多钱包支持**: UniSat、OKX、Xverse（以及更多）
- 🎯 **框架无关**: 可与任何JavaScript框架配合使用
- 🔄 **事件驱动**: 内置事件系统，支持实时状态更新
- 🛡️ **类型安全**: 完整的TypeScript支持和严格类型检查
- 📦 **轻量级**: 最小化包大小，支持Tree Shaking
- 🧪 **测试完备**: 全面的测试套件，100%覆盖率

## 安装

```bash
npm install @btc-connect/core
```

## 快速开始

```typescript
import { BTCWalletManager, createWalletManager } from '@btc-connect/core';

// 创建钱包管理器
const manager = new BTCWalletManager({
  onStateChange: (state) => console.log('状态变化:', state),
  onError: (error) => console.error('钱包错误:', error)
});

// 初始化钱包适配器
manager.initializeAdapters();

// 获取可用钱包
const availableWallets = manager.getAvailableWallets();
console.log('可用钱包:', availableWallets);

// 连接钱包
try {
  const accounts = await manager.connect('unisat');
  console.log('已连接的账户:', accounts);
} catch (error) {
  console.error('连接失败:', error);
}
```

## 核心概念

### 钱包管理器

`BTCWalletManager` 是管理钱包连接和状态的核心组件。

```typescript
interface WalletManager {
  // 配置
  readonly config: WalletManagerConfig;

  // 适配器管理
  register(adapter: BTCWalletAdapter): void;
  unregister(walletId: string): void;
  getAdapter(walletId: string): BTCWalletAdapter | null;
  getAllAdapters(): BTCWalletAdapter[];
  getAvailableWallets(): WalletInfo[];

  // 连接管理
  connect(walletId: string): Promise<AccountInfo[]>;
  disconnect(): Promise<void>;
  switchWallet(walletId: string): Promise<AccountInfo[]>;

  // 网络管理
  switchNetwork(network: string): Promise<void>;

  assumeConnected(walletId: string): Promise<AccountInfo[] | null>;

  // 状态管理
  getState(): WalletState;
  getCurrentAdapter(): BTCWalletAdapter | null;
  getCurrentWallet(): WalletInfo | null;

  // 事件处理
  on(event: WalletEvent, handler: EventHandler): void;
  off(event: WalletEvent, handler: EventHandler): void;
}
```

### 钱包适配器

钱包适配器实现 `BTCWalletAdapter` 接口来提供钱包特定的功能。

```typescript
interface BTCWalletAdapter {
  // 基本信息
  readonly id: string;
  readonly name: string;
  readonly icon: string;

  // 状态检查
  isReady(): boolean;
  getState(): WalletState;

  // 连接管理
  connect(): Promise<AccountInfo[]>;
  disconnect(): Promise<void>;

  // 账户管理
  getAccounts(): Promise<AccountInfo[]>;
  getCurrentAccount(): Promise<AccountInfo | null>;

  // 网络管理
  getNetwork(): Promise<Network>;
  switchNetwork(network: Network): Promise<void>;

  // 事件
  on(event: WalletEvent, handler: EventHandler): void;
  off(event: WalletEvent, handler: EventHandler): void;

  // 比特币操作
  signMessage(message: string): Promise<string>;
  signPsbt(psbt: string): Promise<string>;
  sendBitcoin(toAddress: string, amount: number): Promise<string>;
}
```

### 状态管理

钱包状态表示当前的连接状态和账户信息。

```typescript
interface WalletState {
  status: ConnectionStatus; // 'disconnected' | 'connecting' | 'connected' | 'error'
  accounts: AccountInfo[];
  currentAccount?: AccountInfo;
  network?: Network; // 'livenet' | 'testnet' | 'regtest' | 'mainnet'
  error?: Error;
}

interface AccountInfo {
  address: string;
  publicKey?: string;
  balance?: number;
  network?: Network;
}
```

## API 参考

### 创建钱包管理器

```typescript
import { BTCWalletManager, createWalletManager } from '@btc-connect/core';

// 方法1: 直接实例化
const manager = new BTCWalletManager({
  onStateChange: (state) => {
    console.log('状态变化:', state.status);
  },
  onError: (error) => {
    console.error('钱包错误:', error);
  }
});

// 方法2: 工厂函数
const manager = createWalletManager({
  onStateChange: handleStateChange,
  onError: handleError
});
```

### 适配器管理

```typescript
// 注册自定义适配器
import { BaseWalletAdapter } from '@btc-connect/core';

class MyCustomAdapter extends BaseWalletAdapter {
  id = 'my-wallet';
  name = '我的自定义钱包';
  icon = 'https://example.com/icon.png';

  async connect(): Promise<AccountInfo[]> {
    // 实现连接逻辑
    return [{
      address: 'tb1qexample...',
      publicKey: '02abcdef...',
      balance: 100000,
      network: 'testnet'
    }];
  }

  // 实现其他必需方法...
}

// 注册适配器
manager.register(new MyCustomAdapter());

// 获取所有注册的适配器
const allAdapters = manager.getAllAdapters();

// 获取特定适配器
const adapter = manager.getAdapter('my-wallet');
```

### 连接管理

```typescript
// 获取可用钱包（已安装且就绪）
const availableWallets = manager.getAvailableWallets();
console.log('可用钱包:', availableWallets);
// 输出: [{ id: 'unisat', name: 'UniSat', icon: '...' }, ...]

// 连接钱包
try {
  const accounts = await manager.connect('unisat');
  console.log('已连接的账户:', accounts);

  // 获取当前状态
  const state = manager.getState();
  console.log('当前状态:', state);
} catch (error) {
  if (error instanceof WalletNotInstalledError) {
    console.log('钱包未安装');
  } else if (error instanceof WalletConnectionError) {
    console.log('连接失败:', error.message);
  }
}

// 切换到不同的钱包
const newAccounts = await manager.switchWallet('okx');

// 断开连接
await manager.disconnect();
```

### 网络切换

```typescript
// 切换网络 (v0.3.11+)
try {
  await manager.switchNetwork('testnet');
  console.log('已切换到测试网');
} catch (error) {
  console.error('网络切换失败:', error.message);
}

// 切换到主网
await manager.switchNetwork('mainnet');

// 切换到回归测试网
await manager.switchNetwork('regtest');

// 监听网络变化事件
manager.on('networkChange', ({ walletId, network }) => {
  console.log(`钱包 ${walletId} 切换到 ${network} 网络`);
});
```

### 事件处理

```typescript
// 监听连接事件
manager.on('connect', (accounts) => {
  console.log('钱包已连接:', accounts);
});

manager.on('disconnect', () => {
  console.log('钱包已断开连接');
});

manager.on('accountChange', (accounts) => {
  console.log('账户已更改:', accounts);
});

manager.on('networkChange', (network) => {
  console.log('网络已更改:', network);
});

manager.on('error', (error) => {
  console.error('钱包错误:', error);
});

// 移除事件监听器
const handler = (accounts) => console.log('已连接:', accounts);
manager.on('connect', handler);
manager.off('connect', handler);
```

### 比特币操作

```typescript
// 获取当前适配器
const adapter = manager.getCurrentAdapter();
if (!adapter) {
  console.log('没有连接的钱包');
  return;
}

// 签名消息
const message = 'Hello, Bitcoin!';
const signature = await adapter.signMessage(message);
console.log('消息签名:', signature);

// 签名PSBT
const psbtHex = '70736274ff...';
const signedPsbt = await adapter.signPsbt(psbtHex);
console.log('已签名的PSBT:', signedPsbt);

// 发送比特币
const txid = await adapter.sendBitcoin('tb1qrecipient...', 1000); // 1000聪
console.log('交易ID:', txid);
```

### 自动连接

```typescript
// 尝试恢复之前的连接
const previousWalletId = localStorage.getItem('last-connected-wallet');
if (previousWalletId) {
  try {
    const accounts = await manager.assumeConnected(previousWalletId);
    if (accounts && accounts.length > 0) {
      console.log('自动连接的账户:', accounts);
    }
  } catch (error) {
    console.log('自动连接失败:', error);
  }
}
```

## 支持的钱包

### UniSat

```typescript
// 连接到UniSat
const accounts = await manager.connect('unisat');

// UniSat特定功能
const unisatAdapter = manager.getAdapter('unisat');
if (unisatAdapter) {
  // UniSat可用
}
```

### OKX钱包

```typescript
// 连接到OKX
const accounts = await manager.connect('okx');

// OKX特定功能
const okxAdapter = manager.getAdapter('okx');
if (okxAdapter) {
  // OKX可用
}
```

## 错误处理

库为不同的场景提供了特定的错误类型：

```typescript
import {
  WalletError,
  WalletNotInstalledError,
  WalletConnectionError,
  WalletDisconnectedError,
  NetworkError,
  TransactionError
} from '@btc-connect/core';

try {
  await manager.connect('unisat');
} catch (error) {
  if (error instanceof WalletNotInstalledError) {
    console.log('请安装UniSat钱包');
  } else if (error instanceof WalletConnectionError) {
    console.log('连接钱包失败:', error.message);
  } else if (error instanceof NetworkError) {
    console.log('网络错误:', error.message);
  }
}
```

## 高级用法

### 自定义适配器实现

```typescript
import { BaseWalletAdapter, WalletState, AccountInfo } from '@btc-connect/core';

class CustomWalletAdapter extends BaseWalletAdapter {
  id = 'custom-wallet';
  name = '自定义钱包';
  icon = 'https://example.com/icon.png';

  isReady(): boolean {
    // 检查钱包是否可用
    return typeof window !== 'undefined' && !!(window as any).customWallet;
  }

  getState(): WalletState {
    // 返回当前钱包状态
    return {
      status: 'disconnected',
      accounts: [],
      network: 'livenet'
    };
  }

  async connect(): Promise<AccountInfo[]> {
    if (!this.isReady()) {
      throw new WalletNotInstalledError(this.id);
    }

    try {
      // 连接到钱包
      const wallet = (window as any).customWallet;
      await wallet.connect();

      const accounts = await wallet.getAccounts();
      return accounts.map(account => ({
        address: account.address,
        publicKey: account.publicKey,
        balance: account.balance,
        network: account.network
      }));
    } catch (error) {
      throw new WalletConnectionError(`无法连接到${this.name}`);
    }
  }

  async disconnect(): Promise<void> {
    const wallet = (window as any).customWallet;
    if (wallet) {
      await wallet.disconnect();
    }
  }

  // 实现其他必需方法...
}

// 注册自定义适配器
manager.register(new CustomWalletAdapter());
```

### 状态持久化

```typescript
// 将钱包状态保存到localStorage
manager.on('connect', (accounts) => {
  localStorage.setItem('btc-connect-accounts', JSON.stringify(accounts));
  localStorage.setItem('btc-connect-wallet', manager.getCurrentWallet()?.id || '');
});

// 页面加载时恢复状态
const savedWalletId = localStorage.getItem('btc-connect-wallet');
if (savedWalletId) {
  manager.assumeConnected(savedWalletId);
}
```

## 最佳实践

1. **错误处理**: 始终将钱包操作包装在try-catch块中
2. **事件监听器**: 不再需要时清理事件监听器
3. **状态管理**: 使用事件来响应状态变化，而不是轮询
4. **网络检测**: 在操作前检查网络兼容性
5. **用户体验**: 为连接状态提供清晰的反馈

## 迁移指南

### 从版本0.1.x迁移到0.2.x

```typescript
// 旧方式（已弃用）
const manager = new WalletManager();

// 新方式
const manager = new BTCWalletManager({
  onStateChange: handleStateChange,
  onError: handleError
});
```

## 贡献

请阅读我们的[贡献指南](../../CONTRIBUTING.zh-CN.md)了解我们的行为准则和提交拉取请求的流程。

## 许可证

本项目采用MIT许可证 - 查看[LICENSE](../../LICENSE)文件了解详情。

## 支持

- 📧 邮箱: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [问题反馈](https://github.com/IceHugh/btc-connect/issues)