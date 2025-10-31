# Vue 组件使用指南

## 🎯 快速开始

### 基础使用

最简单的使用方式 - 只需导入 `ConnectButton` 组件：

```vue
<template>
  <div>
    <ConnectButton
      label="Connect Wallet"
      @connect="handleConnect"
      @disconnect="handleDisconnect"
    />
  </div>
</template>

<script setup>
import { ConnectButton } from '@btc-connect/vue';

const handleConnect = (walletId) => {
  console.log('Connected to:', walletId);
};

const handleDisconnect = () => {
  console.log('Disconnected');
};
</script>
```

### 高级用法

如需更多控制，可以使用 `useWalletModal` hook：

```vue
<template>
  <div>
    <ConnectButton
      theme="dark"
      size="lg"
      show-balance
      show-address
    />

    <!-- 自定义触发按钮 -->
    <button @click="openModal">Open Wallet Modal</button>
  </div>
</template>

<script setup>
import { ConnectButton, useWalletModal } from '@btc-connect/vue';

const { openModal, closeModal, isOpen } = useWalletModal('CustomButton');

// 程序化控制模态框
const handleCustomOpen = () => {
  openModal('unisat'); // 可选：指定默认钱包
};
</script>
```

## 📚 组件 API

### ConnectButton

主要的连接按钮组件，已内置钱包选择模态框。

#### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 按钮尺寸 |
| `variant` | `'select' \| 'button' \| 'compact'` | `'select'` | 按钮变体 |
| `label` | `string` | `'Connect Wallet'` | 按钮文本 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `theme` | `'light' \| 'dark' \| 'auto'` | `undefined` | 主题模式（未设置时从配置获取） |
| `showBalance` | `boolean` | `true` | 是否显示余额 |
| `showAddress` | `boolean` | `true` | 是否显示地址 |
| `balancePrecision` | `number` | `8` | 余额显示精度 |
| `class` | `string` | `''` | 自定义类名 |
| `style` | `StyleValue` | `{}` | 自定义样式 |

#### Events

| 事件 | 参数 | 描述 |
|------|------|------|
| `connect` | `walletId: string` | 钱包连接成功 |
| `disconnect` | - | 钱包断开连接 |
| `error` | `error: Error` | 发生错误 |
| `addressCopied` | `address: string` | 地址复制成功 |
| `balanceRefreshed` | - | 余额刷新完成 |

### useWalletModal Hook

提供全局模态框状态管理。

#### 返回值

```typescript
interface UseWalletModalReturn {
  isOpen: Ref<boolean>;        // 模态框是否打开
  theme: ComputedRef<ThemeMode>; // 当前主题
  open: (walletId?: string) => void; // 打开模态框
  close: () => void;            // 关闭模态框
  toggle: () => void;           // 切换模态框状态
  forceClose: () => void;        // 强制关闭
  currentWalletId: Ref<string | null>; // 当前选择的钱包ID
  modalSource: Ref<string | null>;    // 模态框打开来源
}
```

#### 使用示例

```vue
<script setup>
import { useWalletModal } from '@btc-connect/vue';

// 基础用法
const { open, close, isOpen } = useWalletModal();

// 带来源标识（推荐用于调试）
const { open: openFromHeader } = useWalletModal('Header');

// 程序化控制
const handleProgrammaticOpen = () => {
  openFromHeader('unisat'); // 打开并选择 UniSat 钱包
};
</script>
```

## 🎨 主题定制

### 配置主题

```typescript
import { createApp } from 'vue';
import { BTCWalletPlugin } from '@btc-connect/vue';

const app = createApp(App);

app.use(BTCWalletPlugin, {
  theme: 'dark', // 全局主题
  config: {
    theme: {
      mode: 'auto', // 跟随系统
      followSystem: true,
      colors: {
        // 自定义主题色
        primary: '#f7931a',
      }
    }
  }
});
```

### 组件级主题

```vue
<template>
  <!-- 覆盖全局主题 -->
  <ConnectButton theme="light" />

  <!-- 自动主题（跟随系统） -->
  <ConnectButton theme="auto" />
</template>
```

## 🔧 高级用法

### 自定义模态框触发

```vue
<template>
  <div>
    <!-- 隐藏默认按钮，只使用模态框 -->
    <ConnectButton v-if="false" />

    <!-- 自定义触发方式 -->
    <button @click="openModal">Custom Trigger</button>

    <!-- 键盘快捷键 -->
    <div @keydown.ctrl.k.prevent="openModal">
      Press Ctrl+K to open wallet modal
    </div>
  </div>
</template>

<script setup>
import { ConnectButton, useWalletModal } from '@btc-connect/vue';

const { openModal } = useWalletModal('KeyboardShortcut');
</script>
```

### 监听模态框状态

```vue
<script setup>
import { watch } from 'vue';
import { useWalletModal } from '@btc-connect/vue';

const { isOpen, modalSource } = useWalletModal();

// 监听模态框状态变化
watch(isOpen, (isOpen) => {
  if (isOpen) {
    console.log(`Modal opened from: ${modalSource.value}`);
    // 可以在这里添加自定义逻辑，如阻止背景滚动
    document.body.style.overflow = 'hidden';
  } else {
    console.log('Modal closed');
    document.body.style.overflow = '';
  }
});

// 清理副作用
onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>
```

### 全局模态框控制

```vue
<script setup>
import { useGlobalModal } from '@btc-connect/vue';

const globalModal = useGlobalModal();

// 在任何地方控制模态框
const openModalFromAnywhere = () => {
  globalModal.open('GlobalTrigger');
};

const closeModalFromAnywhere = () => {
  globalModal.close();
};

// 获取模态框状态
const modalState = globalModal.getState();
console.log('Modal state:', modalState);
</script>
```

## 🐛 调试

### 开发模式调试

在开发模式下，组件会输出详细的调试信息：

```javascript
// 在浏览器控制台中可以看到：
🔓 [useWalletModal] Opening modal from: ConnectButton
🔗 [ConnectButton] Connecting to wallet: unisat
✅ [ConnectButton] Successfully connected to unisat: [...]
🔒 [ConnectButton] Modal closed by user
```

### 状态检查

```vue
<script setup>
import { useWalletModal, useGlobalModal } from '@btc-connect/vue';

const { isOpen, modalSource } = useWalletModal();
const { state: globalState } = useGlobalModal();

// 在模板中显示调试信息
</script>

<template>
  <div v-if="process.env.NODE_ENV === 'development'" class="debug-info">
    <p>Modal isOpen: {{ isOpen }}</p>
    <p>Modal source: {{ modalSource }}</p>
    <p>Global state: {{ globalState }}</p>
  </div>
</template>
```

## 💡 最佳实践

1. **推荐使用 ConnectButton**：已经集成了模态框，开箱即用
2. **使用来源标识**：在 `useWalletModal` 中传入来源参数，便于调试
3. **主题一致性**：优先使用全局主题配置，组件级主题仅用于特殊情况
4. **事件监听**：监听 `@connect` 和 `@error` 事件来处理连接结果
5. **SSR 注意**：组件已内置 SSR 保护，无需额外处理

## 🔗 相关链接

- [useCore Hook](../composables/useCore.ts)
- [useWallet Hook](../composables/useWallet.ts)
- [配置系统](../config/index.ts)
- [类型定义](../types/index.ts)