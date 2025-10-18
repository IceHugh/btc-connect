# Vue包完善及Nuxt示例创建计划

## 已明确的决策

- **框架版本**: 使用 Vue 3 + Composition API
- **构建工具**: 保持 Vite 作为默认构建工具
- **TypeScript**: 启用严格类型检查
- **SSR支持**: 必须支持服务器端渲染（Nuxt 3）
- **包管理**: 继续使用 Bun 作为包管理器
- **架构模式**: 参考 React 包的设计模式，适配 Vue 生态系统

## 整体规划概述

### 项目目标

基于成熟的 React 包实现，完善 Vue 包的功能对齐，添加缺失的高级特性，并创建 Nuxt 3 示例项目验证 SSR 兼容性。确保 Vue 包在功能完整性、性能表现和开发体验上与 React 包保持一致。

### 技术栈

**Vue 包**:
- Vue 3.3+ (Composition API)
- TypeScript 5.0+
- Vite 5.0+ (构建工具)
- Vue TSC (类型检查)

**Nuxt 示例**:
- Nuxt 3.8+ (SSR 框架)
- Vue 3.3+ (基础框架)
- TypeScript 5.0+
- Nitro (服务端引擎)

### 主要阶段

1. **阶段 1：React 包功能分析** - 深度分析 React 包的完整功能特性和实现细节
2. **阶段 2：Vue 包功能完善** - 对齐 React 包功能，实现缺失特性和性能优化
3. **阶段 3：Nuxt 示例创建与验证** - 创建 Nuxt 3 项目并验证 SSR 兼容性

### 详细任务分解

#### 阶段 1：React 包功能深度分析

- **任务 1.1**：React Context 系统架构分析
  - 目标：深入理解 React Provider 的状态管理和事件处理机制
  - 输入：React 包 context 实现
  - 输出：Context 架构分析文档
  - 涉及文件：`packages/react/src/context/provider.tsx`、`packages/react/src/context/reducer.ts`
  - 预估工作量：2小时

- **任务 1.2**：React Hooks 功能对比分析
  - 目标：梳理所有 React Hooks 的功能和接口设计
  - 输入：React hooks 实现
  - 输出：Hooks 功能对比表
  - 涉及文件：`packages/react/src/hooks/hooks.tsx` 及相关 hook 文件
  - 预估工作量：3小时

- **任务 1.3**：组件设计和 SSR 支持机制分析
  - 目标：分析 React 组件的 SSR 兼容性实现
  - 输入：React 组件实现
  - 输出：SSR 支持机制分析报告
  - 涉及文件：`packages/react/src/components/`
  - 预估工作量：2小时

- **任务 1.4**：TypeScript 类型系统完善度分析
  - 目标：分析 React 包的类型定义完整性和设计模式
  - 输入：React 类型定义
  - 输出：类型系统对比分析
  - 涉及文件：`packages/react/src/types/`
  - 预估工作量：2小时

#### 阶段 2：Vue 包功能完善

- **任务 2.1**：Context 系统对齐优化
  - 目标：实现与 React 包对等的 Context 状态管理功能
  - 输入：React Context 分析结果，Vue 现有实现
  - 输出：优化的 Vue 插件和上下文系统
  - 涉及文件：`packages/vue/src/walletContext.ts`、`packages/vue/src/composables/useCore.ts`
  - 预估工作量：4小时

- **任务 2.2**：Composables 功能完善
  - 目标：补全缺失的 Composables，实现与 React Hooks 对等功能
  - 输入：React Hooks 功能对比表
  - 输出：完整的 Composables 生态系统
  - 涉及文件：
    - 新建：`packages/vue/src/composables/useConnectWallet.ts`
    - 新建：`packages/vue/src/composables/useNetwork.ts`
    - 新建：`packages/vue/src/composables/useWallet.ts`
    - 新建：`packages/vue/src/composables/useWalletEvent.ts`
    - 优化：`packages/vue/src/composables/` 下现有文件
  - 预估工作量：6小时

- **任务 2.3**：组件系统对齐
  - 目标：实现与 React 组件对等的 Vue 组件
  - 输入：React 组件设计
  - 输出：完整的 Vue 组件库
  - 涉及文件：
    - 重构：`packages/vue/src/components/vue-connect-button.ts`
    - 重构：`packages/vue/src/components/vue-wallet-modal.ts`
    - 新建：`packages/vue/src/components/index.ts`
  - 预估工作量：4小时

- **任务 2.4**：TypeScript 类型系统完善
  - 目标：完善类型定义，确保与 React 包类型对等
  - 输入：React 类型系统分析
  - 输出：完整的 Vue 类型定义系统
  - 涉及文件：
    - 重构：`packages/vue/src/types/index.ts`
    - 新建：`packages/vue/src/types/core.ts`
    - 新建：`packages/vue/src/types/shared.ts`
  - 预估工作量：3小时

- **任务 2.5**：SSR 兼容性实现
  - 目标：确保 Vue 包在 SSR 环境下的稳定运行
  - 输入：React SSR 支持机制
  - 输出：SSR 兼容的 Vue 包
  - 涉及文件：`packages/vue/src/walletContext.ts`、所有 composables
  - 预估工作量：3小时

- **任务 2.6**：性能优化
  - 目标：实现与 React 包对等的性能优化
  - 输入：React 包性能优化措施
  - 输出：高性能的 Vue 包实现
  - 涉及文件：所有 Vue 包文件
  - 预估工作量：3小时

#### 阶段 3：Nuxt 示例创建与验证

- **任务 3.1**：Nuxt 3 项目初始化
  - 目标：创建标准的 Nuxt 3 项目结构
  - 输入：项目配置要求
  - 输出：基础 Nuxt 3 项目
  - 涉及文件：
    - 新建：`examples/nuxt/` 整个目录结构
    - 新建：`examples/nuxt/nuxt.config.ts`
    - 新建：`examples/nuxt/package.json`
  - 预估工作量：2小时

- **任务 3.2**：Vue 包集成测试
  - 目标：在 Nuxt 环境中集成 Vue 包并测试基础功能
  - 输入：完善后的 Vue 包
  - 输出：功能验证报告
  - 涉及文件：
    - 新建：`examples/nuxt/plugins/btc-connect.client.ts`
    - 新建：`examples/nuxt/composables/useBTC.ts`
    - 新建：`examples/nuxt/pages/index.vue`
    - 新建：`examples/nuxt/components/` 相关组件
  - 预估工作量：4小时

- **任务 3.3**：SSR 兼容性测试
  - 目标：验证 Vue 包在 SSR 环境下的兼容性
  - 输入：Nuxt 项目和 Vue 包
  - 输出：SSR 兼容性测试报告
  - 涉及文件：`examples/nuxt/pages/` 下的测试页面
  - 预估工作量：3小时

- **任务 3.4**：示例功能完善
  - 目标：创建完整的使用示例和文档
  - 输入：所有功能验证结果
  - 输出：完整的 Nuxt 示例项目
  - 涉及文件：
    - 新建：`examples/nuxt/README.md`
    - 新建：`examples/nuxt/CLAUDE.md`
    - 完善：所有示例页面和组件
  - 预估工作量：3小时

## 需要进一步明确的问题

### 问题 1：Vue 包是否需要 UI 组件库依赖

**当前状况**：
- React 包依赖 `@btc-connect/ui` 组件库
- Vue 包目前也依赖 `@btc-connect/ui`，但可能存在兼容性问题

**推荐方案**：

- **方案 A**：继续依赖 `@btc-connect/ui`，通过 Web Components 封装确保 Vue 兼容性
  - 优点：代码复用，维护成本低
  - 缺点：可能存在样式和交互兼容性问题
  - 实现：创建 Vue 包装组件

- **方案 B**：为 Vue 包创建独立的 UI 组件
  - 优点：完全符合 Vue 生态，性能更好
  - 缺点：代码重复，维护成本高
  - 实现：基于 Vue 3 重新实现所有 UI 组件

**等待用户选择**：

```
请选择您偏好的方案，或提供其他建议：
[ ] 方案 A：继续使用 @btc-connect/ui
[ ] 方案 B：创建独立的 Vue UI 组件
[ ] 其他方案：**\*\***\_**\*\***
```

### 问题 2：SSR 实现策略选择

**当前状况**：
- React 包内置 SSR 保护机制
- Vue 包需要实现类似的 SSR 兼容性

**推荐方案**：

- **方案 A**：基于 Vue 3 的 `onMounted` 生命周期进行客户端初始化
  - 优点：简单直接，符合 Vue 最佳实践
  - 缺点：首次加载可能存在闪烁
  - 实现：在 composables 中添加 SSR 检查逻辑

- **方案 B**：使用 Nuxt 3 的 `useState` + `onMounted` 混合策略
  - 优点：更好的 SSR 体验，避免闪烁
  - 缺点：实现复杂度较高
  - 实现：利用 Nuxt 的状态管理和客户端激活机制

**等待用户选择**：

```
请选择您偏好的方案，或提供其他建议：
[ ] 方案 A：基于 onMounted 的简单策略
[ ] 方案 B：基于 Nuxt 的混合策略
[ ] 其他方案：**\*\***\_**\*\***
```

### 问题 3：测试策略确定

**当前状况**：
- 所有模块都缺少测试文件
- 需要为 Vue 包和 Nuxt 示例添加测试

**推荐方案**：

- **方案 A**：使用 Vitest + Vue Test Utils 进行单元测试
  - 优点：与现有工具链一致，配置简单
  - 缺点：SSR 测试需要额外配置
  - 实现：创建完整的测试套件

- **方案 B**：使用 Vitest + Playwright 进行端到端测试
  - 优点：覆盖更完整的用户场景
  - 缺点：测试执行时间较长
  - 实现：创建 E2E 测试流程

**等待用户选择**：

```
请选择您偏好的方案，或提供其他建议：
[ ] 方案 A：Vitest + Vue Test Utils 单元测试
[ ] 方案 B：Vitest + Playwright E2E 测试
[ ] 方案 C：两者结合（单元测试 + E2E 测试）
[ ] 其他方案：**\*\***\_**\*\***
```

## 用户反馈区域

请在此区域补充您对整体规划的意见和建议：

```
用户补充内容：

---

---

---

```