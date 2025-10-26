# 变更日志

本文档记录了 btc-connect 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

## [0.3.11] - 2025-10-26

### 🐛 Bug 修复
- **核心包 (@btc-connect/core)**: 添加缺失的 `BTCWalletManager.switchNetwork()` 方法
- **React包 (@btc-connect/react)**: 修复 `useNetwork` Hook 中的网络切换功能
- **Vue包 (@btc-connect/vue)**: 修复 `useNetwork` Composable 中的网络切换功能

### ✨ 新功能
- **统一网络切换接口**: 现在所有三个包都支持完整的网络切换功能
- **改进错误处理**: 提供更清晰的错误提示和用户反馈
- **事件系统完善**: 网络切换时自动发射 `networkChange` 事件

### 🔧 技术改进
- **类型安全**: 完善所有 `switchNetwork` 方法的 TypeScript 类型定义
- **统一API**: 核心管理器、React Hook 和 Vue Composable 现在提供一致的接口
- **钱包兼容性**: 验证并确保 UniSat、Xverse 和 OKX 钱包的网络切换支持

### 📦 包更新
- **@btc-connect/core**: v0.3.11 - 核心钱包适配层和管理器
- **@btc-connect/react**: v0.3.11 - React Context 和 Hooks
- **@btc-connect/vue**: v0.3.11 - Vue Composables 和插件

### 📚 使用示例

#### 核心包使用
```typescript
import { BTCWalletManager } from '@btc-connect/core'

const manager = new BTCWalletManager()
await manager.switchNetwork('testnet')
```

#### React包使用
```typescript
import { useNetwork } from '@btc-connect/react'

const { network, switchNetwork } = useNetwork()
await switchNetwork('testnet')
```

#### Vue包使用
```typescript
import { useNetwork } from '@btc-connect/vue'

const { network, switchNetwork } = useNetwork()
await switchNetwork('testnet')
```

---

## [0.3.10] - 2025-10-24

### 🚀 性能优化
- **连接性能提升**: 移除自动获取public key和balance的逻辑以提升连接速度
- **增强钱包检测**: 实现20秒内每300ms轮询机制，支持延迟注入的钱包检测
- **实时更新**: 检测到新钱包时立即更新UI界面

### 🔧 技术改进
- **架构简化**: 移除z-index-manager模块及其相关逻辑，简化整体架构
- **错误修复**: 修复所有TypeScript类型和代码规范错误
- **完善机制**: 优化React和Vue的钱包检测实时更新机制

### 📦 包更新
- **@btc-connect/core**: v0.3.10 - 优化的核心适配层
- **@btc-connect/react**: v0.3.10 - 优化的React集成
- **@btc-connect/vue**: v0.3.10 - 优化的Vue集成

---

## [0.3.4] - 2025-10-19

### 🎨 新功能
- **主题切换功能**: Next.js 示例新增动态主题切换测试按钮
- **Provider级主题管理**: 统一在Provider层面管理主题，组件内部获取
- **视觉增强**: 添加主题切换动画效果和交互反馈

### 🔧 技术改进
- **组件命名统一**: 全面替换 `BTCConnectButton` 为 `ConnectButton`
- **架构优化**: 优化主题管理架构，提升组件一致性
- **SSR兼容**: 确保主题切换功能在Next.js SSR环境中正常工作

### 📦 包更新
- **@btc-connect/core**: v0.3.4 - 核心钱包适配层
- **@btc-connect/react**: v0.3.4 - React Context 和 Hooks
- **@btc-connect/vue**: v0.3.4 - Vue Composables 和插件

### 📚 文档
- 更新所有README和文档中的组件命名
- 完善主题管理相关的使用说明
- 添加Next.js主题切换示例文档

---

## [未发布]

### 🚀 新功能
- GitHub Actions CI/CD 自动化工作流
- 支持多包自动发布到 NPM
- 分支管理和保护策略
- 自动化版本发布流程

### 📦 包更新
- **@btc-connect/core**: 核心钱包适配层和管理器
- **@btc-connect/react**: React Context 和 Hooks
- **@btc-connect/vue**: Vue Composables 和插件

### 🔧 技术改进
- 完整的自动化测试流程
- 代码质量检查和类型检查
- 智能缓存系统优化构建性能
- 自动化 NPM 发布流程

### 📚 文档
- 添加完整的 CI/CD 文档说明
- 分支管理策略和命名规范
- 自动化发布流程指南

---

## 版本说明

### 版本类型
- **Major (主版本)**: 不兼容的 API 修改
- **Minor (次版本)**: 向下兼容的功能性新增
- **Patch (修订版)**: 向下兼容的问题修正

### 发布流程
1. 代码提交到 `main` 分支自动触发发布
2. 手动触发 Release 工作流进行版本发布
3. 自动更新版本号和发布到 NPM
4. 创建 GitHub Release 和更新 CHANGELOG

### 分支策略
- **main**: 生产环境分支，自动发布到 NPM
- **feature/***: 功能开发分支，PR 回 main
- **fix/***: 问题修复分支，PR 回 main
- **hotfix/***: 紧急修复分支，直接合并到 main
- **release/***: 版本发布分支，准备发布

### 安装使用

```bash
# 安装核心包
npm install @btc-connect/core

# 安装 React 集成
npm install @btc-connect/react

# 安装 Vue 集成
npm install @btc-connect/vue
```

更多信息请查看 [完整文档](https://github.com/icehugh/btc-connect)。