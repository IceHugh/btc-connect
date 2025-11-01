# React 和 Vue 包统一化实施方案

## 📋 项目概述

### 目标
统一 `@btc-connect/react` 和 `@btc-connect/vue` 两个包的导出结构和功能，确保：
- 各个功能有单独的 hooks/composables
- 可以在 useWallet 中获取所有的 hooks
- 增加获取当前 adapter 的 hooks
- 增加设置 theme 的 hooks
- 增加 useWalletEvent 的 hooks
- 移除 Vue 的性能优化 hooks（包内使用即可）
- 增加 format address 和 balance 的 utils 函数导出
- 统一函数调用，避免框架切换带来的隐形成本

### 核心原则
- **向后兼容性**: 确保现有用户代码不受影响
- **功能对等性**: 两个包提供相同的功能集合
- **命名一致性**: 相同功能使用相同的命名约定
- **类型统一**: TypeScript 类型定义完全一致

## 📊 现状分析

### React 包当前状态
**优势**:
- 基础功能完整（连接、网络、余额、签名、交易）
- 组件结构清晰（ConnectButton、WalletModal）
- Context 状态管理成熟

**不足**:
- ❌ 缺少 `useWalletEvent` Hook
- ❌ 缺少直接访问 adapter 的 Hook
- ❌ 主题系统功能有限
- ❌ 性能监控功能缺失
- ⚠️ 模态框控制功能较弱

### Vue 包当前状态
**优势**:
- 功能覆盖完整，包含所有 React 包功能
- 高级模态框管理系统
- 完整的主题和配置系统
- 丰富的工具函数和类型定义

**需要优化**:
- ❌ 性能优化 hooks 过度暴露（useDebounce、useThrottle 等）
- ⚠️ 配置系统过于复杂
- ⚠️ 部分功能过度工程化

## 🎯 统一化目标架构

### 标准导出结构

#### React 包导出结构
```typescript
// packages/react/src/index.ts
export {
  // Provider & Context
  BTCWalletProvider,
  useWalletContext,

  // 核心 Hooks
  useWallet,
  useConnectWallet,
  useNetwork,
  useAccount,
  useBalance,
  useSignature,
  useTransactions,

  // 新增 Hooks
  useWalletEvent,        // 事件监听
  useWalletManager,      // 访问当前 adapter
  useTheme,             // 主题管理
  useWalletModal,       // 增强模态框控制

  // Components
  ConnectButton,
  WalletModal,

  // Utils
  formatAddress,
  formatBalance,

  // Types
  * from './types'
} from './internal-exports'
```

#### Vue 包导出结构
```typescript
// packages/vue/src/index.ts
export {
  // Plugin & Context
  BTCWalletPlugin,
  useWalletContext,      // 移除 createWalletContext，只保留一个 context

  // 核心 Composables
  useCore,
  useWallet,
  useConnectWallet,
  useNetwork,
  useAccount,
  useBalance,
  useSignature,
  useTransactions,

  // 统一 Composables
  useWalletEvent,        // 新增：事件监听
  useWalletManager,      // 新增：访问当前 adapter
  useTheme,             // 新增：主题管理
  useWalletModal,       // 保持：增强模态框控制

  // Components
  ConnectButton,
  WalletStatus,
  AddressDisplay,
  BalanceDisplay,

  // Utils
  formatAddress,
  formatBalance,

  // Types
  * from './types'
} from './internal-exports'

// 注意：以下性能优化 hooks 不再对外导出
// useDebounce, useThrottle, usePerformanceMonitor, useMemoryMonitor, useNetworkDetector
// 这些功能保留为内部使用
```

### 核心 Hook/Composable 接口统一

#### 1. useWallet - 统一钱包状态管理
```typescript
interface UseWalletReturn {
  // 连接状态
  isConnected: boolean
  isConnecting: boolean
  walletId: string | null

  // 账户信息
  account: AccountInfo | null
  accounts: AccountInfo[]

  // 网络信息
  network: Network

  // 操作方法
  connect: (walletId?: string) => Promise<AccountInfo[]>
  disconnect: () => Promise<void>
  switchWallet: (walletId: string) => Promise<void>

  // 获取其他 hooks（统一访问点）
  getBalance: () => ReturnType<typeof useBalance>
  getNetwork: () => ReturnType<typeof useNetwork>
  getAccount: () => ReturnType<typeof useAccount>
  getSignature: () => ReturnType<typeof useSignature>
  getTransactions: () => ReturnType<typeof useTransactions>
  getEvents: () => ReturnType<typeof useWalletEvent>
  getManager: () => ReturnType<typeof useWalletManager>
  getTheme: () => ReturnType<typeof useTheme>
  getModal: () => ReturnType<typeof useWalletModal>
}
```

#### 2. useWalletEvent - 统一事件监听
```typescript
interface UseWalletEventReturn {
  // 监听特定事件
  on: <T extends WalletEvent>(
    event: T,
    handler: EventHandler<T>
  ) => () => void // 返回取消监听函数

  // 一次性监听
  once: <T extends WalletEvent>(
    event: T,
    handler: EventHandler<T>
  ) => void

  // 移除监听
  off: <T extends WalletEvent>(
    event: T,
    handler?: EventHandler<T>
  ) => void

  // 事件历史（可选）
  eventHistory: WalletEventRecord[]

  // 清除所有监听
  clear: () => void
}
```

#### 3. useWalletManager - 访问当前 Adapter
```typescript
interface UseWalletManagerReturn {
  // 当前适配器
  currentAdapter: BTCWalletAdapter | null

  // 所有可用适配器
  availableAdapters: BTCWalletAdapter[]

  // 适配器状态
  adapterStates: Record<string, WalletState>

  // 高级操作
  getAdapter: (walletId: string) => BTCWalletAdapter | null
  addAdapter: (adapter: BTCWalletAdapter) => void
  removeAdapter: (walletId: string) => void

  // 原始管理器访问（高级用法）
  manager: BTCWalletManager
}
```

#### 4. useTheme - 统一主题管理
```typescript
interface UseThemeReturn {
  // 当前主题
  theme: Theme

  // 主题配置
  themeConfig: ThemeConfig

  // 切换主题
  setTheme: (theme: Theme) => void

  // 切换模式
  setThemeMode: (mode: 'light' | 'dark' | 'auto') => void

  // 自定义主题
  setCustomTheme: (config: Partial<ThemeConfig>) => void

  // 重置主题
  resetTheme: () => void

  // 主题状态
  isDark: boolean
  systemTheme: 'light' | 'dark'
}
```

#### 5. 增强的 useWalletModal
```typescript
interface UseWalletModalReturn {
  // 基础状态
  isOpen: boolean

  // 基础操作
  open: () => void
  close: () => void
  toggle: () => void

  // 增强功能
  openWithSource: (source: string) => void
  forceClose: () => void

  // 状态追踪
  openSource: string | null
  openCount: number

  // 配置
  config: ModalConfig
  setConfig: (config: Partial<ModalConfig>) => void
}
```

### 工具函数统一

#### formatAddress - 地址格式化
```typescript
function formatAddress(
  address: string,
  options?: {
    startChars?: number
    endChars?: number
    separator?: string
    threshold?: number
  }
): string

// 示例
formatAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')
// 返回: 'bc1q...0wlh'

formatAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', { startChars: 8, endChars: 4 })
// 返回: 'bc1qxy2...0wlh'
```

#### formatBalance - 余额格式化
```typescript
function formatBalance(
  satoshis: number,
  options?: {
    unit?: 'BTC' | 'satoshi' | 'mBTC'
    decimals?: number
    showSymbol?: boolean
    locale?: string
  }
): string

// 示例
formatBalance(123456789)
// 返回: '1.23456789 BTC'

formatBalance(123456789, { unit: 'mBTC', decimals: 2 })
// 返回: '1,234.57 mBTC'
```

## 📋 实施计划

### 阶段 1: 基础架构统一（预计 20 小时）

#### 任务 1.1: 设计统一的接口和类型定义（4 小时）
**目标**: 创建两个包共同遵循的接口规范
**输入**: 现有代码分析结果
**输出**:
- 更新的核心包类型定义
- 统一的 Hook/Composable 接口
- 工具函数类型定义

**涉及文件**:
```
packages/core/src/types/index.ts
packages/react/src/types/index.ts
packages/vue/src/types/index.ts
packages/react/src/types/shared.ts
packages/vue/src/types/shared.ts
```

**验收标准**:
- [ ] 两个包的类型定义 100% 一致
- [ ] 所有新增 Hook 都有完整的类型定义
- [ ] 工具函数类型覆盖所有使用场景

#### 任务 1.2: 更新 React 包导出结构（3 小时）
**目标**: 重新组织 React 包的导出，符合统一规范
**输入**: 统一的接口设计
**输出**: 更新的 React 包主入口文件

**涉及文件**:
```
packages/react/src/index.ts
packages/react/src/hooks/index.ts
```

**验收标准**:
- [ ] 导出结构符合目标架构
- [ ] 保持向后兼容性
- [ ] 所有导出都有正确的类型标注

#### 任务 1.3: 更新 Vue 包导出结构（3 小时）
**目标**: 重新组织 Vue 包的导出，移除性能优化 hooks
**输入**: 统一的接口设计
**输出**: 更新的 Vue 包主入口文件

**涉及文件**:
```
packages/vue/src/index.ts
packages/vue/src/composables/index.ts
```

**验收标准**:
- [ ] 移除性能优化 hooks 的对外导出
- [ ] 移除 createWalletContext 的导出，只保留 useWalletContext
- [ ] 导出结构符合目标架构
- [ ] 保持向后兼容性

#### 任务 1.4: 创建统一的工具函数模块（4 小时）
**目标**: 实现统一的地址和余额格式化函数
**输入**: 工具函数设计规范
**输出**:
- formatAddress 函数
- formatBalance 函数
- 其他通用工具函数

**涉及文件**:
```
packages/core/src/utils/index.ts
packages/react/src/utils/index.ts
packages/vue/src/utils/index.ts
```

**验收标准**:
- [ ] 工具函数在两个包中表现一致
- [ ] 完整的测试覆盖
- [ ] 详细的文档说明

#### 任务 1.5: 更新文档和示例（6 小时）
**目标**: 更新文档和示例代码，反映新的统一架构
**输入**: 更新后的包结构
**输出**:
- 更新的 README 文档
- 更新的示例代码
- API 文档

**涉及文件**:
```
packages/react/README.md
packages/vue/README.md
examples/*/src/*
```

**验收标准**:
- [ ] 文档与实际实现一致
- [ ] 示例代码可以正常运行
- [ ] API 文档完整准确

### 阶段 2: 功能补全和优化（预计 30 小时）

#### 任务 2.1: 实现 React 包的 useWalletEvent Hook（6 小时）
**目标**: 为 React 包添加事件监听功能
**输入**: Vue 包的事件监听实现，统一接口设计
**输出**: 完整的 useWalletEvent Hook 实现

**涉及文件**:
```
packages/react/src/hooks/useWalletEvent.ts
packages/react/src/hooks/index.ts
```

**验收标准**:
- [ ] 支持 connect、disconnect、accountChange、networkChange 等事件
- [ ] 与 Vue 包功能对等
- [ ] 完整的 TypeScript 支持
- [ ] 包含使用示例

#### 任务 2.2: 实现 React 包的 useWalletManager Hook（6 小时）
**目标**: 为 React 包添加直接访问 adapter 的功能
**输入**: Vue 包的 useCore 实现，统一接口设计
**输出**: 完整的 useWalletManager Hook 实现

**涉及文件**:
```
packages/react/src/hooks/useWalletManager.ts
packages/react/src/hooks/index.ts
```

**验收标准**:
- [ ] 可以获取当前 adapter
- [ ] 可以访问所有可用 adapter
- [ ] 提供高级操作方法
- [ ] 完整的错误处理

#### 任务 2.3: 实现 React 包的 useTheme Hook（6 小时）
**目标**: 为 React 包添加完整的主题管理功能
**输入**: Vue 包的主题系统实现，统一接口设计
**输出**: 完整的 useTheme Hook 实现

**涉及文件**:
```
packages/react/src/hooks/useTheme.ts
packages/react/src/hooks/index.ts
packages/react/src/context/theme.ts
```

**验收标准**:
- [ ] 支持亮色/暗色/自动主题
- [ ] 支持自定义主题配置
- [ ] 主题状态持久化
- [ ] 与 Vue 包功能对等

#### 任务 2.4: 增强 React 包的 useWalletModal Hook（6 小时）
**目标**: 提升 React 包模态框控制功能，与 Vue 包对等
**输入**: Vue 包的 useWalletModal 实现，统一接口设计
**输出**: 增强的 useWalletModal Hook 实现

**涉及文件**:
```
packages/react/src/hooks/useWalletModal.ts
packages/react/src/components/WalletModal.tsx
```

**验收标准**:
- [ ] 支持来源追踪
- [ ] 支持强制关闭
- [ ] 支持程序化控制
- [ ] 状态管理优化

#### 任务 2.5: 优化 Vue 包的性能优化功能（6 小时）
**目标**: 将 Vue 包的性能优化 hooks 改为内部使用
**输入**: 现有的性能优化实现
**输出**: 重新组织的性能优化模块

**涉及文件**:
```
packages/vue/src/composables/usePerformance.ts
packages/vue/src/internal/performance.ts
packages/vue/src/composables/index.ts
```

**验收标准**:
- [ ] 性能优化功能不再对外导出
- [ ] 保留内部使用能力
- [ ] 更新相关文档
- [ ] 保持向后兼容性

### 阶段 3: 核心功能增强（预计 16 小时）

#### 任务 3.1: 增强 useWallet Hook（8 小时）
**目标**: 为两个包的 useWallet 添加获取其他 hooks 的能力
**输入**: 统一的接口设计，现有 useWallet 实现
**输出**: 增强的 useWallet Hook

**涉及文件**:
```
packages/react/src/hooks/useWallet.ts
packages/vue/src/composables/useWallet.ts
```

**验收标准**:
- [ ] 可以通过 useWallet 获取所有其他 hooks
- [ ] 保持现有功能不变
- [ ] 性能优化（避免重复创建）
- [ ] 完整的 TypeScript 支持

#### 任务 3.2: 为 Vue 包添加缺失的 Hooks（8 小时）
**目标**: 为 Vue 包添加 useWalletEvent、useWalletManager、useTheme 等 hooks
**输入**: React 包的新实现，统一接口设计
**输出**: Vue 包的新 hooks 实现

**涉及文件**:
```
packages/vue/src/composables/useWalletEvent.ts
packages/vue/src/composables/useWalletManager.ts
packages/vue/src/composables/useTheme.ts
packages/vue/src/composables/index.ts
```

**验收标准**:
- [ ] 所有新 hooks 与 React 包功能对等
- [ ] 符合 Vue 组合式 API 最佳实践
- [ ] 完整的 TypeScript 支持
- [ ] 性能优化

### 阶段 4: 测试和文档完善（预计 8 小时）

#### 任务 4.1: 创建统一的测试套件（4 小时）
**目标**: 为新增和修改的功能创建完整的测试
**输入**: 更新后的代码实现
**输出**:
- React 包测试
- Vue 包测试
- 集成测试

**涉及文件**:
```
packages/react/src/**/*.test.ts
packages/vue/src/**/*.test.ts
```

**验收标准**:
- [ ] 测试覆盖率达到 90% 以上
- [ ] 两个包的测试用例一致
- [ ] 所有测试通过

#### 任务 4.2: 更新文档和迁移指南（4 小时）
**目标**: 更新所有文档，创建迁移指南
**输入**: 最终的代码实现
**输出**:
- 更新的 API 文档
- 迁移指南
- 最佳实践指南

**涉及文件**:
```
packages/react/README.md
packages/vue/README.md
MIGRATION.md
```

**验收标准**:
- [ ] 文档与实现完全一致
- [ ] 迁移指南清晰易懂
- [ ] 包含充分的使用示例

## ⚠️ 风险和决策点

### 需要决策的关键问题

1. **性能优化功能的保留范围**
   - **选项 A**: 完全移除性能优化 hooks 的对外导出，仅在内部使用
   - **选项 B**: 保留部分核心性能功能（如 useDebounce），移除过于专业的功能
   - **选项 C**: 将性能功能单独发布为 `@btc-connect/utils` 包

2. **工具函数共享策略**
   - **选项 A**: 在 core 包中实现，两个包都引用
   - **选项 B**: 在各自包中实现相同接口的函数
   - **选项 C**: 创建共享的工具包 `@btc-connect/shared-utils`

3. **主题系统的实现深度**
   - **选项 A**: 基础主题功能（亮色/暗色/自动）
   - **选项 B**: 完整主题定制（颜色、字体、间距等）
   - **选项 C**: 高级主题系统（CSS 变量、动态加载等）

### 向后兼容性风险

- **低风险**: 导出结构的调整（通过重新导出保持兼容）
- **中风险**: Hook 接口的变化（需要仔细设计默认参数）
- **高风险**: 现有功能的移除或重命名（必须提供迁移路径）

### 技术风险

- **性能风险**: useWallet 的增强可能影响性能
- **复杂度风险**: 统一两个框架的实现可能增加复杂度
- **维护风险**: 需要长期保持两个包的同步更新

## 📈 成功指标

### 功能指标
- [ ] React 包和 Vue 包功能 100% 对等
- [ ] 所有新增 Hook 完整实现
- [ ] 工具函数在两个包中表现一致
- [ ] 向后兼容性 100% 保持

### 质量指标
- [ ] 测试覆盖率达到 90% 以上
- [ ] TypeScript 类型覆盖率 100%
- [ ] 代码规范检查通过率 100%
- [ ] 文档完整性 100%

### 用户体验指标
- [ ] 框架切换的学习成本最小化
- [ ] API 一致性达到 100%
- [ ] 包体积增长控制在合理范围
- [ ] 性能无明显下降

## 🚀 实施时间表

### 第 1 周
- 周一: 任务 1.1 - 设计统一的接口和类型定义
- 周二: 任务 1.2 - 更新 React 包导出结构
- 周三: 任务 1.3 - 更新 Vue 包导出结构
- 周四: 任务 1.4 - 创建统一的工具函数模块
- 周五: 任务 1.5 开始 - 更新文档和示例

### 第 2 周
- 周一: 任务 1.5 完成 - 更新文档和示例
- 周二: 任务 2.1 - 实现 React 包的 useWalletEvent Hook
- 周三: 任务 2.2 - 实现 React 包的 useWalletManager Hook
- 周四: 任务 2.3 - 实现 React 包的 useTheme Hook
- 周五: 任务 2.4 - 增强 React 包的 useWalletModal Hook

### 第 3 周
- 周一: 任务 2.5 - 优化 Vue 包的性能优化功能
- 周二: 任务 3.1 开始 - 增强 useWallet Hook
- 周三: 任务 3.1 完成 - 增强 useWallet Hook
- 周四: 任务 3.2 开始 - 为 Vue 包添加缺失的 Hooks
- 周五: 任务 3.2 完成 - 为 Vue 包添加缺失的 Hooks

### 第 4 周
- 周一: 任务 4.1 - 创建统一的测试套件
- 周二: 任务 4.2 - 更新文档和迁移指南
- 周三-周四: 集成测试和问题修复
- 周五: 最终验收和发布准备

## 💡 用户反馈区域

*请在此处添加您的意见和建议*

### 待决策问题
1. 性能优化功能的保留范围选择？
2. 工具函数共享策略选择？
3. 主题系统的实现深度选择？

### 其他需求
- [ ] 是否需要添加其他功能？
- [ ] 是否有特定的兼容性要求？
- [ ] 是否有性能方面的特殊考虑？

---

**最后更新**: 2025-11-01
**版本**: 1.0
**状态**: 待确认