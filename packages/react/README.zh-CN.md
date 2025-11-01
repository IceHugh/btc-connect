# @btc-connect/react

[中文文档](./README.zh-CN.md) | English

<p align="center">
  <strong>React 适配器 - 提供Hooks和Context的BTC Connect绑定</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@btc-connect/react">
    <img src="https://img.shields.io/npm/v/@btc-connect/react.svg" alt="NPM Version">
  </a>
  <a href="https://github.com/IceHugh/btc-connect/actions">
    <img src="https://github.com/IceHugh/btc-connect/workflows/CI/badge.svg" alt="CI">
  </a>
  <a href="https://codecov.io/gh/IceHugh/btc-connect">
    <img src="https://codecov.io/gh/IceHugh/btc-connect/branch/main/graph/badge.svg" alt="Coverage">
  </a>
  <a href="https://bundlephobia.com/result?p=@btc-connect/react">
    <img src="https://img.shields.io/bundlephobia/minzip/@btc-connect/react.svg" alt="Bundle Size">
  </a>
</p>

## 概述

`@btc-connect/react` 为BTC Connect提供React特定的绑定，提供声明式的比特币钱包功能集成方式。它包含自定义hooks、context providers和预构建组件，实现无缝的钱包集成。

## 特性

- 🎣 **现代React Hooks**: 为每个功能提供独立的hooks，统一访问点
- 📦 **Context Provider**: 集中式钱包状态管理
- 🎨 **预构建组件**: 即可用的钱包连接UI组件
- ⚛️ **React 18+支持**: 为现代React构建，支持并发特性
- 🔄 **自动重连**: 应用重新加载时自动恢复钱包连接
- 🛡️ **类型安全**: 完整的TypeScript支持和类型定义
- 📱 **SSR兼容**: 支持Next.js等服务器端渲染框架
- 🎯 **框架优化**: 专为React模式设计
- 🛠️ **工具函数**: 内置格式化和验证工具

## 安装

```bash
npm install @btc-connect/react
```

**对等依赖**: 确保已安装React 18+:

```bash
npm install react react-dom
```

## 快速开始

```tsx
import React from 'react';
import { BTCWalletProvider, ConnectButton } from '@btc-connect/react';

function App() {
  return (
    <BTCWalletProvider autoConnect={true}>
      <div>
        <h1>我的比特币应用</h1>
        <ConnectButton />
      </div>
    </BTCWalletProvider>
  );
}

export default App;
```

## 核心组件

### BTCWalletProvider

管理钱包状态并为整个应用树提供状态管理的根Provider。

**Props:**
- `children: ReactNode` - 子组件
- `autoConnect?: boolean` - 启用自动连接（默认: false）
- `connectTimeout?: number` - 连接超时时间，毫秒（默认: 5000）
- `connectionPolicy?: ConnectionPolicy` - 自定义连接策略
- `theme?: 'light' | 'dark'` - 所有组件的主题（默认: 'light'）
- `config?: WalletManagerConfig` - 核心管理器配置

### ConnectButton

可自定义样式的钱包连接预构建按钮组件。

**Props:**
- `size?: 'sm' | 'md' | 'lg'` - 按钮大小（默认: 'md'）
- `variant?: 'select' | 'button' | 'compact'` - 显示样式（默认: 'select'）
- `label?: string` - 自定义按钮标签
- `disabled?: boolean` - 禁用按钮（默认: false）
- `className?: string` - 自定义CSS类
- `style?: React.CSSProperties` - 自定义内联样式

### WalletModal

钱包选择和连接管理的模态框组件。

**Props:**
- `theme?: 'light' | 'dark'` - 模态框主题（默认: 从provider继承）
- `isOpen?: boolean` - 模态框打开状态（受控模式）
- `onClose?: () => void` - 关闭回调
- `onConnect?: (walletId: string) => void` - 连接回调

## React Hooks

### useWallet - 统一Hook

主要hook，提供所有钱包功能的访问。

**返回值:**
```typescript
interface UseWalletReturn {
  // 状态
  status: ConnectionStatus;
  isConnected: boolean;
  isConnecting: boolean;
  address?: string;
  balance?: number;
  network?: Network;
  error?: Error;

  // 操作
  connect: (walletId: string) => Promise<AccountInfo[]>;
  disconnect: () => Promise<void>;
  switchWallet: (walletId: string) => Promise<AccountInfo[]>;
  availableWallets: WalletInfo[];

  // 高级
  useWalletEvent: <T extends WalletEvent>(event: T, handler: EventHandler<T>) => UseWalletEventReturn<T>;
  walletModal: UseWalletModalReturn;
  manager: BTCWalletManager;
}
```

### useWalletEvent

监听钱包事件的hook，支持自动清理。

**参数:**
- `event: WalletEvent` - 事件类型（'connect', 'disconnect', 'accountChange', 'networkChange', 'error'）
- `handler: EventHandler` - 事件处理函数

**返回值:**
```typescript
interface UseWalletEventReturn<T> {
  on: (handler: EventHandler<T>) => void;
  off: (handler: EventHandler<T>) => void;
  once: (handler: EventHandler<T>) => void;
  clear: () => void;
  eventHistory: EventHistoryItem[];
}
```

### useNetwork

网络管理和切换的hook。

**返回值:**
```typescript
interface UseNetworkReturn {
  network: Network;
  switchNetwork: (network: Network) => Promise<void>;
  isSwitching: boolean;
}
```

### useTheme

主题管理和切换的hook。

**返回值:**
```typescript
interface UseThemeReturn {
  theme: ThemeMode;
  systemTheme: ThemeMode;
  effectiveTheme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resetTheme: () => void;
}
```

## API 参考

### 连接管理

```typescript
// 连接钱包
const { connect, isConnected, address } = useWallet();

const handleConnect = async () => {
  try {
    await connect('unisat');
    console.log('连接到:', address);
  } catch (error) {
    console.error('连接失败:', error);
  }
};
```

### 事件处理

```typescript
// 监听钱包事件
const { useWalletEvent } = useWallet();

useWalletEvent('connect', (accounts) => {
  console.log('钱包已连接:', accounts);
});

useWalletEvent('disconnect', () => {
  console.log('钱包已断开');
});
```

### 比特币操作

```typescript
// 签名消息
const { signMessage, signPsbt, sendBitcoin } = useWallet();

const handleSignMessage = async () => {
  const signature = await signMessage('Hello, Bitcoin!');
  console.log('签名:', signature);
};
```

## 高级用法

### 自定义连接策略

```typescript
interface ConnectionPolicy {
  tasks: ConnectionPolicyTask[];
  emitEventsOnAutoConnect?: boolean;
}

const customPolicy: ConnectionPolicy = {
  tasks: [
    {
      run: async (context) => {
        // 自定义连接逻辑
        return { success: true };
      },
      required: true
    }
  ]
};

<BTCWalletProvider connectionPolicy={customPolicy}>
  <App />
</BTCWalletProvider>
```

### Next.js SSR支持

```tsx
// pages/_app.tsx
import { BTCWalletProvider } from '@btc-connect/react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <BTCWalletProvider autoConnect={true}>
      <Component {...pageProps} />
    </BTCWalletProvider>
  );
}

// pages/index.tsx
import { ConnectButton } from '@btc-connect/react';

export default function Home() {
  return (
    <div>
      <h1>比特币钱包应用</h1>
      <ConnectButton />
    </div>
  );
}
```

## 最佳实践

1. **Provider位置**: 将BTCWalletProvider放在应用的根位置
2. **错误处理**: 始终将钱包操作包装在try-catch块中
3. **事件清理**: 使用hooks提供的自动清理功能
4. **类型安全**: 利用TypeScript类型获得更好的开发体验
5. **SSR**: 确保钱包操作只在客户端执行

## 迁移指南

### 从v0.3.x迁移到v0.4.0+

```tsx
// 旧方式
import { useWallet, useAccount, useWalletEvent } from '@btc-connect/react';
const { connect } = useWallet();
const { address } = useAccount();
useWalletEvent('connect', handler);

// 新方式
import { useWallet } from '@btc-connect/react';
const { connect, address, useWalletEvent } = useWallet();
useWalletEvent('connect', handler);
```

## 贡献

请阅读我们的[贡献指南](../../CONTRIBUTING.md)了解我们的行为准则和提交拉取请求的流程。

## 许可证

本项目采用MIT许可证 - 查看[LICENSE](../../LICENSE)文件了解详情。

## 支持

- 📧 邮箱: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [问题反馈](https://github.com/IceHugh/btc-connect/issues)