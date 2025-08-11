# BTC Connect 统一设计系统改进建议

基于对 React 和 Vue 组件库的详细分析，本文档提供具体的改进建议以确保两个框架的完全统一。

## 1. 立即实施的改进

### 1.1 统一 ConnectButton API

**当前差异：**
```typescript
// React
interface ConnectButtonProps {
  showBalance?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

// Vue
interface ConnectButtonProps {
  showNetworkIndicator?: boolean;
  buttonText?: string;
}
```

**建议统一 API：**
```typescript
interface ConnectButtonProps {
  // 基础属性
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  
  // 显示选项
  showWalletIcon?: boolean;
  showBalance?: boolean;
  showNetworkIndicator?: boolean;
  
  // 文本自定义
  connectText?: string;
  disconnectText?: string;
  connectingText?: string;
  
  // 事件处理
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}
```

### 1.2 统一 WalletModal 功能

**React 版本需要添加：**
- 搜索功能
- 钱包就绪状态检查
- 更好的错误处理

**Vue 版本需要添加：**
- 钱包分类显示（特色钱包）
- 动画效果选择
- 连接状态详细信息

### 1.3 统一 AccountInfo 变体

**建议统一变体命名：**
```typescript
type AccountInfoVariant = 'default' | 'compact' | 'detailed';

interface AccountInfoProps {
  variant?: AccountInfoVariant;
  showWallet?: boolean;
  showBalance?: boolean;
  showNetwork?: boolean;
  showCopyButton?: boolean;
  showQRCode?: boolean;
  showPublicKey?: boolean;
  addressFormat?: 'short' | 'medium' | 'full';
  balancePrecision?: number;
}
```

## 2. 共享设计系统架构

### 2.1 创建共享包结构

```
@btc-connect/
├── core/                    # 核心逻辑
├── design-system/           # 共享设计系统
│   ├── tokens/             # 设计令牌
│   ├── themes/             # 主题系统
│   ├── components/         # 基础组件样式
│   └── utilities/          # 工具函数
├── types/                  # 共享类型定义
├── react/                  # React 适配
├── vue/                    # Vue 适配
└── docs/                   # 文档
```

### 2.2 共享设计令牌文件

**文件：`@btc-connect/design-system/tokens/index.ts`**
```typescript
export const colors = {
  // 比特币品牌色
  btc: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // 主色调
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  // ... 其他颜色定义
};

export const spacing = {
  // 间距系统
};

export const borderRadius = {
  // 圆角系统
};

// ... 其他设计令牌
```

### 2.3 共享类型定义

**文件：`@btc-connect/types/components.ts`**
```typescript
import type { ThemeMode } from './themes';

// 基础组件属性
export interface BaseComponentProps {
  className?: string;
  disabled?: boolean;
}

// 按钮组件属性
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  onClick?: () => void;
}

// 连接按钮属性
export interface ConnectButtonProps extends ButtonProps {
  showWalletIcon?: boolean;
  showBalance?: boolean;
  showNetworkIndicator?: boolean;
  connectText?: string;
  disconnectText?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

// 模态框属性
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  animation?: 'fade' | 'slide' | 'scale';
}

// ... 其他组件类型
```

## 3. 组件实现标准化

### 3.1 ConnectButton 统一实现

**React 版本改进：**
```typescript
// packages/react/src/components/ConnectButton.tsx
import { useConnectWallet, useWallet } from '../context';
import { cn, formatAddress } from '../utils';
import type { ConnectButtonProps } from '@btc-connect/types';

export function ConnectButton({
  variant = 'primary',
  size = 'md',
  showWalletIcon = true,
  showBalance = false,
  showNetworkIndicator = true,
  connectText = '连接钱包',
  disconnectText = '断开连接',
  connectingText = '连接中...',
  onConnect,
  onDisconnect,
  onError,
  className,
}: ConnectButtonProps) {
  // 统一实现逻辑
  const { isConnected, isConnecting, currentWallet, account, balance } = useWallet();
  const { connect, disconnect } = useConnectWallet();

  const handleClick = async () => {
    try {
      if (isConnected) {
        await disconnect();
        onDisconnect?.();
      } else {
        await connect('unisat');
        onConnect?.();
      }
    } catch (error) {
      onError?.(error as Error);
    }
  };

  // 统一渲染逻辑
  return (
    <button
      onClick={handleClick}
      className={cn(
        // 统一的样式类
        getButtonClasses(variant, size),
        className
      )}
    >
      {/* 统一的内容渲染 */}
    </button>
  );
}
```

**Vue 版本改进：**
```vue
<!-- packages/vue/src/components/ConnectButton.vue -->
<template>
  <button
    :class="buttonClasses"
    :disabled="isConnecting || disabled"
    @click="handleClick"
  >
    <!-- 统一的内容渲染 -->
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useConnectWallet, useWallet } from '../composables';
import { cn, formatAddress } from '../utils/helpers';
import type { ConnectButtonProps } from '@btc-connect/types';

const props = withDefaults(defineProps<ConnectButtonProps>(), {
  variant: 'primary',
  size: 'md',
  showWalletIcon: true,
  showBalance: false,
  showNetworkIndicator: true,
  connectText: '连接钱包',
  disconnectText: '断开连接',
  connectingText: '连接中...',
  disabled: false,
});

const emit = defineEmits<{
  connect: [];
  disconnect: [];
  error: [error: Error];
}>();

// 统一实现逻辑
const { isConnected, isConnecting, currentWallet, account, balance } = useWallet();
const { connect, disconnect } = useConnectWallet();

const handleClick = async () => {
  try {
    if (isConnected.value) {
      await disconnect();
      emit('disconnect');
    } else {
      await connect('unisat');
      emit('connect');
    }
  } catch (error) {
    emit('error', error as Error);
  }
};

// 统一的样式计算
const buttonClasses = computed(() => {
  return cn(
    getButtonClasses(props.variant, props.size),
    props.className
  );
});
</script>
```

### 3.2 统一样式工具函数

**文件：`@btc-connect/design-system/utils/button.ts`**
```typescript
export function getButtonClasses(
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive',
  size: 'sm' | 'md' | 'lg'
): string[] {
  const baseClasses = [
    'inline-flex items-center justify-center',
    'rounded-md font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ];

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: [
      'bg-btc-500 text-white hover:bg-btc-600',
      'focus:ring-btc-500 focus:ring-offset-btc-50',
    ],
    secondary: [
      'bg-white text-btc-600 border border-btc-300',
      'hover:bg-btc-50 focus:ring-btc-500 focus:ring-offset-white',
    ],
    ghost: [
      'bg-transparent text-btc-600 hover:bg-btc-50',
      'focus:ring-btc-500 focus:ring-offset-transparent',
    ],
    destructive: [
      'bg-red-500 text-white hover:bg-red-600',
      'focus:ring-red-500 focus:ring-offset-red-50',
    ],
  };

  return [
    ...baseClasses,
    sizeClasses[size],
    ...variantClasses[variant],
  ];
}
```

## 4. 主题系统统一

### 4.1 共享主题管理

**文件：`@btc-connect/design-system/themes/index.ts`**
```typescript
import type { DesignTokens } from '../tokens';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContext {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  tokens: DesignTokens['colors'];
}

// 深色主题颜色映射
export const darkColors: DesignTokens['colors'] = {
  // 深色主题颜色定义
};

// 主题工具函数
export function createThemeManager() {
  // 统一的主题管理逻辑
}
```

### 4.2 React 主题提供者改进

```typescript
// packages/react/src/styles/BTCThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  ThemeContext, 
  ThemeMode, 
  darkColors, 
  createThemeManager 
} from '@btc-connect/design-system';

export function BTCThemeProvider({ 
  children, 
  defaultTheme = 'light' 
}) {
  const [theme, setTheme] = useState<ThemeMode>(defaultTheme);
  const themeManager = createThemeManager();

  // 使用统一的主题管理逻辑
  useEffect(() => {
    themeManager.applyTheme(theme);
  }, [theme]);

  const value: ThemeContext = {
    theme,
    setTheme,
    toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light'),
    tokens: theme === 'dark' ? darkColors : colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 4.3 Vue 主题提供者改进

```vue
<!-- packages/vue/src/styles/BTCThemeProvider.vue -->
<script setup lang="ts">
import { provide, computed } from 'vue';
import { 
  ThemeContext, 
  ThemeMode, 
  createThemeManager 
} from '@btc-connect/design-system';

const props = defineProps<{
  theme?: ThemeMode;
  defaultTheme?: ThemeMode;
}>();

const themeManager = createThemeManager();
const currentTheme = computed(() => props.theme || props.defaultTheme || 'light');

// 使用统一的主题管理逻辑
themeManager.applyTheme(currentTheme.value);

// 提供统一的主题上下文
provide<ThemeContext>('btcTheme', {
  theme: currentTheme,
  setTheme: (theme: ThemeMode) => {
    themeManager.applyTheme(theme);
  },
  toggleTheme: () => {
    const newTheme = currentTheme.value === 'light' ? 'dark' : 'light';
    themeManager.applyTheme(newTheme);
  },
  tokens: computed(() => 
    currentTheme.value === 'dark' ? darkColors : colors
  ),
});
</script>
```

## 5. 测试策略

### 5.1 视觉回归测试

**配置：`@btc-connect/tests/visual/regression.config.js`**
```javascript
export default {
  stories: ['../packages/*/src/components/**/*.stories.{js,jsx,ts,tsx}'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-css-modules',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};
```

### 5.2 跨框架组件测试

**文件：`@btc-connect/tests/cross-framework/components.test.ts`**
```typescript
import { render as renderReact } from '@testing-library/react';
import { render as renderVue } from '@testing-library/vue';
import { ConnectButton as ReactConnectButton } from '@btc-connect/react';
import { ConnectButton as VueConnectButton } from '@btc-connect/vue';

describe('ConnectButton Cross-Framework Consistency', () => {
  test('should have consistent props interface', () => {
    // 验证两个框架的组件 Props 类型一致
  });

  test('should render consistently with same props', () => {
    const props = {
      variant: 'primary',
      size: 'md',
      showWalletIcon: true,
    };

    const reactResult = renderReact(<ReactConnectButton {...props} />);
    const vueResult = renderVue(VueConnectButton, { props });

    // 验证渲染结果的一致性
  });

  test('should handle events consistently', () => {
    // 验证事件处理的一致性
  });
});
```

## 6. 文档统一

### 6.1 组件文档模板

**文件：`@btc-connect/docs/components/ConnectButton.mdx`**
```mdx
# ConnectButton

统一的连接按钮组件，支持 React 和 Vue。

## Import

### React
```tsx
import { ConnectButton } from '@btc-connect/react';
```

### Vue
```vue
<script setup>
import { ConnectButton } from '@btc-connect/vue';
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'ghost' \| 'destructive' | 'primary' | 按钮样式变体 |
| size | 'sm' \| 'md' \| 'lg' | 'md' | 按钮大小 |
| showWalletIcon | boolean | true | 是否显示钱包图标 |
| showBalance | boolean | false | 是否显示余额 |
| showNetworkIndicator | boolean | true | 是否显示网络指示器 |

## Events

| Event | Description |
|-------|-------------|
| connect | 连接成功时触发 |
| disconnect | 断开连接时触发 |
| error | 连接错误时触发 |

## Examples

### Basic Usage

#### React
```tsx
<ConnectButton
  onConnect={() => console.log('Connected')}
  onDisconnect={() => console.log('Disconnected')}
/>
```

#### Vue
```vue
<template>
  <ConnectButton
    @connect="handleConnect"
    @disconnect="handleDisconnect"
  />
</template>

<script setup>
const handleConnect = () => {
  console.log('Connected');
};

const handleDisconnect = () => {
  console.log('Disconnected');
};
</script>
```

### Custom Styling

#### React
```tsx
<ConnectButton
  variant="secondary"
  size="lg"
  className="custom-button"
  showBalance={true}
/>
```

#### Vue
```vue
<template>
  <ConnectButton
    variant="secondary"
    size="lg"
    class="custom-button"
    :show-balance="true"
  />
</template>
```
```

## 7. 实施计划

### 阶段 1：基础统一（2 周）
- [ ] 统一设计令牌
- [ ] 统一类型定义
- [ ] 统一 ConnectButton API
- [ ] 建立共享工具函数

### 阶段 2：组件对齐（3 周）
- [ ] 统一 WalletModal 功能
- [ ] 统一 AccountInfo 变体
- [ ] 统一 NetworkSwitch 显示模式
- [ ] 统一 WalletSelect 功能

### 阶段 3：测试和文档（2 周）
- [ ] 建立视觉回归测试
- [ ] 实施跨框架测试
- [ ] 统一组件文档
- [ ] 创建使用指南

### 阶段 4：发布和维护（持续）
- [ ] 版本同步发布
- [ ] 定期一致性检查
- [ ] 用户反馈收集
- [ ] 持续改进

## 8. 成功指标

### 技术指标
- [ ] 组件 API 一致性达到 95% 以上
- [ ] 视觉样式一致性达到 100%
- [ ] 测试覆盖率达到 90% 以上
- [ ] 文档完整性达到 100%

### 用户体验指标
- [ ] 跨框架切换成本降低 80%
- [ ] 开发效率提升 50%
- [ ] 用户满意度达到 90% 以上
- [ ] 问题报告减少 60%

通过实施这些改进建议，BTC Connect 将提供一个真正统一的多框架组件库，为开发者提供一致的开发体验。