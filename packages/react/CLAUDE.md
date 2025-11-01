# @btc-connect/react

## 变更记录 (Changelog)

### 2025-11-01 22:00:00 - 🎉 重大统一更新
- **API 统一**: 与 Vue 包实现完全一致的 Hook 接口
- **增强 useWallet**: 成为所有功能的统一访问点，包含状态、操作和工具函数
- **新增 useWalletEvent Hook**: 提供跨框架的事件监听功能
- **新增 useWalletManager Hook**: 提供高级钱包管理器功能
- **新增 useTheme Hook**: 支持亮色/暗色/自动主题切换
- **新增 useWalletModalEnhanced Hook**: 增强模态框控制，支持来源追踪
- **统一工具函数**: 集成 formatAddress、formatBalance 等 10+ 个工具函数
- **完整测试覆盖**: 新增全面的 Hook 测试套件
- **类型系统增强**: 统一的 TypeScript 类型定义，确保跨框架类型安全

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
import { BTCWalletProvider, ConnectButton } from '@btc-connect/react';

function App() {
  return (
    <BTCWalletProvider autoConnect={true}>
      <ConnectButton />
    </BTCWalletProvider>
  );
}
```

### 🆕 v0.4.0+ 统一 API 使用
```tsx
import { useWallet } from '@btc-connect/react';

function WalletComponent() {
  const wallet = useWallet();
  // wallet 包含所有钱包状态、操作和工具函数
  // 详细API说明请参考下方的Hooks文档
}
```

**注意**: 详细使用示例请参考 [docs/examples.md](../../docs/examples.md)

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

#### 🆕 useWallet - 统一钱包访问点 (v0.4.0+)

**描述**: 统一的钱包状态和操作访问点，提供所有钱包功能的单一入口。

**返回值**:
```typescript
interface UseWalletReturn {
  // === 基础状态 ===
  status: ConnectionStatus;                    // 连接状态：'disconnected' | 'connecting' | 'connected' | 'error'
  accounts: AccountInfo[];                     // 账户列表
  currentAccount: AccountInfo | undefined;      // 当前账户信息
  network: Network;                             // 网络类型：'livenet' | 'testnet' | 'regtest' | 'mainnet'
  error: Error | undefined;                      // 错误信息
  currentWallet: WalletInfo | null;             // 当前钱包信息
  isConnected: boolean;                         // 是否已连接
  isConnecting: boolean;                        // 是否正在连接
  theme: ThemeMode;                             // 主题模式：'light' | 'dark' | 'auto'
  address: string | undefined;                  // 当前地址
  balance: number | undefined;                  // 当前余额（聪）
  publicKey: string | undefined;               // 当前公钥

  // === 连接操作 ===
  connect: (walletId: string) => Promise<AccountInfo[]>;     // 连接指定钱包
  disconnect: () => Promise<void>;                           // 断开当前连接
  switchWallet: (walletId: string) => Promise<AccountInfo[]>;  // 切换到指定钱包
  availableWallets: WalletInfo[];                            // 可用钱包列表

  // === 网络管理 ===
  switchNetwork: (network: Network) => Promise<void>;        // 切换网络

  // === 事件监听功能 ===
  useWalletEvent: <T extends WalletEvent>(event: T, handler: EventHandler<T>) => UseWalletEventReturn<T>;

  // === 模态框控制 ===
  walletModal: UseWalletModalReturn;

  // === 钱包管理器功能 ===
  currentAdapter: BTCWalletAdapter | null;        // 当前适配器
  allAdapters: BTCWalletAdapter[];               // 所有适配器
  manager: BTCWalletManager;                     // 原始管理器实例

  // === 签名功能 ===
  signMessage: (message: string) => Promise<string>;     // 签名消息
  signPsbt: (psbt: string) => Promise<string>;           // 签名PSBT
  sendBitcoin: (toAddress: string, amount: number) => Promise<string>; // 发送比特币

  // === 工具函数快捷访问 ===
  utils: {
    formatAddress: (address: string, options?: FormatAddressOptions) => string;
    formatBalance: (satoshis: number, options?: FormatBalanceOptions) => string;
  };
}
```

**注意**: 详细使用示例请参考 [docs/examples.md](../../docs/examples.md)

#### 🆕 useWalletEvent - 事件监听 (v0.4.0+)

**描述**: 提供跨框架的事件监听功能，支持自动清理和事件历史记录。

**参数**:
- `event: T` - 钱包事件类型
- `handler: EventHandler<T>` - 事件处理函数

**返回值**:
```typescript
interface UseWalletEventReturn<T extends WalletEvent> {
  on: (handler: EventHandler<T>) => void;                    // 添加事件监听器
  off: (handler: EventHandler<T>) => void;                   // 移除事件监听器
  once: (handler: EventHandler<T>) => void;                  // 添加一次性监听器
  clear: () => void;                                      // 清理所有监听器
  clearHistory: () => void;                               // 清理事件历史
  eventHistory: EventHistoryItem[];                       // 事件历史记录
}
```

**支持的事件类型**:
- `'connect'` - 钱包连接成功
- `'disconnect'` - 钱包断开连接
- `'accountChange'` - 账户变更
- `'networkChange'` - 网络变更
- `'error'` - 错误发生

**注意**: 详细使用示例请参考 [docs/examples.md](../../docs/examples.md)

#### 🆕 useWalletManager - 高级钱包管理器 (v0.4.0+)

**描述**: 提供高级钱包管理功能，包括适配器操作和统计信息。

**返回值**:
```typescript
interface UseWalletManagerReturn {
  currentAdapter: BTCWalletAdapter | null;      // 当前激活的适配器
  availableAdapters: BTCWalletAdapter[];         // 所有可用适配器列表
  adapterStates: AdapterState[];                 // 适配器状态数组
  getAdapter: (walletId: string) => BTCWalletAdapter | null;  // 获取指定钱包的适配器
  addAdapter: (adapter: BTCWalletAdapter) => void;             // 添加新适配器
  removeAdapter: (walletId: string) => void;                  // 移除适配器
  manager: BTCWalletManager;                           // 原始管理器实例
  stats: ManagerStats;                                  // 管理器统计信息
}

interface AdapterState {
  id: string;                    // 钱包ID
  name: string;                  // 钱包名称
  isReady: boolean;              // 是否就绪
  isInstalled: boolean;          // 是否已安装
  isConnected: boolean;          // 是否已连接
  lastError: Error | null;       // 最后的错误
}

interface ManagerStats {
  totalAdapters: number;        // 总适配器数量
  connectedAdapters: number;     // 已连接适配器数量
  readyAdapters: number;        // 就绪适配器数量
  lastUpdated: number;          // 最后更新时间
}
```

**注意**: 详细使用示例请参考 [docs/examples.md](../../docs/examples.md)

#### 🆕 useTheme - 主题管理 (v0.4.0+)

**描述**: 提供完整的主题管理系统，支持亮色/暗色/自动主题切换。

**返回值**:
```typescript
interface UseThemeReturn {
  theme: ThemeMode;                    // 当前主题模式
  systemTheme: ThemeMode;              // 系统主题模式
  effectiveTheme: ThemeMode;           // 有效主题（考虑系统设置）
  setTheme: (theme: ThemeMode) => void;     // 设置主题
  setThemeMode: (mode: ThemeMode) => void;  // 设置主题模式
  setCustomTheme: (theme: CustomTheme) => void; // 设置自定义主题
  resetTheme: () => void;               // 重置为默认主题
}

type ThemeMode = 'light' | 'dark' | 'auto';

interface CustomTheme {
  colors: {
    primary?: string;
    background?: string;
    text?: string;
    border?: string;
  };
  fonts?: {
    primary?: string;
    secondary?: string;
  };
}
```

**注意**: 详细使用示例请参考 [docs/examples.md](../../docs/examples.md)

#### 🆕 useWalletModalEnhanced - 增强模态框控制 (v0.4.0+)

**描述**: 增强的模态框控制功能，支持来源追踪和程序化控制。

**返回值**:
```typescript
interface UseWalletModalReturn {
  isModalOpen: boolean;                              // 模态框是否打开
  theme: ThemeMode;                                   // 模态框主题
  openModal: () => void;                              // 打开模态框
  closeModal: () => void;                             // 关闭模态框
  toggleModal: () => void;                             // 切换模态框状态
  forceClose: () => void;                              // 强制关闭
  openWithSource: (walletId?: string, source?: string) => void; // 带来源打开
  modalSource: string | null;                         // 模态框来源
}
```

**注意**: 详细使用示例请参考 [docs/examples.md](../../docs/examples.md)

#### useNetwork - 网络管理 (保持兼容)
```tsx
const {
  network,           // 当前网络
  switchNetwork,    // 切换网络函数
  isSwitching,      // 是否正在切换
} = useNetwork();
```

### 🔧 迁移指南 (v0.3.x → v0.4.0+)

#### 基础用法迁移
```tsx
// v0.3.x 旧用法
import { useWallet, useAccount } from '@btc-connect/react';
const { connect } = useWallet();
const { address } = useAccount();

// v0.4.0+ 新用法
import { useWallet } from '@btc-connect/react';
const { connect, address, useWalletEvent, walletModal, utils } = useWallet();
```

#### 事件监听迁移
```tsx
// v0.3.x 旧用法
useWalletEvent('connect', handler);

// v0.4.0+ 新用法
const { on, once, clear } = useWalletEvent('connect', handler);
// 或者直接在 useWallet 中使用
const { useWalletEvent } = useWallet();
useWalletEvent('connect', handler);
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
A: 定义 `ConnectionPolicy` 对象并传递给 BTCWalletProvider 的 `connectionPolicy` 属性。

### Q: 如何处理 SSR 环境？
A: BTCWalletProvider 内置 SSR 保护，manager 在服务端为 null，客户端为实际实例。

### Q: 如何自定义主题和样式？
A: 使用 ConnectButton 组件的 `theme`、`size`、`variant` 属性进行配置。

### Q: 如何监听钱包事件？
A: 使用 useWalletEvent Hook，支持 'connect'、'disconnect'、'accountChange'、'networkChange'、'error' 等事件类型。

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