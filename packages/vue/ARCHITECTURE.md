# @btc-connect/vue 架构设计文档

## 📋 概述

本文档描述了 @btc-connect/vue 包的架构设计，重点说明了如何避免全局状态污染并提供更好的 SSR 兼容性。

## 🎯 设计目标

1. **避免全局状态污染** - 支持多个 Vue 应用实例
2. **SSR 完全兼容** - 服务器端渲染无问题
3. **类型安全** - 完整的 TypeScript 支持
4. **向后兼容** - 保持现有 API 不变
5. **测试友好** - 易于单元测试和集成测试

## 🏗️ 架构演进

### 问题：全局状态污染

**原始方案问题**：
```typescript
// ❌ 问题代码
let globalContext: WalletContext | null = null;

export function useWalletContext(): WalletContext {
  if (!globalContext) {
    globalContext = createWalletContext();
  }
  return globalContext;
}
```

**存在的问题**：
- 多个 Vue 应用实例会互相干扰
- SSR 水合时可能出现状态不一致
- 测试时难以隔离状态
- 不符合 Vue 3 最佳实践

### 解决方案：Vue Provide/Inject 系统

**新的架构设计**：
```typescript
// ✅ 推荐方案
const BTC_WALLET_CONTEXT_KEY = Symbol('btc-wallet-context');

// 在插件中提供
app.provide(BTC_WALLET_CONTEXT_KEY, context);

// 在组件中注入
const context = inject<WalletContext>(BTC_WALLET_CONTEXT_KEY);
```

## 📦 API 设计

### 1. useWalletProvider() - 推荐使用

严格使用 Vue provide/inject 系统，无全局状态污染。

```typescript
import { useWalletProvider } from '@btc-connect/vue';

const { isConnected, connect, disconnect } = useWalletProvider();
```

**优点**：
- ✅ 避免全局状态污染
- ✅ 支持多个 Vue 应用实例
- ✅ 更好的 SSR 兼容性
- ✅ 更容易测试
- ⚠️ 必须在 BTCWalletPlugin 内使用

### 2. useWalletContext() - 向后兼容

优先使用 provide/inject，回退到全局状态。

```typescript
import { useWalletContext } from '@btc-connect/vue';

const context = useWalletContext();
```

**行为**：
1. 首先尝试从 Vue inject 系统获取
2. 如果失败，回退到全局状态
3. SSR 环境返回空上下文

### 3. useWalletSafe() - 安全模式

插件未安装时不会抛出错误，返回安全回退。

```typescript
import { useWalletSafe } from '@btc-connect/vue';

const { isConnected, connect } = useWalletSafe();

if (isConnected.value) {
  // 钱包功能可用
} else {
  // 显示提示信息
}
```

## 🔧 插件系统设计

### 插件注册

```typescript
import { BTCWalletPlugin } from '@btc-connect/vue';

app.use(BTCWalletPlugin, {
  autoConnect: true,
  theme: 'light',
  config: {
    onStateChange: (state) => {
      console.log('State changed:', state);
    }
  }
});
```

### 插件内部实现

```typescript
export const BTCWalletPlugin = {
  install(app: App, options: BTCWalletPluginOptions = {}) {
    // 1. 创建上下文
    const context = createWalletContext();

    // 2. 使用 Vue provide/inject 系统
    app.provide(BTC_WALLET_CONTEXT_KEY, context);

    // 3. 向后兼容：保留全局状态
    globalContext = context;
    app.config.globalProperties.$btc = context;
    app.provide('btc', context);
  }
};
```

## 🌐 SSR 兼容性设计

### SSR 环境检测

```typescript
export function useWalletContext(): WalletContext {
  // SSR 环境返回空上下文
  if (typeof window === 'undefined') {
    console.log('[useWalletContext] 🚫 SSR环境，返回空上下文');
    return createEmptyContext();
  }

  // 客户端正常逻辑
  const injectedContext = inject<WalletContext | null>(BTC_WALLET_CONTEXT_KEY, null);
  if (injectedContext) {
    return injectedContext;
  }

  // 回退逻辑...
}
```

### Nuxt 3 集成示例

```typescript
// plugins/btc-connect.client.ts
import { BTCWalletPlugin } from '@btc-connect/vue';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    nuxtApp.vueApp.use(BTCWalletPlugin, {
      autoConnect: true,
      theme: 'light'
    });
  }
});
```

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <ClientOnly>
      <WalletComponent />
    </ClientOnly>
  </div>
</template>
```

## 🧪 测试策略

### 单元测试示例

```typescript
import { createApp } from 'vue';
import { BTCWalletPlugin, useWalletProvider } from '@btc-connect/vue';

describe('useWalletProvider', () => {
  it('should work in isolated environment', () => {
    const app = createApp({});

    // 安装插件
    app.use(BTCWalletPlugin);

    // 测试组件
    const TestComponent = {
      setup() {
        const { isConnected } = useWalletProvider();
        expect(isConnected.value).toBe(false);
        return {};
      }
    };

    // 挂载测试
    const vm = mount(TestComponent, { global: { plugins: [app] } });
    // 测试逻辑...
  });
});
```

## 📊 架构对比

| 方案 | 全局状态污染 | SSR兼容性 | 多实例支持 | 测试难度 | 推荐度 |
|------|-------------|-----------|------------|----------|--------|
| 原始方案 | ❌ 有污染 | ⚠️ 需特殊处理 | ❌ 不支持 | 🔴 困难 | ⭐⭐ |
| provide/inject | ✅ 无污染 | ✅ 完全兼容 | ✅ 支持 | 🟢 简单 | ⭐⭐⭐⭐⭐ |
| 混合方案 | ✅ 无污染 | ✅ 完全兼容 | ✅ 支持 | 🟢 简单 | ⭐⭐⭐⭐ |

## 🚀 最佳实践

### 1. 新项目推荐使用

```typescript
// ✅ 推荐：使用 provide/inject
import { useWalletProvider, useWallet } from '@btc-connect/vue';

// 获取完整上下文
const { connect, disconnect, availableWallets } = useWalletProvider();

// 获取钱包状态
const { isConnected, address, balance } = useWallet();
```

### 2. 现有项目迁移

```typescript
// ✅ 现有代码无需修改
import { useWalletContext } from '@btc-connect/vue';

// 自动使用新的架构，无需修改代码
const context = useWalletContext();
```

### 3. 可选功能场景

```typescript
// ✅ 安全模式：功能可选
import { useWalletSafe } from '@btc-connect/vue';

const { isConnected, connect } = useWalletSafe();

try {
  await connect('unisat');
} catch (error) {
  if (error.message === 'Wallet plugin not installed') {
    // 显示安装提示
    showInstallPrompt();
  }
}
```

## 🔮 未来规划

1. **逐步废弃全局状态** - 在 v2.0 中完全移除
2. **增强类型安全** - 更严格的 TypeScript 类型
3. **性能优化** - 更好的缓存和懒加载
4. **插件生态** - 支持第三方插件扩展

## 📚 相关文档

- [Vue 3 Provide/Inject 文档](https://vuejs.org/guide/components/provide-inject.html)
- [Nuxt 3 插件文档](https://nuxt.com/docs/guide/directory-structure/plugins)
- [TypeScript 类型指南](./types.md)

---

*最后更新: 2025-10-31*