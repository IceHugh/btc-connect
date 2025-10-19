# 变更日志

本文档记录了 btc-connect 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

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