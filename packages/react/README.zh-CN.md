# @btc-connect/react

English | [中文文档](./README.zh-CN.md)

<p align="center">
  <strong>React 适配器 - 提供Hooks和Context的BTC Connect绑定</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@btc-connect/react">
    <img src="https://img.shields.io/npm/v/@btc-connect/react.svg" alt="NPM 版本">
  </a>
  <a href="https://github.com/IceHugh/btc-connect/actions">
    <img src="https://github.com/IceHugh/btc-connect/workflows/CI/badge.svg" alt="CI">
  </a>
  <a href="https://codecov.io/gh/IceHugh/btc-connect">
    <img src="https://codecov.io/gh/IceHugh/btc-connect/branch/main/graph/badge.svg" alt="覆盖率">
  </a>
  <a href="https://bundlephobia.com/result?p=@btc-connect/react">
    <img src="https://img.shields.io/bundlephobia/minzip/@btc-connect/react.svg" alt="包大小">
  </a>
</p>

## 概述

`@btc-connect/react` 为BTC Connect提供React特定的绑定，提供声明式的比特币钱包功能集成方式。它包含自定义hooks、context providers和预构建组件，实现无缝的钱包集成。

## 特性

- 🎣 **React Hooks**: 使用自定义hooks进行声明式钱包状态管理
- 📦 **Context Provider**: 集中式钱包状态管理
- 🎨 **预构建组件**: 即可用的钱包连接UI组件
- ⚛️ **React 18+支持**: 为现代React构建，支持并发特性
- 🔄 **自动重连**: 应用重新加载时自动恢复钱包连接
- 🛡️ **类型安全**: 完整的TypeScript支持和类型定义
- 📱 **SSR兼容**: 支持Next.js等服务器端渲染框架
- 🎯 **框架优化**: 专为React模式设计

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
import { BTCWalletProvider, ConnectButton, WalletModal } from '@btc-connect/react';

function App() {
  return (
    <BTCWalletProvider autoConnect={true}>
      <div>
        <h1>我的比特币应用</h1>
        <ConnectButton />
        <WalletModal />
      </div>
    </BTCWalletProvider>
  );
}

export default App;
```

## 核心组件

### BTCWalletProvider

管理钱包状态并为整个应用树提供状态管理的根Provider。

```tsx
function App() {
  return (
    <BTCWalletProvider
      autoConnect={true}
      connectTimeout={5000}
      theme="light"
      config={{
        onStateChange: (state) => console.log('状态:', state),
        onError: (error) => console.error('错误:', error)
      }}
    >
      <YourApp />
    </BTCWalletProvider>
  );
}
```

#### 主题管理

`BTCWalletProvider` 统一管理所有组件的主题。主题设置会自动传递给所有子组件：

```tsx
// 设置暗色主题
<BTCWalletProvider theme="dark">
  <ConnectButton />  {/* 自动使用 dark 主题 */}
  <WalletModal />    {/* 自动使用 dark 主题 */}
</BTCWalletProvider>

// 设置亮色主题（默认）
<BTCWalletProvider theme="light">
  <ConnectButton />  {/* 自动使用 light 主题 */}
  <WalletModal />    {/* 自动使用 light 主题 */}
</BTCWalletProvider>
```

**支持的主题：**
- `"light"`: 亮色主题（默认）
- `"dark"`: 暗色主题

**动态主题切换：**
```tsx
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <BTCWalletProvider theme={theme}>
      <div>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          切换主题
        </button>
        <ConnectButton />
        <WalletModal />
      </div>
    </BTCWalletProvider>
  );
}
```

### ConnectButton

可自定义样式的钱包连接预构建按钮组件。

```tsx
function Header() {
  return (
    <header>
      <ConnectButton
        size="md"
        variant="select"
        label="连接钱包"
      />
    </header>
  );
}
```

### WalletModal

钱包选择和连接管理的模态框组件。

```tsx
function WalletLayout() {
  const { isModalOpen, openModal, closeModal } = useWalletModal();

  return (
    <div>
      <ConnectButton onClick={openModal} />
      <WalletModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
```

## Hooks API

### useWallet

获取当前钱包状态和账户信息。

```tsx
function AccountInfo() {
  const {
    status,
    accounts,
    currentAccount,
    network,
    error,
    isConnected,
    isConnecting,
    address,
    balance,
    publicKey,
    currentWallet
  } = useWallet();

  if (isConnecting) return <div>连接中...</div>;
  if (!isConnected) return <div>未连接</div>;

  return (
    <div>
      <h3>账户信息</h3>
      <p><strong>状态:</strong> {status}</p>
      <p><strong>地址:</strong> {address}</p>
      <p><strong>网络:</strong> {network}</p>
      <p><strong>余额:</strong> {balance} sats</p>
      <p><strong>钱包:</strong> {currentWallet?.name}</p>
    </div>
  );
}
```

### useConnectWallet

处理钱包连接操作。

```tsx
function WalletControls() {
  const {
    connect,
    disconnect,
    switchWallet,
    availableWallets
  } = useConnectWallet();

  const handleConnect = async (walletId: string) => {
    try {
      await connect(walletId);
      console.log('连接成功！');
    } catch (error) {
      console.error('连接失败:', error);
    }
  };

  return (
    <div>
      <h3>可用钱包</h3>
      {availableWallets.map(wallet => (
        <button
          key={wallet.id}
          onClick={() => handleConnect(wallet.id)}
        >
          {wallet.name}
        </button>
      ))}
      <button onClick={() => disconnect()}>
        断开连接
      </button>
    </div>
  );
}
```

### useWalletEvent

监听钱包事件，自动清理监听器。

```tsx
function EventListener() {
  useWalletEvent('connect', (accounts) => {
    console.log('钱包已连接:', accounts);
    // 显示成功通知
  });

  useWalletEvent('disconnect', () => {
    console.log('钱包已断开');
    // 清除用户数据
  });

  useWalletEvent('accountChange', (accounts) => {
    console.log('账户已更改:', accounts);
    // 更新UI
  });

  return <div>事件监听器激活</div>;
}
```

### useNetwork

管理网络信息和切换。

```tsx
function NetworkInfo() {
  const { network, switchNetwork } = useNetwork();

  const handleNetworkSwitch = async (targetNetwork: Network) => {
    try {
      await switchNetwork(targetNetwork);
      console.log(`已切换到${targetNetwork}`);
    } catch (error) {
      console.error('网络切换失败:', error);
    }
  };

  return (
    <div>
      <p><strong>当前网络:</strong> {network}</p>
      <button onClick={() => handleNetworkSwitch('mainnet')}>
        切换到主网
      </button>
      <button onClick={() => handleNetworkSwitch('testnet')}>
        切换到测试网
      </button>
    </div>
  );
}
```

### useAccount

获取详细账户和余额信息。

```tsx
function AccountDetails() {
  const {
    accounts,
    currentAccount,
    hasAccounts,
    refreshAccountInfo
  } = useAccount();

  if (!hasAccounts) {
    return <div>没有可用账户</div>;
  }

  return (
    <div>
      <h3>账户详情</h3>
      <p><strong>总账户数:</strong> {accounts.length}</p>
      {currentAccount && (
        <div>
          <p><strong>当前地址:</strong> {currentAccount.address}</p>
          <p><strong>余额:</strong> {currentAccount.balance} sats</p>
          <button onClick={refreshAccountInfo}>
            刷新余额
          </button>
        </div>
      )}
    </div>
  );
}
```

### useBalance

专注的余额管理和格式化。

```tsx
function BalanceDisplay() {
  const {
    balance,
    confirmedBalance,
    unconfirmedBalance,
    totalBalance,
    isLoading,
    error,
    refreshBalance
  } = useBalance();

  if (isLoading) return <div>加载余额中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return (
    <div>
      <h3>余额信息</h3>
      <p><strong>总计:</strong> {totalBalance} sats</p>
      <p><strong>已确认:</strong> {confirmedBalance} sats</p>
      <p><strong>未确认:</strong> {unconfirmedBalance} sats</p>
      <button onClick={refreshBalance}>
        刷新
      </button>
    </div>
  );
}
```

### useWalletModal

控制钱包选择模态框。

```tsx
function ModalControls() {
  const { isOpen, open, close, toggle } = useWalletModal();

  return (
    <div>
      <button onClick={open}>打开钱包模态框</button>
      <button onClick={close}>关闭钱包模态框</button>
      <button onClick={toggle}>切换模态框</button>
      <p>模态框{isOpen ? '已打开' : '已关闭'}</p>
    </div>
  );
}
```

## 高级用法

### 自定义连接策略

定义连接后运行的自定义任务。

```tsx
const connectionPolicy: ConnectionPolicy = {
  tasks: [
    {
      run: async ({ manager, accounts }) => {
        // 连接后自定义逻辑
        console.log('已连接账户:', accounts);

        // 加载用户数据
        await loadUserData(accounts[0].address);

        return { success: true };
      },
      required: false,
      autoBehavior: 'run'
    }
  ],
  emitEventsOnAutoConnect: true
};

function App() {
  return (
    <BTCWalletProvider connectionPolicy={connectionPolicy}>
      {/* 你的应用 */}
    </BTCWalletProvider>
  );
}
```

### 错误边界

为钱包操作实现适当的错误处理。

```tsx
class WalletErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('钱包错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>钱包连接出现问题。</h2>
          <details>
            {this.state.error && this.state.error.message}
          </details>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <WalletErrorBoundary>
      <BTCWalletProvider>
        <YourApp />
      </BTCWalletProvider>
    </WalletErrorBoundary>
  );
}
```

## 服务器端渲染 (SSR)

React适配器完全兼容Next.js等SSR框架。

### Next.js App Router

```tsx
// app/layout.tsx
import { BTCWalletProvider } from '@btc-connect/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <BTCWalletProvider>
          {children}
        </BTCWalletProvider>
      </body>
    </html>
  );
}
```

### 仅客户端组件

```tsx
// components/WalletConnectButton.tsx
'use client';

import { ConnectButton } from '@btc-connect/react';

export default function WalletConnectButton() {
  return <ConnectButton />;
}
```

## 性能优化

### 记忆化

```tsx
import { useMemo } from 'react';

function OptimizedWalletDisplay() {
  const { balance, address } = useWallet();

  const formattedBalance = useMemo(() => {
    if (!balance) return '0 sats';
    return `${(balance / 100000000).toFixed(8)} BTC`;
  }, [balance]);

  const shortAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  return (
    <div>
      <p>{shortAddress}</p>
      <p>{formattedBalance}</p>
    </div>
  );
}
```

### 懒加载

```tsx
import { lazy, Suspense } from 'react';

const WalletModal = lazy(() => import('@btc-connect/react').then(mod => ({
  default: mod.WalletModal
})));

function App() {
  return (
    <BTCWalletProvider>
      <Suspense fallback={<div>加载中...</div>}>
        <WalletModal />
      </Suspense>
    </BTCWalletProvider>
  );
}
```

## 最佳实践

1. **Provider位置**: 将Provider放在组件树尽可能高的位置
2. **错误处理**: 始终将钱包操作包装在try-catch块中
3. **加载状态**: 连接期间显示适当的加载状态
4. **事件清理**: 使用提供的hooks，自动处理清理
5. **SSR考虑**: 对钱包依赖的UI使用仅客户端组件
6. **性能**: 记忆化昂贵计算，对模态框使用懒加载

## 贡献

请阅读我们的[贡献指南](../../CONTRIBUTING.zh-CN.md)了解我们的行为准则和提交拉取请求的流程。

## 许可证

本项目采用MIT许可证 - 查看[LICENSE](../../LICENSE)文件了解详情。

## 支持

- 📧 邮箱: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [问题反馈](https://github.com/IceHugh/btc-connect/issues)