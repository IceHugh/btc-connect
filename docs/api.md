# API 参考文档

本文档提供 btc-connect 所有 API 的详细说明和完整示例代码。

## 目录

- [核心包 API](#核心包-api)
- [React 包 API](#react-包-api)
- [Vue 包 API](#vue-包-api)
- [类型定义](#类型定义)
- [工具函数](#工具函数)
- [事件系统](#事件系统)

## 核心包 API

### BTCWalletManager

核心钱包管理器，提供统一的钱包操作接口。

```typescript
import { BTCWalletManager } from '@btc-connect/core';

const manager = new BTCWalletManager(config?: WalletManagerConfig);
```

#### 构造函数参数

```typescript
interface WalletManagerConfig {
  walletOrder?: string[];           // 钱包优先级顺序
  featuredWallets?: string[];        // 特色钱包列表
  theme?: ThemeMode;                 // 主题模式
  animation?: string;                // 动画效果
  showTestnet?: boolean;             // 是否显示测试网
  showRegtest?: boolean;             // 是否显示回归测试网
  connectionPolicy?: ConnectionPolicy; // 连接策略
}
```

#### 主要方法

##### connect(walletId: string)
连接指定钱包。

```typescript
const accounts = await manager.connect('unisat');
console.log('连接的账户:', accounts);
```

**参数:**
- `walletId: string` - 钱包ID (如 'unisat', 'okx', 'xverse')

**返回值:**
- `Promise<AccountInfo[]>` - 连接的账户信息数组

##### disconnect()
断开当前钱包连接。

```typescript
await manager.disconnect();
console.log('已断开连接');
```

**返回值:**
- `Promise<void>`

##### switchWallet(walletId: string)
切换到指定钱包。

```typescript
const accounts = await manager.switchWallet('okx');
console.log('切换到OKX钱包:', accounts);
```

**参数:**
- `walletId: string` - 目标钱包ID

**返回值:**
- `Promise<AccountInfo[]>` - 新钱包的账户信息数组

##### switchNetwork(network: Network)
切换网络。

```typescript
await manager.switchNetwork('testnet');
console.log('已切换到测试网');
```

**参数:**
- `network: Network` - 目标网络 ('livenet' | 'testnet' | 'regtest' | 'mainnet')

**返回值:**
- `Promise<void>`

##### 事件监听

```typescript
// 监听连接事件
manager.on('connect', (accounts) => {
  console.log('钱包已连接:', accounts);
});

// 监听断开事件
manager.on('disconnect', () => {
  console.log('钱包已断开');
});

// 监听账户变化
manager.on('accountChange', (accounts) => {
  console.log('账户已变化:', accounts);
});

// 监听网络变化
manager.on('networkChange', ({ network }) => {
  console.log('网络已切换到:', network);
});

// 移除事件监听器
manager.off('connect', handler);
```

### 钱包适配器

#### BTCWalletAdapter 接口

所有钱包适配器必须实现的接口。

```typescript
interface BTCWalletAdapter {
  readonly id: string;                    // 钱包唯一标识
  readonly name: string;                  // 钱包名称
  readonly icon: string;                  // 钱包图标URL

  // 状态检查
  isReady(): boolean;                     // 钱包是否就绪
  getState(): WalletState;                // 获取钱包状态

  // 连接管理
  connect(): Promise<AccountInfo[]>;      // 连接钱包
  disconnect(): Promise<void>;            // 断开连接

  // 账户信息
  getAccounts(): Promise<AccountInfo[]>;  // 获取所有账户
  getCurrentAccount(): Promise<AccountInfo | null>; // 获取当前账户

  // 网络管理
  getNetwork(): Promise<Network>;        // 获取当前网络
  switchNetwork(network: Network): Promise<void>; // 切换网络

  // 事件系统
  on<T extends WalletEvent>(event: T, handler: EventHandler<T>): void;
  off<T extends WalletEvent>(event: T, handler: EventHandler<T>): void;

  // 签名功能
  signMessage(message: string): Promise<string>;     // 签名消息
  signPsbt(psbt: string): Promise<string>;           // 签名PSBT
  sendBitcoin(toAddress: string, amount: number): Promise<string>; // 发送比特币
}
```

## React 包 API

### BTCWalletProvider

React Context Provider，为应用提供钱包状态管理。

```typescript
import { BTCWalletProvider } from '@btc-connect/react';

function App() {
  return (
    <BTCWalletProvider
      autoConnect={true}
      connectTimeout={5000}
      theme="auto"
      config={{
        walletOrder: ['unisat', 'okx', 'xverse'],
        featuredWallets: ['unisat', 'okx']
      }}
    >
      <YourApp />
    </BTCWalletProvider>
  );
}
```

#### Provider 属性

```typescript
interface WalletProviderProps {
  children: ReactNode;                    // 子组件
  config?: WalletManagerConfig;            // 钱包管理器配置
  autoConnect?: boolean;                   // 是否自动连接
  connectTimeout?: number;                 // 连接超时时间(ms)
  connectionPolicy?: ConnectionPolicy;     // 连接策略
}
```

### Hooks

#### useWallet - 统一钱包访问点

提供所有钱包功能的统一访问点。

```typescript
import { useWallet } from '@btc-connect/react';

function WalletComponent() {
  const {
    // === 基础状态 ===
    status,              // 连接状态: 'disconnected' | 'connecting' | 'connected' | 'error'
    accounts,            // 账户列表
    currentAccount,      // 当前账户信息
    network,             // 当前网络
    error,               // 错误信息
    currentWallet,       // 当前钱包信息
    isConnected,         // 是否已连接
    isConnecting,        // 是否正在连接
    theme,               // 主题模式
    address,             // 当前地址
    balance,             // 当前余额（聪）
    publicKey,           // 当前公钥

    // === 连接操作 ===
    connect,             // 连接指定钱包
    disconnect,          // 断开当前连接
    switchWallet,        // 切换到指定钱包
    availableWallets,    // 可用钱包列表

    // === 网络管理 ===
    switchNetwork,       // 切换网络

    // === 事件监听功能 ===
    useWalletEvent,      // 事件监听Hook

    // === 模态框控制 ===
    walletModal,         // 模态框控制

    // === 钱包管理器功能 ===
    currentAdapter,      // 当前适配器
    allAdapters,         // 所有适配器
    manager,             // 原始管理器实例

    // === 签名功能 ===
    signMessage,         // 签名消息
    signPsbt,            // 签名PSBT

    // === 交易功能 ===
    sendBitcoin,         // 发送比特币

    // === 工具函数快捷访问 ===
    utils                // 工具函数对象
  } = useWallet();

  // 连接钱包示例
  const handleConnect = async () => {
    try {
      const accounts = await connect('unisat');
      console.log('连接成功:', accounts);
    } catch (error) {
      console.error('连接失败:', error);
    }
  };

  // 事件监听示例
  useWalletEvent('accountChange', (accounts) => {
    console.log('账户变化:', accounts);
  });

  // 工具函数使用示例
  const formattedAddress = utils.formatAddress(address || '', {
    startChars: 6,
    endChars: 4
  });
  const formattedBalance = utils.formatBalance(balance || 0, {
    unit: 'BTC'
  });

  return (
    <div>
      {isConnected ? (
        <div>
          <p>钱包: {currentWallet?.name}</p>
          <p>地址: {formattedAddress}</p>
          <p>余额: {formattedBalance}</p>
          <p>网络: {network}</p>
          <button onClick={() => disconnect()}>断开连接</button>
        </div>
      ) : (
        <button onClick={handleConnect}>连接 UniSat</button>
      )}
    </div>
  );
}
```

#### useWalletEvent - 事件监听

提供跨框架的事件监听功能，支持自动清理和事件历史记录。

```typescript
import { useWalletEvent } from '@btc-connect/react';

function EventListener() {
  const { on, once, clear, eventHistory } = useWalletEvent('connect', (accounts) => {
    console.log('钱包连接:', accounts);
  });

  // 添加额外监听器
  const addExtraListener = () => {
    on((accounts) => {
      console.log('额外监听器:', accounts);
    });
  };

  // 一次性监听
  const addOnceListener = () => {
    once('disconnect', () => {
      console.log('钱包断开（仅一次）');
    });
  };

  // 清理所有监听器
  const clearAllListeners = () => {
    clear();
  };

  // 查看事件历史
  console.log('事件历史:', eventHistory);

  return (
    <div>
      <button onClick={addExtraListener}>添加监听器</button>
      <button onClick={addOnceListener}>添加一次性监听</button>
      <button onClick={clearAllListeners}>清理所有监听器</button>
    </div>
  );
}
```

#### useWalletManager - 高级钱包管理器

提供高级钱包管理功能，包括适配器操作和统计信息。

```typescript
import { useWalletManager } from '@btc-connect/react';

function WalletManagerComponent() {
  const {
    currentAdapter,      // 当前激活的适配器
    availableAdapters,   // 所有可用适配器列表
    adapterStates,       // 适配器状态数组
    getAdapter,          // 获取指定钱包的适配器
    addAdapter,          // 添加新适配器
    removeAdapter,       // 移除适配器
    manager,             // 原始管理器实例
    stats                // 管理器统计信息
  } = useWalletManager();

  // 获取特定适配器
  const unisatAdapter = getAdapter('unisat');
  console.log('UniSat适配器:', unisatAdapter);

  // 添加自定义适配器
  const handleAddAdapter = () => {
    const customAdapter = createCustomAdapter();
    addAdapter(customAdapter);
  };

  // 移除适配器
  const handleRemoveAdapter = (walletId: string) => {
    removeAdapter(walletId);
  };

  return (
    <div>
      <h3>钱包管理器状态</h3>
      <p>当前适配器: {currentAdapter?.name || '无'}</p>
      <p>统计: {stats.connectedAdapters}/{stats.totalAdapters} 已连接</p>

      <div>
        <h4>适配器状态</h4>
        {adapterStates.map(state => (
          <div key={state.id}>
            <span>{state.name} - {state.isConnected ? '已连接' : '未连接'}</span>
            <button onClick={() => handleRemoveAdapter(state.id)}>移除</button>
          </div>
        ))}
      </div>

      <button onClick={handleAddAdapter}>添加自定义适配器</button>
    </div>
  );
}
```

#### useTheme - 主题管理

提供完整的主题管理系统，支持亮色/暗色/自动主题切换。

```typescript
import { useTheme } from '@btc-connect/react';

function ThemeSelector() {
  const {
    theme,               // 当前主题模式
    systemTheme,         // 系统主题模式
    effectiveTheme,      // 有效主题（考虑系统设置）
    setTheme,            // 设置主题
    setThemeMode,        // 设置主题模式
    setCustomTheme,      // 设置自定义主题
    resetTheme           // 重置为默认主题
  } = useTheme();

  const handleSetDarkTheme = () => setTheme('dark');
  const handleSetLightTheme = () => setTheme('light');
  const handleSetAutoTheme = () => setThemeMode('auto');

  const handleCustomTheme = () => {
    setCustomTheme({
      colors: {
        primary: '#ff6b35',
        background: '#1a1a1a',
        text: '#ffffff',
        border: '#333333'
      },
      fonts: {
        primary: 'Arial, sans-serif',
        secondary: 'Helvetica, sans-serif'
      }
    });
  };

  return (
    <div>
      <p>当前主题: {theme}</p>
      <p>系统主题: {systemTheme}</p>
      <p>有效主题: {effectiveTheme}</p>

      <button onClick={handleSetLightTheme}>亮色主题</button>
      <button onClick={handleSetDarkTheme}>暗色主题</button>
      <button onClick={handleSetAutoTheme}>自动主题</button>
      <button onClick={handleCustomTheme}>自定义主题</button>
      <button onClick={resetTheme}>重置主题</button>
    </div>
  );
}
```

#### useWalletModalEnhanced - 增强模态框控制

增强的模态框控制功能，支持来源追踪和程序化控制。

```typescript
import { useWalletModalEnhanced } from '@btc-connect/react';

function ModalController() {
  const {
    isModalOpen,          // 模态框是否打开
    theme,                // 模态框主题
    openModal,            // 打开模态框
    closeModal,           // 关闭模态框
    toggleModal,          // 切换模态框状态
    forceClose,           // 强制关闭
    openWithSource,       // 带来源打开
    modalSource           // 模态框来源
  } = useWalletModalEnhanced();

  // 程序化打开模态框
  const openFromButton = () => {
    openWithSource('unisat', 'header-button');
  };

  // 紧急关闭模态框
  const handleForceClose = () => {
    forceClose();
  };

  return (
    <div>
      <p>模态框状态: {isModalOpen ? '打开' : '关闭'}</p>
      <p>来源: {modalSource || '无'}</p>

      <button onClick={openModal}>打开模态框</button>
      <button onClick={toggleModal}>切换状态</button>
      <button onClick={openFromButton}>从按钮打开</button>
      <button onClick={handleForceClose}>强制关闭</button>
      <button onClick={closeModal}>关闭模态框</button>
    </div>
  );
}
```

### 组件

#### ConnectButton

主要连接组件，已内置钱包选择模态框。

```typescript
import { ConnectButton } from '@btc-connect/react';

function App() {
  return (
    <div>
      {/* 基础用法 */}
      <ConnectButton />

      {/* 自定义主题和大小 */}
      <ConnectButton
        theme="dark"
        size="lg"
        variant="button"
        label="连接比特币钱包"
      />

      {/* 带事件处理 */}
      <ConnectButton
        onConnect={(walletId) => console.log('连接到:', walletId)}
        onError={(error) => console.error('连接错误:', error)}
        onDisconnect={() => console.log('已断开连接')}
      />
    </div>
  );
}
```

#### ConnectButton 属性

```typescript
interface ConnectButtonProps {
  theme?: 'light' | 'dark' | 'auto';    // 主题模式
  size?: 'sm' | 'md' | 'lg';             // 按钮大小
  variant?: 'select' | 'button' | 'compact'; // 显示变体
  label?: string;                         // 自定义标签
  disabled?: boolean;                     // 是否禁用
}
```

#### WalletModal

钱包选择模态框组件。

```typescript
import { WalletModal } from '@btc-connect/react';

function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>打开钱包选择</button>

      <WalletModal
        isOpen={isOpen}
        theme="auto"
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
```

#### WalletModal 属性

```typescript
interface WalletModalProps {
  isOpen?: boolean;              // 是否打开
  theme?: 'light' | 'dark' | 'auto'; // 主题模式
  onClose?: () => void;          // 关闭回调
}
```

## Vue 包 API

### BTCWalletPlugin

Vue 3 插件，为应用提供钱包功能。

```typescript
// main.ts
import { createApp } from 'vue';
import { BTCWalletPlugin } from '@btc-connect/vue';
import App from './App.vue';

const app = createApp(App);

app.use(BTCWalletPlugin, {
  autoConnect: true,
  theme: 'auto',
  config: {
    walletOrder: ['unisat', 'okx', 'xverse'],
    featuredWallets: ['unisat', 'okx']
  }
});

app.mount('#app');
```

#### 插件配置

```typescript
interface BTCWalletPluginOptions {
  autoConnect?: boolean;                   // 是否自动连接
  connectTimeout?: number;                 // 连接超时时间(ms)
  theme?: ThemeMode;                       // 主题模式
  modalConfig?: ModalConfig;               // 模态框配置
  config?: WalletManagerConfig;            // 钱包管理器配置
}
```

### Composables

#### useWallet - 统一钱包访问点

提供所有钱包功能的统一访问点，返回响应式状态和方法。

```vue
<template>
  <div>
    <div v-if="isConnected">
      <p>钱包: {{ currentWallet?.name }}</p>
      <p>地址: {{ formattedAddress }}</p>
      <p>余额: {{ formattedBalance }}</p>
      <p>网络: {{ network }}</p>
      <button @click="disconnect">断开连接</button>
    </div>
    <div v-else>
      <button @click="handleConnect">连接 UniSat</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useWallet } from '@btc-connect/vue';

const {
  // === 基础状态 (响应式) ===
  status,              // Ref<ConnectionStatus>
  accounts,            // Ref<AccountInfo[]>
  currentAccount,      // Ref<AccountInfo | undefined>
  network,             // Ref<Network>
  error,               // Ref<Error | undefined>
  currentWallet,       // Ref<WalletInfo | null>
  isConnected,         // Ref<boolean>
  isConnecting,        // Ref<boolean>
  theme,               // Ref<ThemeMode>
  address,             // Ref<string | undefined>
  balance,             // Ref<number | undefined>
  publicKey,           // Ref<string | undefined>

  // === 连接操作 ===
  connect,             // (walletId: string) => Promise<AccountInfo[]>
  disconnect,          // () => Promise<void>
  switchWallet,        // (walletId: string) => Promise<AccountInfo[]>
  availableWallets,    // Ref<WalletInfo[]>

  // === 网络管理 ===
  switchNetwork,       // (network: Network) => Promise<void>

  // === 事件监听功能 ===
  useWalletEvent,      // UseWalletEventFunction

  // === 模态框控制 ===
  walletModal,         // UseWalletModalReturn

  // === 钱包管理器功能 ===
  currentAdapter,      // Ref<BTCWalletAdapter | null>
  allAdapters,         // Ref<BTCWalletAdapter[]>
  manager,             // Ref<BTCWalletManager>

  // === 签名功能 ===
  signMessage,         // (message: string) => Promise<string>
  signPsbt,            // (psbt: string) => Promise<string>

  // === 交易功能 ===
  sendBitcoin,         // (toAddress: string, amount: number) => Promise<string>

  // === 工具函数快捷访问 ===
  utils                // UtilsObject
} = useWallet();

// 计算属性
const formattedAddress = computed(() =>
  utils.formatAddress(address.value || '', { startChars: 6, endChars: 4 })
);

const formattedBalance = computed(() =>
  utils.formatBalance(balance.value || 0, { unit: 'BTC' })
);

// 连接钱包
const handleConnect = async () => {
  try {
    const accounts = await connect('unisat');
    console.log('连接成功:', accounts);
  } catch (error) {
    console.error('连接失败:', error);
  }
};

// 事件监听
useWalletEvent('accountChange', (accounts) => {
  console.log('账户变化:', accounts);
});
</script>
```

#### useWalletEvent - 事件监听

提供跨框架的事件监听功能，支持自动清理。

```vue
<template>
  <div>
    <p>事件历史数量: {{ eventHistory.length }}</p>
    <button @click="addListener">添加监听器</button>
    <button @click="addOnceListener">添加一次性监听</button>
    <button @click="clearAll">清理所有监听器</button>
  </div>
</template>

<script setup>
import { useWalletEvent } from '@btc-connect/vue';

const { on, once, clear, eventHistory } = useWalletEvent('connect', (accounts) => {
  console.log('钱包连接:', accounts);
});

// 添加额外监听器
const addListener = () => {
  on((accounts) => {
    console.log('额外监听器:', accounts);
  });
};

// 一次性监听
const addOnceListener = () => {
  once('disconnect', () => {
    console.log('钱包断开（仅一次）');
  });
};

// 清理所有监听器
const clearAll = () => {
  clear();
};
</script>
```

#### useWalletManager - 高级钱包管理器

提供高级钱包管理功能，包括适配器操作和统计信息。

```vue
<template>
  <div>
    <h3>钱包管理器状态</h3>
    <p>当前适配器: {{ currentAdapter?.name || '无' }}</p>
    <p>统计: {{ stats.connectedAdapters }}/{{ stats.totalAdapters }} 已连接</p>

    <div>
      <h4>适配器状态</h4>
      <div v-for="state in adapterStates" :key="state.id">
        <span>{{ state.name }} - {{ state.isConnected ? '已连接' : '未连接' }}</span>
        <button @click="removeAdapter(state.id)">移除</button>
      </div>
    </div>

    <button @click="addCustomAdapter">添加自定义适配器</button>
  </div>
</template>

<script setup>
import { useWalletManager } from '@btc-connect/vue';

const {
  currentAdapter,      // Ref<BTCWalletAdapter | null>
  availableAdapters,   // Ref<BTCWalletAdapter[]>
  adapterStates,       // Ref<AdapterState[]>
  getAdapter,          // (walletId: string) => BTCWalletAdapter | null
  addAdapter,          // (adapter: BTCWalletAdapter) => void
  removeAdapter,       // (walletId: string) => void
  manager,             // Ref<BTCWalletManager>
  stats                // ComputedRef<ManagerStats>
} = useWalletManager();

// 获取特定适配器
const unisatAdapter = getAdapter('unisat');
console.log('UniSat适配器:', unisatAdapter);

// 添加自定义适配器
const addCustomAdapter = () => {
  const customAdapter = createCustomAdapter();
  addAdapter(customAdapter);
};
</script>
```

#### useTheme - 主题管理

提供完整的主题系统，支持亮色/暗色/自动主题切换。

```vue
<template>
  <div>
    <p>当前主题: {{ theme }}</p>
    <p>系统主题: {{ systemTheme }}</p>
    <p>有效主题: {{ effectiveTheme }}</p>

    <button @click="setTheme('light')">亮色主题</button>
    <button @click="setTheme('dark')">暗色主题</button>
    <button @click="setThemeMode('auto')">自动主题</button>
    <button @click="setCustomTheme">自定义主题</button>
    <button @click="resetTheme">重置主题</button>
  </div>
</template>

<script setup>
import { useTheme } from '@btc-connect/vue';

const {
  theme,               // Ref<ThemeMode>
  systemTheme,         // Ref<ThemeMode>
  effectiveTheme,      // ComputedRef<ThemeMode>
  setTheme,            // (theme: ThemeMode) => void
  setThemeMode,        // (mode: ThemeMode) => void
  setCustomTheme,      // (theme: CustomTheme) => void
  resetTheme           // () => void
} = useTheme();

// 设置自定义主题
const setCustomTheme = () => {
  setCustomTheme({
    colors: {
      primary: '#ff6b35',
      background: '#1a1a1a',
      text: '#ffffff',
      border: '#333333'
    },
    fonts: {
      primary: 'Arial, sans-serif',
      secondary: 'Helvetica, sans-serif'
    }
  });
};
</script>
```

#### useWalletModal - 全局模态框控制

全局模态框状态管理，支持来源追踪和程序化控制。

```vue
<template>
  <div>
    <p>模态框状态: {{ isOpen ? '打开' : '关闭' }}</p>
    <p>来源: {{ modalSource || '无' }}</p>

    <button @click="open">打开模态框</button>
    <button @click="toggle">切换状态</button>
    <button @click="openFromButton">从按钮打开</button>
    <button @click="forceClose">强制关闭</button>
    <button @click="close">关闭模态框</button>
  </div>
</template>

<script setup>
import { useWalletModal } from '@btc-connect/vue';

const {
  isOpen,              // Ref<boolean>
  theme,                // ComputedRef<ThemeMode>
  open,                 // (walletId?: string) => void
  close,                // () => void
  toggle,               // () => void
  forceClose,           // () => void
  currentWalletId,      // Ref<string | null>
  modalSource           // Ref<string | null>
} = useWalletModal('CustomComponent');

// 程序化打开模态框
const openFromButton = () => {
  open('unisat'); // 可指定默认钱包
};
</script>
```

### 组件

#### ConnectButton

主要连接组件，已内置钱包选择模态框。

```vue
<template>
  <div>
    <!-- 基础用法 -->
    <ConnectButton />

    <!-- 自定义主题和大小 -->
    <ConnectButton
      theme="dark"
      size="lg"
      variant="button"
      label="连接比特币钱包"
      @connect="handleConnect"
      @error="handleError"
      @disconnect="handleDisconnect"
    />
  </div>
</template>

<script setup>
import { ConnectButton } from '@btc-connect/vue';

const handleConnect = (walletId) => {
  console.log('连接到:', walletId);
};

const handleError = (error) => {
  console.error('连接错误:', error);
};

const handleDisconnect = () => {
  console.log('已断开连接');
};
</script>
```

#### ConnectButton 属性

```typescript
interface ConnectButtonProps {
  size?: 'sm' | 'md' | 'lg';             // 按钮大小
  variant?: 'select' | 'button' | 'compact'; // 显示变体
  label?: string;                         // 自定义标签
  disabled?: boolean;                     // 是否禁用
  theme?: 'light' | 'dark' | 'auto';    // 主题模式
  showBalance?: boolean;                  // 是否显示余额
  showAddress?: boolean;                  // 是否显示地址
  balancePrecision?: number;              // 余额精度
}
```

## 类型定义

### 核心类型

#### ConnectionStatus
```typescript
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
```

#### Network
```typescript
type Network = 'livenet' | 'testnet' | 'regtest' | 'mainnet';
```

#### ThemeMode
```typescript
type ThemeMode = 'light' | 'dark' | 'auto';
```

#### AccountInfo
```typescript
interface AccountInfo {
  address: string;        // 钱包地址
  publicKey?: string;     // 公钥
  name?: string;          // 账户名称
}
```

#### WalletInfo
```typescript
interface WalletInfo {
  id: string;             // 钱包ID
  name: string;           // 钱包名称
  icon: string;           // 钱包图标URL
  isInstalled: boolean;   // 是否已安装
  isReady: boolean;       // 是否就绪
}
```

#### WalletState
```typescript
interface WalletState {
  isConnected: boolean;           // 是否已连接
  isConnecting: boolean;          // 是否正在连接
  accounts: AccountInfo[];        // 账户列表
  currentAccount?: AccountInfo;   // 当前账户
  network: Network;               // 当前网络
  error?: Error;                  // 错误信息
}
```

### 事件类型

#### WalletEvent
```typescript
type WalletEvent = 'connect' | 'disconnect' | 'accountChange' | 'networkChange' | 'error';
```

#### EventHandler
```typescript
type EventHandler<T extends WalletEvent> = (
  ...args: EventHandlerArgs<T>
) => void;
```

#### EventHistoryItem
```typescript
interface EventHistoryItem {
  event: WalletEvent;        // 事件类型
  timestamp: number;          // 时间戳
  data: any;                 // 事件数据
}
```

### 配置类型

#### WalletManagerConfig
```typescript
interface WalletManagerConfig {
  walletOrder?: string[];           // 钱包优先级顺序
  featuredWallets?: string[];        // 特色钱包列表
  theme?: ThemeMode;                 // 主题模式
  animation?: string;                // 动画效果
  showTestnet?: boolean;             // 是否显示测试网
  showRegtest?: boolean;             // 是否显示回归测试网
  connectionPolicy?: ConnectionPolicy; // 连接策略
}
```

#### ConnectionPolicy
```typescript
interface ConnectionPolicy {
  tasks: ConnectionPolicyTask[];              // 连接任务列表
  emitEventsOnAutoConnect?: boolean;          // 自动连接时是否发射事件
}
```

#### ConnectionPolicyTask
```typescript
interface ConnectionPolicyTask {
  run: (context: ConnectionPolicyTaskContext) => Promise<ConnectionPolicyTaskResult>;
  required?: boolean;           // 是否必须成功
  autoBehavior?: 'run' | 'skip'; // 自动连接时的行为
}
```

#### CustomTheme
```typescript
interface CustomTheme {
  colors?: {
    primary?: string;
    background?: string;
    text?: string;
    border?: string;
  };
  fonts?: {
    primary?: string;
    secondary?: string;
  };
}
```

## 工具函数

### 地址格式化

```typescript
import { formatAddress } from '@btc-connect/core';

const options = {
  startChars: 6,    // 开头显示字符数
  endChars: 4,      // 结尾显示字符数
  separator: '...'  // 分隔符
};

const formatted = formatAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', options);
console.log(formatted); // "bc1qxy2...h0wlh"
```

### 余额格式化

```typescript
import { formatBalance } from '@btc-connect/core';

const options = {
  unit: 'BTC',           // 单位: 'BTC' | 'satoshi' | 'mBTC'
  precision: 8,          // 精度
  showSymbol: true,      // 是否显示符号
  locale: 'en-US'        // 地区设置
};

const formatted = formatBalance(123456789, options);
console.log(formatted); // "1.23456789 BTC"
```

### 复制到剪贴板

```typescript
import { copyToClipboard } from '@btc-connect/core';

const copyAddress = async () => {
  try {
    await copyToClipboard('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
    console.log('地址已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
  }
};
```

### 地址验证

```typescript
import { validateAddress } from '@btc-connect/core';

const isValid = validateAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
console.log(isValid); // true

const isInvalid = validateAddress('invalid-address');
console.log(isInvalid); // false
```

### 金额验证

```typescript
import { validateAmount } from '@btc-connect/core';

const options = {
  minAmount: 1000,      // 最小金额（聪）
  maxAmount: 100000000, // 最大金额（聪）
  allowDecimals: false  // 是否允许小数
};

const isValid = validateAmount(50000, options);
console.log(isValid); // true
```

### 获取钱包图标

```typescript
import { getWalletIcon } from '@btc-connect/core';

const unisatIcon = getWalletIcon('unisat');
console.log(unisatIcon); // "https://example.com/icons/unisat.png"
```

### 时间戳格式化

```typescript
import { formatTimestamp } from '@btc-connect/core';

const options = {
  format: 'datetime',    // 格式: 'date' | 'time' | 'datetime'
  locale: 'zh-CN',       // 地区设置
  timezone: 'UTC'        // 时区
};

const formatted = formatTimestamp(Date.now(), options);
console.log(formatted); // "2024/1/1 12:00:00"
```

### 交易ID格式化

```typescript
import { formatTxid } from '@btc-connect/core';

const options = {
  startChars: 8,    // 开头显示字符数
  endChars: 8,      // 结尾显示字符数
  separator: '...'  // 分隔符
};

const formatted = formatTxid('f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16', options);
console.log(formatted); // "f4184fc5...e9e16"
```

### 费率计算

```typescript
import { calculateFeeRate } from '@btc-connect/core';

const feeRate = calculateFeeRate({
  fee: 1000,              // 手续费（聪）
  size: 250,              // 交易大小（字节）
  precision: 2            // 精度
});

console.log(feeRate); // 4.00 sat/byte
```

### 费率格式化

```typescript
import { formatFeeRate } from '@btc-connect/core';

const formatted = formatFeeRate(4.5, {
  unit: 'sat/byte',       // 单位
  precision: 2,           // 精度
  showUnit: true          // 是否显示单位
});

console.log(formatted); // "4.50 sat/byte"
```

## 事件系统

### 支持的事件类型

#### connect - 钱包连接
```typescript
manager.on('connect', (accounts: AccountInfo[]) => {
  console.log('钱包连接成功:', accounts);
});
```

#### disconnect - 钱包断开
```typescript
manager.on('disconnect', () => {
  console.log('钱包已断开连接');
});
```

#### accountChange - 账户变更
```typescript
manager.on('accountChange', (accounts: AccountInfo[]) => {
  console.log('账户已变更:', accounts);
});
```

#### networkChange - 网络变更
```typescript
manager.on('networkChange', (data: { network: Network }) => {
  console.log('网络已切换到:', data.network);
});
```

#### error - 错误发生
```typescript
manager.on('error', (error: Error) => {
  console.error('钱包错误:', error);
});
```

### React 事件监听

```typescript
import { useWalletEvent } from '@btc-connect/react';

function Component() {
  useWalletEvent('connect', (accounts) => {
    console.log('连接事件:', accounts);
  });

  return null;
}
```

### Vue 事件监听

```vue
<script setup>
import { useWalletEvent } from '@btc-connect/vue';

useWalletEvent('connect', (accounts) => {
  console.log('连接事件:', accounts);
});
</script>
```

### 事件历史记录

```typescript
// React
const { eventHistory } = useWalletEvent('connect', handler);
console.log('连接事件历史:', eventHistory);

// Vue
const { eventHistory } = useWalletEvent('connect', handler);
console.log('连接事件历史:', eventHistory.value);
```

## 错误处理

### 常见错误类型

#### WalletNotInstalledError
钱包未安装错误。

```typescript
try {
  await manager.connect('unisat');
} catch (error) {
  if (error instanceof WalletNotInstalledError) {
    console.error('UniSat钱包未安装，请先安装钱包扩展');
  }
}
```

#### ConnectionTimeoutError
连接超时错误。

```typescript
try {
  await manager.connect('unisat');
} catch (error) {
  if (error instanceof ConnectionTimeoutError) {
    console.error('连接超时，请检查钱包是否响应');
  }
}
```

#### UserRejectedError
用户拒绝连接错误。

```typescript
try {
  await manager.connect('unisat');
} catch (error) {
  if (error instanceof UserRejectedError) {
    console.error('用户取消了连接操作');
  }
}
```

#### NetworkError
网络错误。

```typescript
try {
  await manager.switchNetwork('testnet');
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('网络切换失败:', error.message);
  }
}
```

### 全局错误处理

```typescript
// React
function ErrorBoundary({ children }) {
  return (
    <ErrorBoundaryComponent
      fallback={<div>钱包连接出现错误</div>}
      onError={(error) => console.error('钱包错误:', error)}
    >
      {children}
    </ErrorBoundaryComponent>
  );
}

// Vue
app.config.errorHandler = (error, instance, info) => {
  console.error('Vue错误:', error);
  console.error('错误信息:', info);
};
```

## 完整示例

### React 完整示例

```tsx
import React, { useState } from 'react';
import {
  BTCWalletProvider,
  useWallet,
  useWalletEvent,
  ConnectButton
} from '@btc-connect/react';

function WalletInfo() {
  const {
    isConnected,
    address,
    balance,
    currentWallet,
    network,
    connect,
    disconnect,
    switchNetwork,
    signMessage,
    utils
  } = useWallet();

  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');

  // 事件监听
  useWalletEvent('accountChange', (accounts) => {
    console.log('账户变化:', accounts);
  });

  const handleConnect = async (walletId: string) => {
    try {
      await connect(walletId);
    } catch (error) {
      console.error('连接失败:', error);
    }
  };

  const handleSignMessage = async () => {
    if (!message) return;

    try {
      const sig = await signMessage(message);
      setSignature(sig);
    } catch (error) {
      console.error('签名失败:', error);
    }
  };

  const handleSwitchNetwork = async (network: string) => {
    try {
      await switchNetwork(network as any);
    } catch (error) {
      console.error('网络切换失败:', error);
    }
  };

  if (!isConnected) {
    return (
      <div>
        <h2>连接比特币钱包</h2>
        <button onClick={() => handleConnect('unisat')}>
          连接 UniSat
        </button>
        <button onClick={() => handleConnect('okx')}>
          连接 OKX
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>钱包信息</h2>
      <p>钱包: {currentWallet?.name}</p>
      <p>地址: {utils.formatAddress(address || '', { startChars: 6, endChars: 4 })}</p>
      <p>余额: {utils.formatBalance(balance || 0, { unit: 'BTC' })}</p>
      <p>网络: {network}</p>

      <button onClick={() => disconnect()}>断开连接</button>

      <h3>网络切换</h3>
      <button onClick={() => handleSwitchNetwork('livenet')}>主网</button>
      <button onClick={() => handleSwitchNetwork('testnet')}>测试网</button>

      <h3>消息签名</h3>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="输入要签名的消息"
      />
      <button onClick={handleSignMessage}>签名</button>
      {signature && <p>签名: {signature}</p>}
    </div>
  );
}

function App() {
  return (
    <BTCWalletProvider autoConnect={true}>
      <div>
        <h1>BTC Connect 示例</h1>
        <ConnectButton />
        <WalletInfo />
      </div>
    </BTCWalletProvider>
  );
}

export default App;
```

### Vue 完整示例

```vue
<template>
  <div>
    <h1>BTC Connect 示例</h1>

    <ConnectButton @connect="handleConnect" />

    <div v-if="isConnected">
      <h2>钱包信息</h2>
      <p>钱包: {{ currentWallet?.name }}</p>
      <p>地址: {{ formattedAddress }}</p>
      <p>余额: {{ formattedBalance }}</p>
      <p>网络: {{ network }}</p>

      <button @click="disconnect">断开连接</button>

      <h3>网络切换</h3>
      <button @click="switchToMainnet">主网</button>
      <button @click="switchToTestnet">测试网</button>

      <h3>消息签名</h3>
      <input
        v-model="message"
        placeholder="输入要签名的消息"
      />
      <button @click="signMessage">签名</button>
      <p v-if="signature">签名: {{ signature }}</p>
    </div>

    <div v-else>
      <h2>连接比特币钱包</h2>
      <button @click="connectUnisat">连接 UniSat</button>
      <button @click="connectOkx">连接 OKX</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  useWallet,
  useWalletEvent,
  ConnectButton
} from '@btc-connect/vue';

const {
  isConnected,
  address,
  balance,
  currentWallet,
  network,
  connect,
  disconnect,
  switchNetwork,
  signMessage: signMsg,
  utils
} = useWallet();

const message = ref('');
const signature = ref('');

// 计算属性
const formattedAddress = computed(() =>
  utils.formatAddress(address.value || '', { startChars: 6, endChars: 4 })
);

const formattedBalance = computed(() =>
  utils.formatBalance(balance.value || 0, { unit: 'BTC' })
);

// 事件监听
useWalletEvent('accountChange', (accounts) => {
  console.log('账户变化:', accounts);
});

const handleConnect = (walletId: string) => {
  console.log('连接到钱包:', walletId);
};

const connectUnisat = async () => {
  try {
    await connect('unisat');
  } catch (error) {
    console.error('连接失败:', error);
  }
};

const connectOkx = async () => {
  try {
    await connect('okx');
  } catch (error) {
    console.error('连接失败:', error);
  }
};

const switchToMainnet = async () => {
  try {
    await switchNetwork('livenet');
  } catch (error) {
    console.error('网络切换失败:', error);
  }
};

const switchToTestnet = async () => {
  try {
    await switchNetwork('testnet');
  } catch (error) {
    console.error('网络切换失败:', error);
  }
};

const signMessage = async () => {
  if (!message.value) return;

  try {
    const sig = await signMsg(message.value);
    signature.value = sig;
  } catch (error) {
    console.error('签名失败:', error);
  }
};
</script>
```

---

更多详细信息请参考：
- [🎯 统一指南](../UNIFICATION_GUIDE.md)
- [📝 变更记录](../CHANGELOG.md)
- [📖 快速开始](../QUICK_START.md)