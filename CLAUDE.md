# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

btc-connect 是一个专为比特币 Web3 应用设计的钱包连接工具包，提供统一的连接接口、事件监听和适配层。项目采用 Monorepo 架构，使用 Bun 作为包管理器。

## 常用命令

### 根目录命令
```bash
# 开发
bun dev              # 并行启动所有模块的开发环境
bun build           # 构建所有模块
bun test            # 运行所有测试
bun lint            # 检查所有模块代码规范
bun typecheck       # 检查所有模块类型
bun install:all     # 安装依赖并构建所有模块
```

### 单独模块命令
```bash
# Core 模块
cd packages/core && bun run dev     # 开发模式
cd packages/core && bun run build   # 构建
cd packages/core && bun run test    # 测试
cd packages/core && bun run lint    # 代码检查

# React 模块
cd packages/react && bun run dev     # 开发模式
cd packages/react && bun run build   # 构建
cd packages/react && bun run test    # 测试
cd packages/react && bun run lint    # 代码检查

# Vue 模块
cd packages/vue && bun run dev      # 开发模式
cd packages/vue && bun run build    # 构建
cd packages/vue && bun run test     # 测试
cd packages/vue && bun run lint     # 代码检查
```

## 项目架构

### 模块结构
- **@btc-connect/core**: 框架无关的核心模块，定义统一的钱包接口协议
- **@btc-connect/react**: React 适配模块，提供 Context 和 Hooks
- **@btc-connect/vue**: Vue 适配模块，提供 Composables 和响应式状态

### 核心模块架构
- **adapters/**: 钱包适配器实现（UniSat、OKX、Xverse等）
- **managers/**: 连接状态管理和适配器注册
- **events/**: 事件系统，用于框架间通信
- **types/**: 类型定义
- **utils/**: 工具函数

### 依赖关系
```
@btc-connect/react → @btc-connect/core
@btc-connect/vue  → @btc-connect/core
```

## 开发规范

### 技术栈
- **包管理**: Bun
- **构建工具**: Bun build
- **类型检查**: TypeScript
- **代码规范**: ESLint + Prettier
- **测试框架**: Bun test

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 规则
- 所有模块都使用 ES Module 格式
- 统一的导出接口设计

### 钱包适配器接口
每个钱包适配器必须实现 `BTCWalletAdapter` 接口：
```typescript
interface BTCWalletAdapter {
  id: string
  name: string
  icon: string
  isReady(): boolean
  connect(): Promise<string[]>
  disconnect(): Promise<void>
  getAccounts(): Promise<string[]>
  getNetwork(): Promise<string>
  on(event: WalletEvent, handler: Function): void
  off(event: WalletEvent, handler: Function): void
}
```

## 测试

- 每个模块都有独立的测试目录
- 使用 Bun test 运行测试
- 测试文件放在 `tests/` 目录下
- 支持并行测试多个模块

## 构建

- 所有模块构建为 ES Module 格式
- 输出目录为 `dist/`
- 包含类型定义文件
- 支持代码分割和 tree shaking

## 发布

- 使用 workspace 管理依赖
- 每个模块可以独立发布
- 版本管理在各自的 package.json 中