# btc-connect

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-repo/btc-connect)
[![NPM Version](https://img.shields.io/npm/v/@btc-connect/core)](https://www.npmjs.com/package/@btc-connect/core)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A one-stop wallet connection kit for Bitcoin Web3 applications. `btc-connect` provides a unified, framework-agnostic interface for connecting to various Bitcoin wallets, with dedicated support for React and Vue.

## Key Features

- **Unified Interface**: Connect to multiple Bitcoin wallets like UniSat, OKX Wallet, and Xverse through a single, consistent API.
- **Framework-Specific Support**: Provides official packages for React (`@btc-connect/react`) and Vue (`@btc-connect/vue`) with custom Hooks and Composables for seamless integration.
- **Type-Safe**: Fully written in TypeScript to ensure type safety and provide excellent developer experience with autocompletion.
- **Monorepo Architecture**: Organized as a monorepo, making it easy to manage packages and contribute to the ecosystem.
- **Customizable Design**: Includes a design system that can be themed and customized to fit your application's look and feel.

## Packages

This project is a monorepo containing the following packages:

| Package                   | Description                                                                  |
| ------------------------- | ---------------------------------------------------------------------------- |
| `@btc-connect/core`       | The framework-agnostic core, handling adapters, connection logic, and events. |
| `@btc-connect/react`      | React Hooks and Components for easy integration with React applications.     |
| `@btc-connect/vue`        | Vue Composables and Components for seamless integration with Vue applications. |

## Getting Started

### Prerequisites

Make sure you have [Bun](https://bun.sh/) installed on your system.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-repo/btc-connect.git
    cd btc-connect
    ```

2.  Install dependencies using Bun:
    ```bash
    bun install
    ```

## Usage

Below are basic usage examples for React and Vue. For more detailed and advanced use cases, please check the applications in the `examples/` directory.

### React

Wrap your application with `BtcConnectProvider` and use the `useWallet` hook to access wallet state and actions.

```tsx
// In your main App component
import React from 'react';
import { BtcConnectProvider } from '@btc-connect/react';

const App = () => {
  return (
    <BtcConnectProvider>
      <YourApp />
    </BtcConnectProvider>
  );
};

// In any child component
import { useWallet } from '@btc-connect/react';

const MyComponent = () => {
  const { connected, address, connect, disconnect } = useWallet();

  return (
    <div>
      {connected ? (
        <div>
          <p>Connected with: {address}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      ) : (
        <button onClick={() => connect('unisat')}>Connect UniSat</button>
      )}
    </div>
  );
};
```

### Vue

Install the plugin in your main application file and use the `useWallet` composable.

```ts
// in main.ts
import { createApp } from 'vue';
import App from './App.vue';
import { btcConnect } from '@btc-connect/vue';

const app = createApp(App);
app.use(btcConnect);
app.mount('#app');
```

```vue
<!-- In any component -->
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
      <p>Connected with: {{ address }}</p>
      <button @click="disconnect">Disconnect</button>
    </div>
    <div v-else>
      <button @click="handleConnect">Connect OKX Wallet</button>
    </div>
  </div>
</template>
```

## Development

This project uses `bun` for scripts and package management.

-   **Build all packages:**
    ```bash
    bun run build
    ```

-   **Run all packages in development mode (watch for changes):**
    ```bash
    bun run dev
    ```

-   **Run tests:**
    ```bash
    bun test
    ```

-   **Lint and format code:**
    ```bash
    bun run lint
    bun run format
    ```

-   **Type-check the code:**
    ```bash
    bun run typecheck
    ```

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

Please make sure to run `bun run lint` and `bun test` before submitting a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
