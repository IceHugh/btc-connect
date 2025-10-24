[根目录](../../CLAUDE.md) > [packages](../) > **react**

# @btc-connect/react

## 变更记录 (Changelog)

### 2025-10-24 22:00:00
- 优化连接性能：移除自动获取public key和balance的逻辑
- 实现增强钱包检测：集成20秒内每300ms轮询机制
- 完善钱包检测实时更新：检测到新钱包时立即更新UI
- 优化自动连接逻辑：与钱包检测机制协调工作
- 修复TypeScript类型和代码规范问题

### 2025-10-16 09:31:52
- 完成 React 模块架构分析和文档生成
- 添加 Context Provider 和 Hooks 详细说明
- 补充组件和类型系统文档

## 模块职责

@btc-connect/react 是 btc-connect 项目的 React 适配模块，为 React 应用提供完整的钱包连接功能。它通过 Context API 和自定义 Hooks，提供了声明式的钱包管理方式，支持自动连接、连接策略、主题定制等高级功能。

## 入口与启动

### 主要入口文件
- **src/index.ts**: 主入口文件，导出所有公共接口
- **src/context/index.tsx**: React Context 和 Provider 实现
- **src/components/**: React 组件实现
- **src/hooks/**: 自定义 Hooks 实现
- **src/types/**: 类型定义系统
- **src/utils/**: 工具函数

### 基本使用
```tsx
import { BTCWalletProvider, ConnectButton, WalletModal } from '@btc-connect/react';

function App() {
  return (
    <BTCWalletProvider autoConnect={true}>
      <ConnectButton />
      <WalletModal />
    </BTCWalletProvider>
  );
}
```

## 对外接口

### Provider 组件
```tsx
interface WalletProviderProps {
  children: ReactNode;
  config?: WalletManagerConfig;
  autoConnect?: boolean;
  connectTimeout?: number;
  connectionPolicy?: ConnectionPolicy;
}

function BTCWalletProvider({
  children,
  config,
  autoConnect = false,
  connectTimeout = 5000,
  connectionPolicy,
}: WalletProviderProps)
```

### 核心 Hooks

#### useWallet - 获取钱包状态
```tsx
const {
  status,           // 连接状态
  accounts,         // 账户列表
  currentAccount,   // 当前账户
  network,          // 网络信息
  error,            // 错误信息
  currentWallet,    // 当前钱包信息
  isConnected,      // 是否已连接
  isConnecting,     // 是否正在连接
  address,          // 当前地址
  balance,          // 余额信息
  publicKey,        // 公钥
} = useWallet();
```

#### useConnectWallet - 连接操作
```tsx
const {
  connect,          // 连接钱包
  disconnect,       // 断开连接
  switchWallet,     // 切换钱包
  availableWallets, // 可用钱包列表
} = useConnectWallet();
```

#### useWalletEvent - 事件监听
```tsx
useWalletEvent('connect', (accounts) => {
  console.log('Connected:', accounts);
});

useWalletEvent('disconnect', () => {
  console.log('Disconnected');
});
```

#### useNetwork - 网络管理
```tsx
const {
  network,           // 当前网络
  switchNetwork,    // 切换网络函数
} = useNetwork();
```

### 组件

#### ConnectButton - 连接按钮
```tsx
interface ConnectButtonProps {
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'select' | 'button' | 'compact';
  label?: string;
  disabled?: boolean;
}
```

#### WalletModal - 钱包选择模态框
```tsx
interface WalletModalProps {
  theme?: 'light' | 'dark';
  isOpen?: boolean;
  onClose?: () => void;
}
```

## 关键依赖与配置

### 依赖关系
- **@btc-connect/core**: 核心钱包适配层
- **React**: >= 18.0.0
- **@lit/react**: ^1.0.8 (用于 Web Components 集成)

### 开发依赖
- **@btc-connect/ui**: UI 组件库
- **@vitejs/plugin-react**: Vite React 插件
- **vite-plugin-dts**: TypeScript 类型生成

### 默认配置
```typescript
export const defaultConfig = {
  walletOrder: ['unisat', 'okx', 'xverse'],
  featuredWallets: ['unisat', 'okx'],
  theme: 'light',
  animation: 'scale',
  showTestnet: false,
  showRegtest: false,
  size: 'md',
  variant: 'select',
};
```

## 数据模型

### ConnectionPolicy - 连接策略
```typescript
interface ConnectionPolicy {
  tasks: ConnectionPolicyTask[];
  emitEventsOnAutoConnect?: boolean;
}

interface ConnectionPolicyTask {
  run: (context: ConnectionPolicyTaskContext) => Promise<ConnectionPolicyTaskResult>;
  required?: boolean;           // 是否必须成功
  autoBehavior?: 'run' | 'skip'; // 自动连接时的行为
}

interface ConnectionPolicyTaskResult {
  success: boolean;
  error?: Error;
}
```

### BalanceDetail - 余额详情
```typescript
interface BalanceDetail {
  confirmed: number;
  unconfirmed: number;
  total: number;
}
```

### ThemeMode - 主题模式
```typescript
type ThemeMode = 'light' | 'dark' | 'auto';
```

## 测试与质量

### 当前测试状态
- ❌ 缺少单元测试
- ❌ 缺少组件测试
- ❌ 缺少集成测试

### 建议测试覆盖
1. **Context Provider 测试**: 测试 Provider 的状态管理和事件处理
2. **Hooks 测试**: 测试每个 Hook 的功能和边界情况
3. **组件测试**: 测试组件的渲染和交互
4. **连接策略测试**: 测试自动连接和策略执行
5. **SSR 兼容性测试**: 测试服务器端渲染兼容性

### 质量工具
- **TypeScript**: 严格类型检查
- **Biome**: 代码格式化和规范检查
- **Vite**: 构建工具和开发服务器

## 常见问题 (FAQ)

### Q: 如何实现自定义连接策略？
A: 定义连接策略任务并传递给 Provider：
```tsx
const connectionPolicy: ConnectionPolicy = {
  tasks: [
    {
      run: async ({ manager }) => {
        // 自定义连接后任务
        const balance = await manager.getCurrentAdapter()?.getBalance?.();
        return { success: true };
      },
      required: false,
      autoBehavior: 'run'
    }
  ],
  emitEventsOnAutoConnect: true
};

<BTCWalletProvider connectionPolicy={connectionPolicy}>
  {/* ... */}
</BTCWalletProvider>
```

### Q: 如何处理 SSR 环境？
A: Provider 内置 SSR 保护，自动处理客户端初始化：
```tsx
// 在 SSR 环境中安全使用
function MyComponent() {
  const { manager } = useWalletContext();

  // manager 在服务端为 null，客户端为实际实例
  if (!manager) {
    return <div>Loading...</div>;
  }

  return <div>Wallet ready</div>;
}
```

### Q: 如何自定义主题和样式？
A: 使用主题属性和 CSS 变量：
```tsx
<ConnectButton
  theme="dark"
  size="lg"
  variant="button"
/>
```

### Q: 如何监听钱包事件？
A: 使用 useWalletEvent Hook：
```tsx
function WalletEvents() {
  useWalletEvent('accountChange', (accounts) => {
    console.log('Account changed:', accounts);
  });

  useWalletEvent('networkChange', (network) => {
    console.log('Network changed:', network);
  });

  return null;
}
```

## 相关文件清单

### 核心文件
- `src/index.ts` - 主入口文件
- `src/context/index.tsx` - Context 和 Provider
- `src/types/index.ts` - React 特定类型
- `src/types/core.ts` - 从 core 重新导出的类型
- `src/types/shared.ts` - 共享类型定义

### Hooks
- `src/hooks/index.ts` - Hooks 入口
- `src/hooks/useAccount.ts` - 账户相关 Hook
- `src/hooks/useAutoConnect.ts` - 自动连接 Hook
- `src/hooks/useBalance.ts` - 余额 Hook
- `src/hooks/useSignature.ts` - 签名 Hook
- `src/hooks/useTransactions.ts` - 交易 Hook
- `src/hooks/useWalletModal.ts` - 钱包模态框 Hook

### 组件
- `src/components/index.ts` - 组件入口
- `src/components/ConnectButton.tsx` - 连接按钮组件
- `src/components/WalletModal.tsx` - 钱包模态框组件

### 工具和配置
- `src/utils/index.ts` - 工具函数
- `package.json` - 包配置
- `tsconfig.json` - TypeScript 配置
- `vite.config.ts` - Vite 构建配置

## 变更记录 (Changelog)

### 2025-10-16 09:31:52
- 完成 React 模块架构分析和文档生成
- 添加 Context Provider 和 Hooks 详细说明
- 补充组件和类型系统文档