# @btc-connect/core

[中文文档](./README.zh-CN.md) | English

<p align="center">
  <strong>Framework-agnostic Bitcoin wallet connection toolkit</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@btc-connect/core">
    <img src="https://img.shields.io/npm/v/@btc-connect/core.svg" alt="NPM Version">
  </a>
  <a href="https://github.com/IceHugh/btc-connect/actions">
    <img src="https://github.com/IceHugh/btc-connect/workflows/CI/badge.svg" alt="CI">
  </a>
  <a href="https://codecov.io/gh/IceHugh/btc-connect">
    <img src="https://codecov.io/gh/IceHugh/btc-connect/branch/main/graph/badge.svg" alt="Coverage">
  </a>
  <a href="https://bundlephobia.com/result?p=@btc-connect/core">
    <img src="https://img.shields.io/bundlephobia/minzip/@btc-connect/core.svg" alt="Bundle Size">
  </a>
</p>

## Overview

`@btc-connect/core` is a framework-agnostic Bitcoin wallet connection library that provides a unified interface for interacting with various Bitcoin wallets. It implements the adapter pattern to abstract away wallet-specific implementations, making it easy to switch between different wallet providers.

## Features

- 🔌 **Multi-Wallet Support**: UniSat, OKX, Xverse (and more to come)
- 🎯 **Framework Agnostic**: Works with any JavaScript framework
- 🔄 **Event-Driven**: Built-in event system for real-time state updates
- 🛡️ **Type Safe**: Full TypeScript support with strict typing
- 📦 **Lightweight**: Minimal bundle size with tree-shaking support
- 🧪 **Well Tested**: Comprehensive test suite with 100% coverage

## Installation

```bash
npm install @btc-connect/core
```

## Quick Start

```typescript
import { BTCWalletManager, createWalletManager } from '@btc-connect/core';

// Create a wallet manager
const manager = new BTCWalletManager({
  onStateChange: (state) => console.log('State changed:', state),
  onError: (error) => console.error('Wallet error:', error)
});

// Initialize wallet adapters
manager.initializeAdapters();

// Get available wallets
const availableWallets = manager.getAvailableWallets();
console.log('Available wallets:', availableWallets);

// Connect to a wallet
try {
  const accounts = await manager.connect('unisat');
  console.log('Connected accounts:', accounts);
} catch (error) {
  console.error('Connection failed:', error);
}
```

## Core Concepts

### Wallet Manager

The `BTCWalletManager` is the central component that manages wallet connections and state.

```typescript
interface WalletManager {
  // Configuration
  readonly config: WalletManagerConfig;

  // Adapter management
  register(adapter: BTCWalletAdapter): void;
  unregister(walletId: string): void;
  getAdapter(walletId: string): BTCWalletAdapter | null;
  getAllAdapters(): BTCWalletAdapter[];
  getAvailableWallets(): WalletInfo[];

  // Connection management
  connect(walletId: string): Promise<AccountInfo[]>;
  disconnect(): Promise<void>;
  switchWallet(walletId: string): Promise<AccountInfo[]>;
  assumeConnected(walletId: string): Promise<AccountInfo[] | null>;

  // State management
  getState(): WalletState;
  getCurrentAdapter(): BTCWalletAdapter | null;
  getCurrentWallet(): WalletInfo | null;

  // Event handling
  on(event: WalletEvent, handler: EventHandler): void;
  off(event: WalletEvent, handler: EventHandler): void;
}
```

### Wallet Adapter

Wallet adapters implement the `BTCWalletAdapter` interface to provide wallet-specific functionality.

```typescript
interface BTCWalletAdapter {
  // Basic information
  readonly id: string;
  readonly name: string;
  readonly icon: string;

  // Status checking
  isReady(): boolean;
  getState(): WalletState;

  // Connection management
  connect(): Promise<AccountInfo[]>;
  disconnect(): Promise<void>;

  // Account management
  getAccounts(): Promise<AccountInfo[]>;
  getCurrentAccount(): Promise<AccountInfo | null>;

  // Network management
  getNetwork(): Promise<Network>;
  switchNetwork(network: Network): Promise<void>;

  // Events
  on(event: WalletEvent, handler: EventHandler): void;
  off(event: WalletEvent, handler: EventHandler): void;

  // Bitcoin operations
  signMessage(message: string): Promise<string>;
  signPsbt(psbt: string): Promise<string>;
  sendBitcoin(toAddress: string, amount: number): Promise<string>;
}
```

### State Management

The wallet state represents the current connection status and account information.

```typescript
interface WalletState {
  status: ConnectionStatus; // 'disconnected' | 'connecting' | 'connected' | 'error'
  accounts: AccountInfo[];
  currentAccount?: AccountInfo;
  network?: Network; // 'livenet' | 'testnet' | 'regtest' | 'mainnet'
  error?: Error;
}

interface AccountInfo {
  address: string;
  publicKey?: string;
  balance?: number;
  network?: Network;
}
```

## API Reference

### Creating a Wallet Manager

```typescript
import { BTCWalletManager, createWalletManager } from '@btc-connect/core';

// Method 1: Direct instantiation
const manager = new BTCWalletManager({
  onStateChange: (state) => {
    console.log('State changed:', state.status);
  },
  onError: (error) => {
    console.error('Wallet error:', error);
  }
});

// Method 2: Factory function
const manager = createWalletManager({
  onStateChange: handleStateChange,
  onError: handleError
});
```

### Adapter Management

```typescript
// Register a custom adapter
import { BaseWalletAdapter } from '@btc-connect/core';

class MyCustomAdapter extends BaseWalletAdapter {
  id = 'my-wallet';
  name = 'My Custom Wallet';
  icon = 'https://example.com/icon.png';

  async connect(): Promise<AccountInfo[]> {
    // Implement connection logic
    return [{
      address: 'tb1qexample...',
      publicKey: '02abcdef...',
      balance: 100000,
      network: 'testnet'
    }];
  }

  // Implement other required methods...
}

// Register the adapter
manager.register(new MyCustomAdapter());

// Get all registered adapters
const allAdapters = manager.getAllAdapters();

// Get a specific adapter
const adapter = manager.getAdapter('my-wallet');
```

### Connection Management

```typescript
// Get available wallets (installed and ready)
const availableWallets = manager.getAvailableWallets();
console.log('Available wallets:', availableWallets);
// Output: [{ id: 'unisat', name: 'UniSat', icon: '...' }, ...]

// Connect to a wallet
try {
  const accounts = await manager.connect('unisat');
  console.log('Connected with accounts:', accounts);

  // Get current state
  const state = manager.getState();
  console.log('Current state:', state);
} catch (error) {
  if (error instanceof WalletNotInstalledError) {
    console.log('Wallet is not installed');
  } else if (error instanceof WalletConnectionError) {
    console.log('Connection failed:', error.message);
  }
}

// Switch to a different wallet
const newAccounts = await manager.switchWallet('okx');

// Disconnect
await manager.disconnect();
```

### Event Handling

```typescript
// Listen to connection events
manager.on('connect', (accounts) => {
  console.log('Wallet connected:', accounts);
});

manager.on('disconnect', () => {
  console.log('Wallet disconnected');
});

manager.on('accountChange', (accounts) => {
  console.log('Account changed:', accounts);
});

manager.on('networkChange', (network) => {
  console.log('Network changed:', network);
});

manager.on('error', (error) => {
  console.error('Wallet error:', error);
});

// Remove event listeners
const handler = (accounts) => console.log('Connected:', accounts);
manager.on('connect', handler);
manager.off('connect', handler);
```

### Bitcoin Operations

```typescript
// Get current adapter
const adapter = manager.getCurrentAdapter();
if (!adapter) {
  console.log('No wallet connected');
  return;
}

// Sign a message
const message = 'Hello, Bitcoin!';
const signature = await adapter.signMessage(message);
console.log('Message signature:', signature);

// Sign a PSBT
const psbtHex = '70736274ff...';
const signedPsbt = await adapter.signPsbt(psbtHex);
console.log('Signed PSBT:', signedPsbt);

// Send Bitcoin
const txid = await adapter.sendBitcoin('tb1qrecipient...', 1000); // 1000 satoshis
console.log('Transaction ID:', txid);
```

### Auto Connection

```typescript
// Try to restore previous connection
const previousWalletId = localStorage.getItem('last-connected-wallet');
if (previousWalletId) {
  try {
    const accounts = await manager.assumeConnected(previousWalletId);
    if (accounts && accounts.length > 0) {
      console.log('Auto-connected with accounts:', accounts);
    }
  } catch (error) {
    console.log('Auto-connection failed:', error);
  }
}
```

## Supported Wallets

### UniSat

```typescript
// Connect to UniSat
const accounts = await manager.connect('unisat');

// UniSat-specific features
const unisatAdapter = manager.getAdapter('unisat');
if (unisatAdapter) {
  // UniSat is available
}
```

### OKX Wallet

```typescript
// Connect to OKX
const accounts = await manager.connect('okx');

// OKX-specific features
const okxAdapter = manager.getAdapter('okx');
if (okxAdapter) {
  // OKX is available
}
```

## Error Handling

The library provides specific error types for different scenarios:

```typescript
import {
  WalletError,
  WalletNotInstalledError,
  WalletConnectionError,
  WalletDisconnectedError,
  NetworkError,
  TransactionError
} from '@btc-connect/core';

try {
  await manager.connect('unisat');
} catch (error) {
  if (error instanceof WalletNotInstalledError) {
    console.log('Please install UniSat wallet');
  } else if (error instanceof WalletConnectionError) {
    console.log('Failed to connect to wallet:', error.message);
  } else if (error instanceof NetworkError) {
    console.log('Network error:', error.message);
  }
}
```

## Advanced Usage

### Custom Adapter Implementation

```typescript
import { BaseWalletAdapter, WalletState, AccountInfo } from '@btc-connect/core';

class CustomWalletAdapter extends BaseWalletAdapter {
  id = 'custom-wallet';
  name = 'Custom Wallet';
  icon = 'https://example.com/icon.png';

  isReady(): boolean {
    // Check if wallet is available
    return typeof window !== 'undefined' && !!(window as any).customWallet;
  }

  getState(): WalletState {
    // Return current wallet state
    return {
      status: 'disconnected',
      accounts: [],
      network: 'livenet'
    };
  }

  async connect(): Promise<AccountInfo[]> {
    if (!this.isReady()) {
      throw new WalletNotInstalledError(this.id);
    }

    try {
      // Connect to wallet
      const wallet = (window as any).customWallet;
      await wallet.connect();

      const accounts = await wallet.getAccounts();
      return accounts.map(account => ({
        address: account.address,
        publicKey: account.publicKey,
        balance: account.balance,
        network: account.network
      }));
    } catch (error) {
      throw new WalletConnectionError(`Failed to connect to ${this.name}`);
    }
  }

  async disconnect(): Promise<void> {
    const wallet = (window as any).customWallet;
    if (wallet) {
      await wallet.disconnect();
    }
  }

  // Implement other required methods...
}

// Register custom adapter
manager.register(new CustomWalletAdapter());
```

### State Persistence

```typescript
// Save wallet state to localStorage
manager.on('connect', (accounts) => {
  localStorage.setItem('btc-connect-accounts', JSON.stringify(accounts));
  localStorage.setItem('btc-connect-wallet', manager.getCurrentWallet()?.id || '');
});

// Restore state on page load
const savedWalletId = localStorage.getItem('btc-connect-wallet');
if (savedWalletId) {
  manager.assumeConnected(savedWalletId);
}
```

## Best Practices

1. **Error Handling**: Always wrap wallet operations in try-catch blocks
2. **Event Listeners**: Clean up event listeners when no longer needed
3. **State Management**: Use events to react to state changes rather than polling
4. **Network Detection**: Check network compatibility before operations
5. **User Experience**: Provide clear feedback for connection states

## Migration Guide

### From Version 0.1.x to 0.2.x

```typescript
// Old way (deprecated)
const manager = new WalletManager();

// New way
const manager = new BTCWalletManager({
  onStateChange: handleStateChange,
  onError: handleError
});
```

## Contributing

Please read our [Contributing Guide](../../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## Support

- 📧 Email: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [Issues](https://github.com/IceHugh/btc-connect/issues)