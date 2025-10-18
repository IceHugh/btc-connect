[根目录](../../CLAUDE.md) > [examples](../) > **nextjs**

# Next.js 示例项目

## 变更记录 (Changelog)

### 2025-10-18 09:27:07
- 完成 Next.js 示例项目文档生成
- 添加 SSR 兼容性详细说明和技术实现
- 补充服务器端渲染和客户端水合的测试指南
- 记录连接策略和事件处理的高级用法

## 项目概述

这是一个展示如何在 Next.js 应用中实现完整 SSR 兼容的 btc-connect 集成示例。该示例演示了服务器端渲染、客户端水合、动态组件加载、连接策略等高级功能，是 btc-connect 在现代 React 框架中的最佳实践展示。

## 项目结构

```
examples/nextjs/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 主页面 - 多主题展示
│   │   ├── layout.tsx            # 根布局
│   │   ├── globals.css           # 全局样式
│   │   └── ssr-test/
│   │       └── page.tsx          # SSR 测试页面
│   ├── components/
│   │   ├── SSRWalletProvider.tsx # SSR 兼容的钱包提供者
│   │   └── WalletConnectDemo.tsx # 钱包连接演示组件
│   └── types/
├── package.json                  # 项目配置
├── next.config.js               # Next.js 配置
├── tsconfig.json                # TypeScript 配置
└── README.md                    # 项目说明
```

## 核心功能演示

### 1. SSR 兼容的钱包提供者

项目实现了完全的 SSR 兼容，确保服务器端渲染不会出现水合错误：

```tsx
'use client';

import { useState, useEffect } from 'react';
import { BTCWalletProvider } from '@btc-connect/react';

export function SSRWalletProvider({ children, theme = 'light' }: SSRWalletProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 服务端渲染时显示加载占位符
  if (!isClient) {
    return (
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <h1>BTC Connect - Next.js SSR Example</h1>
        <p>Loading wallet connection functionality...</p>
        <div style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 16,
          backgroundColor: '#f8f9fa',
          textAlign: 'center'
        }}>
          <p><strong>SSR Loading State</strong></p>
          <p>Wallet components will be available after client-side hydration.</p>
        </div>
      </div>
    );
  }

  // 客户端渲染时才渲染完整的钱包提供者
  return (
    <BTCWalletProvider
      theme={theme}
      autoConnect={true}
      connectTimeout={5000}
      connectionPolicy={{
        tasks: [
          {
            id: 'sign-message',
            required: false,
            autoBehavior: 'skip',
            run: async ({ manager }) => {
              const adapter = manager.getCurrentAdapter();
              if (!adapter?.signMessage) {
                return { success: false };
              }
              try {
                const sig = await adapter.signMessage('SSR Demo message');
                return { success: true, data: sig };
              } catch (error) {
                console.error('Sign message failed:', error);
                return { success: false };
              }
            },
          },
        ],
        emitEventsOnAutoConnect: false,
      }}
    >
      <div className="ssr-ready">
        {children}
      </div>
    </BTCWalletProvider>
  );
}
```

### 2. 多主题支持

演示了如何在同一个页面中使用不同的主题：

```tsx
export default function Home() {
  return (
    <div>
      {/* Light Theme Example */}
      <SSRWalletProvider theme="light">
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
          <h2>Light Theme Example</h2>
          <WalletConnectDemo />
        </div>
      </SSRWalletProvider>

      {/* Dark Theme Example */}
      <SSRWalletProvider theme="dark">
        <div style={{
          padding: 24,
          maxWidth: 800,
          margin: '0 auto',
          backgroundColor: '#2a2a2a',
          color: '#fff'
        }}>
          <h2>Dark Theme Example</h2>
          <WalletConnectDemo />
        </div>
      </SSRWalletProvider>
    </div>
  );
}
```

### 3. 高级事件监听

展示了完整的事件监听和日志记录功能：

```tsx
export function WalletConnectDemo() {
  const [logs, setLogs] = useState<string[]>([]);
  const { address, balance, isConnected, isConnecting } = useWallet();
  const { openModal, isModalOpen } = useWalletModal();

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  // 监听所有钱包事件
  useWalletEvent('connect', (accounts) => {
    addLog(`Wallet connected with ${accounts.length} account(s)`);
  });

  useWalletEvent('disconnect', () => {
    addLog('Wallet disconnected');
  });

  useWalletEvent('accountChange', (accounts) => {
    addLog(`Account changed: ${accounts.length} account(s)`);
  });

  useWalletEvent('networkChange', (network) => {
    addLog(`Network changed to: ${network}`);
  });

  return (
    // ... 组件渲染
  );
}
```

### 4. 服务器端数据获取

展示了如何在 Next.js 中结合服务器端数据获取：

```tsx
// 模拟服务器端数据获取
async function getServerData() {
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    message: 'This content was server-side rendered',
    timestamp: new Date().toISOString(),
    wallets: [
      { id: 'unisat', name: 'UniSat Wallet', available: true },
      { id: 'okx', name: 'OKX Wallet', available: false },
      { id: 'xverse', name: 'Xverse Wallet', available: true }
    ]
  };
}

export default async function SSRTestPage() {
  const serverData = await getServerData();

  return (
    <SSRWalletProvider>
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <h1>SSR Test Page</h1>

        {/* Server-rendered content */}
        <section style={{ marginBottom: 32 }}>
          <h2>Server-Side Rendered Content</h2>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 16,
            backgroundColor: '#f0f8ff'
          }}>
            <p><strong>Message:</strong> {serverData.message}</p>
            <p><strong>Timestamp:</strong> {serverData.timestamp}</p>
            <p><strong>Available Wallets:</strong></p>
            <ul style={{ marginLeft: 20 }}>
              {serverData.wallets.map(wallet => (
                <li key={wallet.id}>
                  {wallet.name} - {wallet.available ? 'Available' : 'Not Available'}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Client-side wallet functionality */}
        <section style={{ marginBottom: 32 }}>
          <h2>Client-Side Wallet Functionality</h2>
          <WalletConnectDemo />
        </section>
      </div>
    </SSRWalletProvider>
  );
}
```

## 运行与开发

### 环境要求
- Node.js >= 18
- Next.js >= 15
- React >= 19
- TypeScript >= 5.0

### 安装和运行
```bash
# 进入示例目录
cd examples/nextjs

# 安装依赖
bun install

# 启动开发服务器
bun dev

# 构建生产版本
bun build

# 启动生产服务器
bun start
```

### 开发服务器
- 默认端口: 3000
- 热重载: 支持
- TypeScript 类型检查: 实时
- SSR 支持: 完整支持

## SSR 兼容性技术实现

### 核心原则
1. **客户端检测**: 使用 `useEffect` 和 `useState` 检测客户端环境
2. **条件渲染**: 服务器端显示占位符，客户端显示完整组件
3. **动态加载**: Web Components 仅在客户端加载
4. **事件隔离**: 事件监听器仅在客户端附加

### 实现步骤
1. **创建 SSR 兼容的 Provider 包装器**
2. **使用客户端检测逻辑**
3. **提供服务器端占位符 UI**
4. **确保无水合错误**

### 验证方法
1. **查看页面源代码**: 确认服务器端渲染内容
2. **禁用 JavaScript**: 验证基础内容仍可见
3. **启用 JavaScript**: 确认钱包组件变为可交互
4. **检查控制台**: 确认无水合错误

## 配置说明

### Next.js 配置
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 实验性功能配置
  },
  transpilePackages: ['@btc-connect/core', '@btc-connect/react'],
}

module.exports = nextConfig
```

### TypeScript 配置
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 依赖配置
```json
{
  "name": "example-nextjs",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@btc-connect/core": "workspace:*",
    "@btc-connect/react": "workspace:*",
    "next": "^15.2.4",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "devDependencies": {
    "@types/node": "^22.10.5",
    "@types/react": "^19.1.9",
    "@types/react-dom": "^19.1.7",
    "eslint": "^9.32.0",
    "eslint-config-next": "^15.2.4",
    "typescript": "~5.8.3"
  }
}
```

## 测试指南

### SSR 测试步骤
1. **基础 SSR 测试**
   ```bash
   bun build
   bun start
   # 访问 http://localhost:3000
   # 查看页面源代码，确认服务器端渲染内容
   ```

2. **水合测试**
   - 打开浏览器开发者工具
   - 禁用 JavaScript，刷新页面
   - 确认基础内容可见
   - 启用 JavaScript，确认钱包组件变为可交互
   - 检查控制台无水合错误

3. **多主题测试**
   - 测试浅色主题下的钱包连接
   - 测试深色主题下的钱包连接
   - 确认主题切换正常工作

4. **事件测试**
   - 连接钱包，观察事件日志
   - 切换账户，观察事件触发
   - 断开连接，观察状态更新

### 性能测试
1. **Core Web Vitals**
   - 使用 Lighthouse 测试页面性能
   - 确认 FCP、LCP、CLS 指标良好
   - 验证交互性延迟在可接受范围内

2. **包大小分析**
   ```bash
   bun run build
   bun run start
   # 分析 .next 目录中的包大小
   ```

## 常见问题

### Q: 如何处理 SSR 环境下的钱包检测？
A: 使用客户端检测模式：
```tsx
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);

if (!isClient) {
  return <SSRPlaceholder />;
}
```

### Q: 如何避免水合错误？
A: 确保服务器端和客户端的初始渲染一致：
- 服务器端显示静态占位符
- 客户端检测后再加载动态组件
- 使用条件渲染避免环境差异

### Q: 如何在 SSR 中使用钱包数据？
A: 钱包数据只能在客户端获取：
- 服务器端渲染通用内容
- 客户端获取钱包特定数据
- 使用加载状态和错误处理

### Q: 如何优化 SSR 性能？
A: 使用以下策略：
- 静态生成不依赖钱包的内容
- 客户端按需加载钱包组件
- 使用缓存策略减少重复请求
- 优化包大小和加载顺序

## 扩展建议

### 功能扩展
1. **多语言支持**: 添加 i18n 支持
2. **主题系统**: 完整的主题切换功能
3. **路由集成**: 在路由守卫中检查钱包状态
4. **API 集成**: 结合 Next.js API 路由

### 性能优化
1. **代码分割**: 进一步分割钱包相关代码
2. **预加载策略**: 智能预加载钱包组件
3. **缓存优化**: 优化钱包状态和数据的缓存
4. **Bundle 分析**: 持续监控和优化包大小

### 开发体验
1. **Storybook 集成**: 添加组件故事书
2. **测试覆盖**: 添加单元测试和集成测试
3. **CI/CD**: 设置自动化部署流程
4. **监控**: 添加错误监控和性能监控

## 相关文件清单

### 核心文件
- `src/app/page.tsx` - 主页面，多主题展示
- `src/app/ssr-test/page.tsx` - SSR 测试页面
- `src/components/SSRWalletProvider.tsx` - SSR 兼容的钱包提供者
- `src/components/WalletConnectDemo.tsx` - 钱包连接演示组件

### 配置文件
- `package.json` - 项目配置
- `next.config.js` - Next.js 配置
- `tsconfig.json` - TypeScript 配置
- `next-env.d.ts` - Next.js 类型声明

### 样式文件
- `src/app/globals.css` - 全局样式

## 变更记录 (Changelog)

### 2025-10-18 09:27:07
- 完成 Next.js 示例项目文档生成
- 添加 SSR 兼容性详细说明和技术实现
- 补充服务器端渲染和客户端水合的测试指南
- 记录连接策略和事件处理的高级用法