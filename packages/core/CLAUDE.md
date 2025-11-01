# @btc-connect/core

## 变更记录 (Changelog)

### 2025-10-24 22:00:00
- 新增增强钱包检测机制：`detectAvailableWallets`函数支持轮询检测
- 移除z-index-manager模块，简化核心架构
- 优化连接性能：移除自动获取public key和balance的逻辑
- 添加`WalletDetectionConfig`和`WalletDetectionResult`类型定义
- 完善适配器检测的稳定性和兼容性

### 2025-10-16 09:31:52
- 完成核心模块架构分析和文档生成
- 添加适配器接口和管理器详细说明
- 补充类型系统和事件系统文档

## 模块职责

@btc-connect/core 是 btc-connect 项目的核心模块，提供框架无关的钱包适配层和管理系统。它定义了统一的比特币钱包接口协议，实现了适配器模式，并提供了完整的状态管理和事件系统。

## 入口与启动

### 主要入口文件
- **src/index.ts**: 主入口文件，导出所有公共接口
- **src/adapters/index.ts**: 适配器工厂和注册系统
- **src/managers/index.ts**: 钱包管理器实现
- **src/events/index.ts**: 事件系统实现
- **src/types/index.ts**: 类型定义系统
- **src/utils/index.ts**: 工具函数

### 初始化流程
```typescript
import { BTCWalletManager, createWalletManager } from '@btc-connect/core';

// 方式1: 直接创建管理器
const manager = new BTCWalletManager({
  onStateChange: (state) => console.log('State changed:', state),
  onError: (error) => console.error('Wallet error:', error)
});

// 方式2: 使用工厂函数
const manager = createWalletManager(config);

// 初始化适配器
manager.initializeAdapters();
```

## 对外接口

### 核心接口

#### BTCWalletAdapter
所有钱包适配器必须实现的核心接口：
```typescript
interface BTCWalletAdapter {
  readonly id: string;
  readonly name: string;
  readonly icon: string;

  isReady(): boolean;
  getState(): WalletState;

  connect(): Promise<AccountInfo[]>;
  disconnect(): Promise<void>;

  getAccounts(): Promise<AccountInfo[]>;
  getCurrentAccount(): Promise<AccountInfo | null>;

  getNetwork(): Promise<Network>;
  switchNetwork(network: Network): Promise<void>;

  on(event: WalletEvent, handler: (...args: any[]) => void): void;
  off(event: WalletEvent, handler: (...args: any[]) => void): void;

  signMessage(message: string): Promise<string>;
  signPsbt(psbt: string): Promise<string>;
  sendBitcoin(toAddress: string, amount: number): Promise<string>;
}
```

#### WalletManager
钱包管理器接口：
```typescript
interface WalletManager {
  config: WalletManagerConfig;

  register(adapter: BTCWalletAdapter): void;
  unregister(walletId: string): void;
  getAdapter(walletId: string): BTCWalletAdapter | null;
  getAllAdapters(): BTCWalletAdapter[];
  getAvailableWallets(): WalletInfo[];

  connect(walletId: string): Promise<AccountInfo[]>;
  disconnect(): Promise<void>;
  switchWallet(walletId: string): Promise<AccountInfo[]>;
  assumeConnected(walletId: string): Promise<AccountInfo[] | null>;

  getState(): WalletState;
  getCurrentAdapter(): BTCWalletAdapter | null;
  getCurrentWallet(): WalletInfo | null;

  on(event: WalletEvent, handler: (...args: any[]) => void): void;
  off(event: WalletEvent, handler: (...args: any[]) => void): void;

  destroy(): void;
}
```

### 适配器工厂
```typescript
// 创建特定类型的适配器
const unisatAdapter = createAdapter('unisat');
const okxAdapter = createAdapter('okx');

// 获取所有适配器
const allAdapters = getAllAdapters();

// 获取可用适配器（已安装的钱包）
const availableAdapters = getAvailableAdapters();

// 增强的钱包检测（支持轮询检测延迟注入的钱包）
const result = await detectAvailableWallets({
  timeout: 20000,        // 20秒超时
  interval: 300,         // 300ms检测间隔
  onProgress: (wallets, time) => {
    console.log(`检测到钱包: ${wallets.join(', ')} (${time}ms)`);
  }
});

console.log('检测结果:', {
  wallets: result.wallets,     // 检测到的钱包ID
  adapters: result.adapters,   // 可用的适配器实例
  elapsedTime: result.elapsedTime, // 总耗时
  isComplete: result.isComplete   // 是否完成检测
});
```

### 增强钱包检测接口
```typescript
interface WalletDetectionConfig {
  timeout?: number; // 超时时间（毫秒），默认20000
  interval?: number; // 轮询间隔（毫秒），默认300
  onProgress?: (detectedWallets: string[], elapsedTime: number) => void; // 进度回调
}

interface WalletDetectionResult {
  wallets: string[]; // 检测到的钱包ID列表
  adapters: BTCWalletAdapter[]; // 可用的适配器实例
  elapsedTime: number; // 总耗时
  isComplete: boolean; // 是否完成检测
}
```

## 关键依赖与配置

### 依赖关系
- 无外部运行时依赖
- 完全使用 TypeScript 编写
- 支持现代浏览器和 Node.js 环境

### 配置选项
```typescript
interface WalletManagerConfig {
  onError?: (error: Error) => void;
  onStateChange?: (state: WalletState) => void;
}
```

### 网络类型
```typescript
type Network = 'livenet' | 'testnet' | 'regtest' | 'mainnet';
```

### 连接状态
```typescript
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
```

## 数据模型

### 账户信息
```typescript
interface AccountInfo {
  address: string;
  publicKey?: string;
  balance?: number;
  network?: Network;
}
```

### 钱包信息
```typescript
interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  description?: string;
  homepage?: string;
}
```

### 钱包状态
```typescript
interface WalletState {
  status: ConnectionStatus;
  accounts: AccountInfo[];
  currentAccount?: AccountInfo;
  network?: Network;
  error?: Error;
}
```

### 错误类型
```typescript
class WalletError extends Error
class WalletNotInstalledError extends WalletError
class WalletConnectionError extends WalletError
class WalletDisconnectedError extends WalletError
```

## 测试与质量

### 当前测试状态
- ❌ 缺少单元测试
- ❌ 缺少集成测试
- ❌ 缺少端到端测试

### 建议测试覆盖
1. **适配器测试**: 测试每个钱包适配器的连接和操作
2. **管理器测试**: 测试钱包管理器的状态管理和事件处理
3. **事件系统测试**: 测试事件的正确触发和处理
4. **错误处理测试**: 测试各种错误场景的处理

### 质量工具
- **TypeScript**: 严格类型检查
- **Biome**: 代码格式化和规范检查
- **构建系统**: Bun build + 自定义构建脚本

## 常见问题 (FAQ)

### Q: 如何添加新的钱包适配器？
A: 实现 `BTCWalletAdapter` 接口，并在适配器工厂中注册：
```typescript
class NewWalletAdapter extends BaseWalletAdapter {
  id = 'newwallet';
  name = 'New Wallet';
  icon = 'icon-url';

  // 实现其他必要方法...
}

// 在 adapters/index.ts 中添加
export function createAdapter(type: string) {
  switch (type) {
    case 'newwallet':
      return new NewWalletAdapter();
    // ...
  }
}
```

### Q: 如何处理钱包连接状态变化？
A: 使用管理器的事件系统：
```typescript
manager.on('connect', (accounts) => {
  console.log('Connected with accounts:', accounts);
});

manager.on('disconnect', () => {
  console.log('Disconnected');
});

manager.on('accountChange', (accounts) => {
  console.log('Account changed:', accounts);
});
```

### Q: 如何实现自动连接？
A: 使用 `assumeConnected` 方法：
```typescript
// 尝试恢复之前的连接
const accounts = await manager.assumeConnected('unisat');
if (accounts) {
  console.log('Auto-connected with accounts:', accounts);
} else {
  console.log('No previous connection found');
}
```

## 相关文件清单

### 核心文件
- `src/index.ts` - 主入口文件
- `src/types/index.ts` - 类型定义
- `src/managers/index.ts` - 钱包管理器
- `src/events/index.ts` - 事件系统
- `src/utils/index.ts` - 工具函数

### 适配器文件
- `src/adapters/base.ts` - 基础适配器类
- `src/adapters/index.ts` - 适配器工厂
- `src/adapters/unisat.ts` - UniSat 钱包适配器
- `src/adapters/okx.ts` - OKX 钱包适配器
- `src/adapters/xverse.ts` - Xverse 钱包适配器

### 配置文件
- `package.json` - 包配置
- `tsconfig.json` - TypeScript 配置
- `build.js` - 自定义构建脚本

## 变更记录 (Changelog)

### 2025-10-16 09:31:52
- 完成核心模块架构分析和文档生成
- 添加适配器接口和管理器详细说明
- 补充类型系统和事件系统文档