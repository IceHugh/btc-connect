[根目录](../../CLAUDE.md) > [packages](../) > **vue**

# @btc-connect/vue

## 变更记录 (Changelog)

### 2025-10-16 09:31:52
- 完成 Vue 模块架构分析和文档生成
- 添加 Composables 和组件详细说明
- 补充插件系统和类型文档

## 模块职责

@btc-connect/vue 是 btc-connect 项目的 Vue 适配模块，为 Vue 应用提供完整的钱包连接功能。它通过 Vue 3 的组合式 API 和插件系统，提供了响应式的钱包管理方式，支持自动连接、状态持久化、TypeScript 支持等功能。

## 入口与启动

### 主要入口文件
- **src/index.ts**: 主入口文件，导出所有公共接口
- **src/walletContext.ts**: Vue 插件和上下文系统
- **src/composables/**: 组合式 API 实现
- **src/components/**: Vue 组件实现
- **src/types/**: 类型定义系统
- **src/utils/**: 工具函数

### 基本使用
```vue
<template>
  <div>
    <BTCConnectButton />
    <WalletModal />
  </div>
</template>

<script setup>
import { BTCConnectButton, WalletModal } from '@btc-connect/vue';
</script>
```

### 插件安装
```typescript
import { createApp } from 'vue';
import { BTCWalletPlugin } from '@btc-connect/vue';
import App from './App.vue';

const app = createApp(App);

app.use(BTCWalletPlugin, {
  autoConnect: true,
  config: {
    // 钱包管理器配置
  }
});

app.mount('#app');
```

## 对外接口

### 插件配置
```typescript
interface BTCWalletPluginOptions {
  autoConnect?: boolean;
  connectTimeout?: number;
  config?: WalletManagerConfig;
  connectionPolicy?: ConnectionPolicy;
}

app.use(BTCWalletPlugin, options);
```

### 核心 Composables

#### useCore - 核心钱包管理
```typescript
const {
  manager,           // 钱包管理器实例
  state,             // 钱包状态
  isConnected,       // 是否已连接
  isConnecting,      // 是否正在连接
  currentWallet,     // 当前钱包信息
  availableWallets,  // 可用钱包列表
} = useCore();
```

#### useAccount - 账户管理
```typescript
const {
  accounts,          // 账户列表
  currentAccount,    // 当前账户
  address,           // 当前地址
  publicKey,         // 公钥
  balance,           // 余额信息
} = useAccount();
```

#### useAutoConnect - 自动连接
```typescript
const {
  isAutoConnecting,  // 是否正在自动连接
  lastWalletId,      // 上次连接的钱包ID
} = useAutoConnect();
```

#### useBalance - 余额管理
```typescript
const {
  balance,           // 余额信息
  isLoading,         // 是否正在加载
  error,             // 错误信息
  refreshBalance,    // 刷新余额
} = useBalance();
```

#### useSignature - 签名功能
```typescript
const {
  signMessage,       // 签名消息
  signPsbt,          // 签名 PSBT
  isSigning,         // 是否正在签名
} = useSignature();
```

#### useTransactions - 交易功能
```typescript
const {
  sendBitcoin,       // 发送比特币
  sendTransaction,   // 发送交易
  isSending,         // 是否正在发送
} = useTransactions();
```

#### useWalletModal - 钱包模态框
```typescript
const {
  isOpen,            // 是否打开
  open,              // 打开模态框
  close,             // 关闭模态框
  toggle,            // 切换模态框
} = useWalletModal();
```

### 组件

#### BTCConnectButton - 连接按钮
```vue
<template>
  <BTCConnectButton
    theme="light"
    size="md"
    variant="select"
    label="Connect Wallet"
  />
</template>
```

#### VueWalletModal - 钱包模态框
```vue
<template>
  <VueWalletModal
    theme="light"
    :is-open="isModalOpen"
    @close="handleClose"
  />
</template>
```

## 关键依赖与配置

### 依赖关系
- **@btc-connect/core**: 核心钱包适配层
- **@btc-connect/ui**: UI 组件库
- **Vue**: >= 3.2.0

### 开发依赖
- **@vitejs/plugin-vue**: Vite Vue 插件
- **vue-tsc**: Vue TypeScript 编译器
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

### 钱包上下文类型
```typescript
interface WalletContext {
  manager: Ref<BTCWalletManager | null>;
  state: Ref<WalletState>;
  isConnected: Ref<boolean>;
  isConnecting: Ref<boolean>;
  currentWallet: Ref<WalletInfo | null>;
  availableWallets: Ref<WalletInfo[]>;
}
```

### 网络类型
```typescript
interface NetworkType {
  name: string;
  type: string;
}
```

### 主题类型
```typescript
interface ThemeType {
  mode: 'light' | 'dark' | 'auto';
  colors: Record<string, string>;
}
```

### 钱包类型
```typescript
interface WalletType {
  id: string;
  name: string;
  icon: string;
  description?: string;
}
```

## 测试与质量

### 当前测试状态
- ❌ 缺少单元测试
- ❌ 缺少组件测试
- ❌ 缺少组合式 API 测试

### 建议测试覆盖
1. **插件系统测试**: 测试插件的安装和初始化
2. **Composables 测试**: 测试每个组合式 API 的功能
3. **组件测试**: 测试 Vue 组件的渲染和交互
4. **响应性测试**: 测试状态变化的响应性
5. **TypeScript 测试**: 测试类型定义的准确性

### 质量工具
- **TypeScript**: 严格类型检查
- **Biome**: 代码格式化和规范检查
- **Vite**: 构建工具和开发服务器

## 常见问题 (FAQ)

### Q: 如何在组合式 API 中使用钱包功能？
A: 导入并使用相应的 composables：
```vue
<script setup>
import { useCore, useAccount, useBalance } from '@btc-connect/vue';

const { manager, isConnected } = useCore();
const { address, balance } = useAccount();
const { refreshBalance } = useBalance();

// 响应式使用钱包状态
watch(isConnected, (connected) => {
  if (connected) {
    refreshBalance();
  }
});
</script>
```

### Q: 如何自定义插件配置？
A: 在安装插件时传入配置：
```typescript
app.use(BTCWalletPlugin, {
  autoConnect: true,
  connectTimeout: 10000,
  config: {
    onStateChange: (state) => {
      console.log('Wallet state changed:', state);
    }
  }
});
```

### Q: 如何实现钱包切换功能？
A: 使用 useCore composable：
```vue
<script setup>
import { useCore } from '@btc-connect/vue';

const { manager, availableWallets } = useCore();

const switchWallet = async (walletId: string) => {
  if (manager.value) {
    await manager.value.switchWallet(walletId);
  }
};
</script>
```

### Q: 如何处理钱包事件？
A: 使用 manager 实例监听事件：
```vue
<script setup>
import { useCore } from '@btc-connect/vue';
import { onMounted, onUnmounted } from 'vue';

const { manager } = useCore();

const handleConnect = (accounts) => {
  console.log('Connected:', accounts);
};

onMounted(() => {
  if (manager.value) {
    manager.value.on('connect', handleConnect);
  }
});

onUnmounted(() => {
  if (manager.value) {
    manager.value.off('connect', handleConnect);
  }
});
</script>
```

## 相关文件清单

### 核心文件
- `src/index.ts` - 主入口文件
- `src/walletContext.ts` - 插件和上下文系统
- `src/types/index.ts` - Vue 特定类型
- `src/types/networks.ts` - 网络类型定义
- `src/types/themes.ts` - 主题类型定义
- `src/types/wallets.ts` - 钱包类型定义

### Composables
- `src/composables/index.ts` - Composables 入口
- `src/composables/useCore.ts` - 核心管理
- `src/composables/useAccount.ts` - 账户管理
- `src/composables/useAutoConnect.ts` - 自动连接
- `src/composables/useBalance.ts` - 余额管理
- `src/composables/useSignature.ts` - 签名功能
- `src/composables/useTransactions.ts` - 交易功能
- `src/composables/useWalletModal.ts` - 模态框管理

### 组件
- `src/components/index.ts` - 组件入口
- `src/components/vue-connect-button.ts` - 连接按钮组件
- `src/components/vue-wallet-modal.ts` - 钱包模态框组件

### 工具和配置
- `src/utils/index.ts` - 工具函数
- `package.json` - 包配置
- `tsconfig.json` - TypeScript 配置
- `vite.config.ts` - Vite 构建配置

## 变更记录 (Changelog)

### 2025-10-16 09:31:52
- 完成 Vue 模块架构分析和文档生成
- 添加 Composables 和组件详细说明
- 补充插件系统和类型文档