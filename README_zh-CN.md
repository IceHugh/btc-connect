# btc-connect

[![构建状态](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-repo/btc-connect)
[![NPM 版本](https://img.shields.io/npm/v/@btc-connect/core)](https://www.npmjs.com/package/@btc-connect/core)
[![许可证](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![欢迎 PR](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

一个为比特币 Web3 应用设计的一站式钱包连接工具包。`btc-connect` 提供了一个统一的、与框架无关的接口，用于连接各种比特币钱包，并为 React 和 Vue 提供了专门的支持。

## 主要特性

- **统一接口**: 通过单一、一致的 API 连接多个比特币钱包，如 UniSat、OKX 钱包和 Xverse。
- **框架支持**: 提供官方的 React (`@btc-connect/react`) 和 Vue (`@btc-connect/vue`) 包，通过自定义 Hooks 和 Composables 实现无缝集成。
- **类型安全**: 完全使用 TypeScript 编写，确保类型安全，并通过自动补全提供出色的开发体验。
- **Monorepo 架构**: 采用 monorepo 结构，便于管理包和为生态系统做贡献。
- **可定制设计**: 包含一个设计系统，可以进行主题化和定制，以适应您应用程序的外观和感觉。

## 包

本项目是一个包含以下包的 monorepo：

| 包                        | 描述                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| `@btc-connect/core`       | 与框架无关的核心，处理适配器、连接逻辑和事件。                       |
| `@btc-connect/react`      | React Hooks 和组件，便于与 React 应用程序集成。                      |
| `@btc-connect/vue`        | Vue Composables 和组件，便于与 Vue 应用程序无缝集成。                |
| `@btc-connect/design-system` | 核心设计系统、样式和主题化工具。                                     |
| `@btc-connect/shared`     | 在整个生态系统中使用的共享工具和类型。                               |
| `@btc-connect/types`      | 整个项目的集中式 TypeScript 类型定义。                               |

##快速入门

### 先决条件

确保您的系统上安装了 [Bun](https://bun.sh/)。

### 安装

1.  克隆仓库：
    ```bash
    git clone https://github.com/your-repo/btc-connect.git
    cd btc-connect
    ```

2.  使用 Bun 安装依赖：
    ```bash
    bun install
    ```

## 用法

以下是 React 和 Vue 的基本用法示例。有关更详细和高级的用例，请查看 `examples/` 目录中的应用程序。

### React

用 `BtcConnectProvider` 包裹您的应用程序，并使用 `useWallet` 钩子访问钱包状态和操作。

```tsx
// 在您的主 App 组件中
import React from 'react';
import { BtcConnectProvider } from '@btc-connect/react';

const App = () => {
  return (
    <BtcConnectProvider>
      <YourApp />
    </BtcConnectProvider>
  );
};

// 在任何子组件中
import { useWallet } from '@btc-connect/react';

const MyComponent = () => {
  const { connected, address, connect, disconnect } = useWallet();

  return (
    <div>
      {connected ? (
        <div>
          <p>已连接: {address}</p>
          <button onClick={() => disconnect()}>断开连接</button>
        </div>
      ) : (
        <button onClick={() => connect('unisat')}>连接 UniSat</button>
      )}
    </div>
  );
};
```

### Vue

在您的主应用程序文件中安装插件，并使用 `useWallet` 可组合函数。

```ts
// 在 main.ts 中
import { createApp } from 'vue';
import App from './App.vue';
import { btcConnect } from '@btc-connect/vue';

const app = createApp(App);
app.use(btcConnect);
app.mount('#app');
```

```vue
<!-- 在任何组件中 -->
<script setup lang="ts">
import { useWallet } from '@btc-connect/vue';

const { connected, address, connect, disconnect } = useWallet();

const handleConnect = () => {
  connect('okx');
};
</script>

<template>
  <div>
    <div v-if="connected">
      <p>已连接: {{ address }}</p>
      <button @click="disconnect">断开连接</button>
    </div>
    <div v-else>
      <button @click="handleConnect">连接 OKX 钱包</button>
    </div>
  </div>
</template>
```

## 开发

本项目使用 `bun` 进行脚本和包管理。

-   **构建所有包：**
    ```bash
    bun run build
    ```

-   **以开发模式运行所有包（监视更改）：**
    ```bash
    bun run dev
    ```

-   **运行测试：**
    ```bash
    bun test
    ```

-   **代码检查和格式化：**
    ```bash
    bun run lint
    bun run format
    ```

-   **类型检查：**
    ```bash
    bun run typecheck
    ```

## 贡献

欢迎贡献！请随时提出问题或提交拉取请求。

1.  Fork 仓库。
2.  创建您的功能分支 (`git checkout -b feature/AmazingFeature`)。
3.  提交您的更改 (`git commit -m 'Add some AmazingFeature'`)。
4.  推送到分支 (`git push origin feature/AmazingFeature`)。
5.  打开一个拉取请求。

在提交拉取请求之前，请确保运行 `bun run lint` 和 `bun test`。

## 许可证

本项目根据 MIT 许可证授权 - 有关详细信息，请参阅 [LICENSE](LICENSE) 文件。
