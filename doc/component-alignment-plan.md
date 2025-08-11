# BTC Connect 组件 API 对齐计划

## 概述

基于第一阶段的共享设计系统和类型定义，第二阶段将统一 React 和 Vue 组件的 API 接口和功能特性。本计划详细说明了需要对齐的组件和具体的改进措施。

## 发现的 API 差异

### 1. ConnectButton 组件

#### React 版本特性
- ✅ 支持多种变体：`primary` | `secondary` | `ghost` | `destructive`
- ✅ 支持多种尺寸：`sm` | `md` | `lg`
- ✅ 自定义子内容支持
- ✅ 显示钱包图标和余额
- ✅ 连接状态指示
- ✅ 完整的事件处理：`onConnect` | `onDisconnect`
- ✅ 专门的 BTC 样式变体：`BTCConnectButton`
- ✅ 简约风格变体：`MinimalConnectButton`

#### Vue 版本特性
- ✅ 支持多种变体：`primary` | `secondary` | `ghost` | `destructive`
- ✅ 支持多种尺寸：`sm` | `md` | `lg`
- ✅ 自定义插槽支持
- ✅ 网络指示器
- ✅ 事件处理：`connect` | `disconnect` | `error`
- ❌ 缺少 BTC 样式变体
- ❌ 缺少简约风格变体
- ❌ 缺少余额显示功能

#### 需要对齐的功能
1. **添加 BTC 样式变体** - 为 Vue 版本添加 `BTCConnectButton` 组件
2. **添加简约风格变体** - 为 Vue 版本添加 `MinimalConnectButton` 组件
3. **统一余额显示** - 两个版本都支持 `showBalance` 属性
4. **统一事件命名** - 统一使用 `onConnect` / `onDisconnect` 模式
5. **统一属性命名** - `showWalletIcon` 而不是 `showNetworkIndicator`

### 2. WalletModal 组件

#### React 版本特性
- ✅ 完整的连接状态管理
- ✅ 特色钱包分组显示
- ✅ 钱包排序功能
- ✅ 多种动画效果：`fade` | `slide` | `scale`
- ✅ 网络信息显示
- ✅ 下载钱包链接
- ✅ 断开连接功能
- ✅ 键盘快捷键支持

#### Vue 版本特性
- ✅ 搜索功能
- ✅ 错误处理
- ✅ 帮助链接
- ✅ 钱包就绪状态检查
- ❌ 缺少特色钱包分组
- ❌ 缺少断开连接功能
- ❌ 缺少网络信息显示
- ❌ 缺少下载钱包链接

#### 需要对齐的功能
1. **添加特色钱包分组** - Vue 版本需要支持 `featuredWallets` 属性
2. **添加断开连接功能** - Vue 版本需要支持已连接状态
3. **统一动画选项** - 两个版本都支持相同的动画类型
4. **统一属性命名** - `featuredWallets` 而不是不同的命名
5. **添加下载链接** - Vue 版本需要钱包下载链接

### 3. AccountInfo 组件

#### React 版本特性
- ✅ 多种显示变体：`default` | `compact` | `detailed`
- ✅ 灵活的信息显示选项
- ✅ 地址格式化选项
- ✅ 复制和二维码功能

#### Vue 版本特性
- ❌ 缺少 AccountInfo 组件

#### 需要对齐的功能
1. **创建 Vue 版本** - 需要实现完整的 AccountInfo 组件
2. **统一 API** - 使用共享的类型定义

### 4. NetworkSwitch 组件

#### React 版本特性
- ✅ 多种显示模式：`select` | `button` | `compact` | `status`
- ✅ 网络状态指示
- ✅ 自定义网络支持

#### Vue 版本特性
- ❌ 缺少 NetworkSwitch 组件

#### 需要对齐的功能
1. **创建 Vue 版本** - 需要实现完整的 NetworkSwitch 组件
2. **统一 API** - 使用共享的类型定义

### 5. WalletSelect 组件

#### React 版本特性
- ✅ 网格和列表布局
- ✅ 特色钱包显示
- ✅ 搜索功能

#### Vue 版本特性
- ❌ 缺少 WalletSelect 组件

#### 需要对齐的功能
1. **创建 Vue 版本** - 需要实现完整的 WalletSelect 组件
2. **统一 API** - 使用共享的类型定义

## 实施计划

### 第一周：ConnectButton 对齐

#### 任务 1.1：扩展 Vue ConnectButton
- [ ] 添加 `BTCConnectButton` 组件
- [ ] 添加 `MinimalConnectButton` 组件
- [ ] 添加余额显示功能
- [ ] 统一事件命名
- [ ] 更新类型定义

#### 任务 1.2：更新 React ConnectButton
- [ ] 使用共享类型定义
- [ ] 添加缺失的事件处理
- [ ] 优化属性命名

### 第二周：WalletModal 对齐

#### 任务 2.1：扩展 Vue WalletModal
- [ ] 添加特色钱包分组功能
- [ ] 添加断开连接状态
- [ ] 添加网络信息显示
- [ ] 添加下载钱包链接
- [ ] 统一动画选项

#### 任务 2.2：更新 React WalletModal
- [ ] 使用共享类型定义
- [ ] 添加搜索功能（从 Vue 版本借鉴）
- [ ] 优化错误处理

### 第三周：缺失组件实现

#### 任务 3.1：实现 Vue AccountInfo
- [ ] 创建 AccountInfo 组件
- [ ] 支持所有显示变体
- [ ] 实现复制和二维码功能

#### 任务 3.2：实现 Vue NetworkSwitch
- [ ] 创建 NetworkSwitch 组件
- [ ] 支持所有显示模式
- [ ] 实现网络切换逻辑

#### 任务 3.3：实现 Vue WalletSelect
- [ ] 创建 WalletSelect 组件
- [ ] 支持网格和列表布局
- [ ] 实现搜索和筛选功能

## 技术实施细节

### 1. 使用共享设计系统

两个框架的组件都将使用新的共享设计系统：

```typescript
import { colors, spacing, borderRadius, cn, getButtonClasses } from '@btc-connect/design-system';
import type { ConnectButtonProps, WalletModalProps } from '@btc-connect/types';
```

### 2. 统一的组件结构

每个组件都将遵循统一的结构：

```typescript
// 组件属性接口
interface ComponentProps {
  // 使用共享类型定义
}

// 组件实现
function Component(props: ComponentProps) {
  // 使用共享设计系统
  // 统一的事件处理
  // 一致的状态管理
}
```

### 3. 事件处理统一

统一使用以下事件命名约定：

- `onConnect` - 连接成功
- `onDisconnect` - 断开连接
- `onError` - 错误处理
- `onNetworkChange` - 网络切换
- `onWalletSelect` - 钱包选择

### 4. 状态管理统一

两个框架都将使用统一的状态管理模式：

```typescript
// React: 使用 Context 和 Hooks
const { isConnected, currentWallet, account } = useWallet();

// Vue: 使用 Composables
const { isConnected, currentWallet, account } = useWallet();
```

## 预期成果

### 1. API 一致性
- ✅ 所有组件在两个框架中具有相同的 API
- ✅ 统一的属性命名和类型定义
- ✅ 一致的事件处理模式

### 2. 功能完整性
- ✅ React 和 Vue 版本功能完全对齐
- ✅ 支持所有主要的用例
- ✅ 完整的错误处理和状态管理

### 3. 开发体验
- ✅ 统一的文档和使用示例
- ✅ 一致的类型安全
- ✅ 相同的设计令牌和样式

### 4. 维护性
- ✅ 共享的类型定义减少重复
- ✅ 统一的设计系统便于维护
- ✅ 清晰的组件边界和职责

## 测试计划

### 1. 功能测试
- [ ] 所有组件的基本功能测试
- [ ] 事件处理测试
- [ ] 状态管理测试
- [ ] 错误处理测试

### 2. 视觉测试
- [ ] 组件外观一致性测试
- [ ] 响应式布局测试
- [ ] 主题切换测试

### 3. 跨框架测试
- [ ] React 和 Vue 版本的对比测试
- [ ] 类型定义一致性测试
- [ ] 集成测试

## 时间安排

- **第一周**：ConnectButton 对齐
- **第二周**：WalletModal 对齐
- **第三周**：缺失组件实现
- **第四周**：测试和文档

## 风险评估

### 1. 技术风险
- **中等**：组件复杂度可能超出预期
- **缓解**：分阶段实施，每个组件独立测试

### 2. 时间风险
- **低**：大部分功能已有实现，主要是对齐工作
- **缓解**：明确优先级，确保核心功能先完成

### 3. 兼容性风险
- **低**：使用共享类型定义确保兼容性
- **缓解**：逐步迁移，保持向后兼容

## 成功指标

### 1. 技术指标
- [ ] API 一致性：100%
- [ ] 功能覆盖率：100%
- [ ] 类型安全：100%
- [ ] 测试覆盖率：90%+

### 2. 用户体验指标
- [ ] 组件外观一致性：100%
- [ ] 交互一致性：100%
- [ ] 文档完整性：100%

### 3. 开发者体验指标
- [ ] 学习曲线：最小化
- [ ] 代码复用：最大化
- [ ] 维护成本：最小化

通过这个对齐计划，BTC Connect 将为 React 和 Vue 开发者提供完全一致的开发体验，大大提升项目的可用性和维护性。