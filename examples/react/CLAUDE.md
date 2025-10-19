[根目录](../../CLAUDE.md) > [examples](../) > **react**

# React 示例项目

## 变更记录 (Changelog)

### 2025-10-16 09:31:52
- 完成 React 示例项目文档生成
- 添加项目结构和运行说明
- 补充使用示例和最佳实践

## 项目概述

这是一个展示如何在 React 应用中使用 @btc-connect/react 的示例项目。该示例演示了基本的钱包连接、状态管理、事件监听等核心功能，并提供了完整的开发环境配置。

## 项目结构

```
examples/react/
├── src/
│   ├── App.tsx              # 主应用组件
│   ├── App.css              # 应用样式
│   ├── main.tsx             # 应用入口
│   ├── index.css            # 全局样式
│   ├── vite-env.d.ts        # Vite 类型声明
│   └── assets/
│       └── react.svg        # React 图标
├── index.html               # HTML 模板
├── package.json             # 项目配置
└── tsconfig.json            # TypeScript 配置
```

## 核心功能演示

### 1. 基本钱包连接
```tsx
import { ConnectButton, WalletModal, useWallet, BTCWalletProvider } from '@btc-connect/react';

function AccountPreview() {
  const { address } = useWallet();
  return (
    <div style={{ marginTop: 16, fontSize: 14 }}>
      <div>
        <b>Address:</b> {address ?? '-'}
      </div>
    </div>
  );
}

function App() {
  return (
    <BTCWalletProvider theme="light" autoConnect={true}>
      <div style={{ padding: 24 }}>
        <h1 style={{ marginBottom: 16 }}>BTC Connect React Demo</h1>
        <ConnectButton label="Connect" />
        <AccountPreview />
        <WalletModal />
      </div>
    </BTCWalletProvider>
  );
}
```

### 2. 完整的 Provider 配置
```tsx
import { BTCWalletProvider } from '@btc-connect/react';

function App() {
  return (
    <BTCWalletProvider
      autoConnect={true}
      connectTimeout={10000}
      theme="light"
      config={{
        onStateChange: (state) => {
          console.log('Wallet state changed:', state);
        },
        onError: (error) => {
          console.error('Wallet error:', error);
        }
      }}
    >
      <WalletComponents />
    </BTCWalletProvider>
  );
}
```

### 3. 主题切换示例
```tsx
import { useState } from 'react';
import { ConnectButton, WalletModal, BTCWalletProvider } from '@btc-connect/react';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <BTCWalletProvider theme={theme}>
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            切换到 {theme === 'light' ? '暗色' : '亮色'} 主题
          </button>
        </div>
        <h1 style={{ marginBottom: 16 }}>BTC Connect React Demo</h1>
        <ConnectButton label="Connect" />
        <WalletModal />
      </div>
    </BTCWalletProvider>
  );
}
```

## 运行与开发

### 环境要求
- Node.js >= 18
- npm 或 yarn
- 现代浏览器（支持 ES2020）

### 安装和运行
```bash
# 进入示例目录
cd examples/react

# 安装依赖
bun install

# 启动开发服务器
bun dev

# 构建生产版本
bun build

# 预览构建结果
bun preview
```

### 开发服务器
- 默认端口: 5173
- 热重载: 支持
- TypeScript 类型检查: 实时
- 错误覆盖: 支持

## 使用示例

### 1. 基础用法示例
展示最简单的钱包连接集成：
```tsx
// 展示如何快速集成 btc-connect
// 包含连接按钮和基本状态显示
```

### 2. 高级用法示例
展示更复杂的功能：
```tsx
// 连接策略
// 自定义主题
// 事件监听
// 错误处理
```

### 3. 最佳实践示例
展示推荐的使用模式：
```tsx
// 错误边界
// 加载状态
// 响应式设计
// 可访问性
```

## 配置说明

### Vite 配置
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
})
```

### TypeScript 配置
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

### 依赖配置
```json
{
  "dependencies": {
    "@btc-connect/react": "workspace:*",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

## 测试指南

### 手动测试步骤
1. **环境准备**
   - 安装 UniSat 或 OKX 钱包扩展
   - 确保钱包已解锁

2. **功能测试**
   - 点击连接按钮，观察钱包选择界面
   - 选择钱包并授权连接
   - 验证地址和余额显示
   - 测试断开连接功能

3. **状态测试**
   - 刷新页面，验证自动连接
   - 切换钱包，验证状态更新
   - 测试网络切换功能

### 自动化测试建议
```bash
# 添加测试框架
bun add -D @testing-library/react @testing-library/jest-dom

# 运行测试
bun test
```

## 常见问题

### Q: 钱包连接失败怎么办？
A: 检查以下几点：
1. 确保钱包扩展已正确安装
2. 检查钱包是否已解锁
3. 查看浏览器控制台错误信息
4. 确认网络环境是否支持

### Q: 如何在开发环境中调试？
A: 使用以下工具：
1. 浏览器开发者工具
2. React DevTools
3. 钱包扩展的开发者工具
4. Vite 的错误覆盖界面

### Q: 如何构建生产版本？
A: 使用以下命令：
```bash
bun build
# 构建结果在 dist/ 目录
```

### Q: 如何部署到生产环境？
A: 可以部署到：
1. 静态文件服务器（如 Nginx）
2. Vercel、Netlify 等 CDN 平台
3. GitHub Pages
4. 云存储服务

## 扩展建议

### 功能扩展
1. **多钱包支持**: 添加更多钱包适配器
2. **交易功能**: 集成发送比特币功能
3. **NFT 支持**: 展示铭文和 NFT
4. **DeFi 集成**: 连接去中心化金融协议

### UI/UX 改进
1. **主题系统**: 完整的亮色/暗色主题
2. **动画效果**: 平滑的过渡和微交互
3. **响应式设计**: 适配移动端
4. **国际化**: 多语言支持

### 技术改进
1. **TypeScript**: 更严格的类型定义
2. **测试覆盖**: 单元测试和集成测试
3. **性能优化**: 代码分割和懒加载
4. **错误处理**: 完善的错误边界

## 相关文件清单

### 源代码
- `src/App.tsx` - 主应用组件
- `src/App.css` - 应用样式
- `src/main.tsx` - 应用入口
- `src/index.css` - 全局样式

### 配置文件
- `index.html` - HTML 模板
- `package.json` - 项目配置
- `tsconfig.json` - TypeScript 配置
- `vite.config.ts` - Vite 配置

### 资源文件
- `src/assets/react.svg` - React 图标

## 变更记录 (Changelog)

### 2025-10-16 09:31:52
- 完成 React 示例项目文档生成
- 添加项目结构和运行说明
- 补充使用示例和最佳实践