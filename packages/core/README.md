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
import { BTCWalletManager } from '@btc-connect/core';

// Create wallet manager
const manager = new BTCWalletManager({
  onStateChange: (state) => console.log('State changed:', state),
  onError: (error) => console.error('Wallet error:', error)
});

// Initialize and connect
manager.initializeAdapters();
const accounts = await manager.connect('unisat');
```

## Core Concepts

### BTCWalletManager
Central wallet management with connection control and state handling.

**Key Methods:**
- `connect(walletId: string)` - Connect to specific wallet
- `disconnect()` - Disconnect current wallet
- `switchWallet(walletId: string)` - Switch between wallets
- `getAvailableWallets()` - Get installed wallet list
- `getState()` - Get current wallet state
- `on(event, handler)` - Listen to wallet events

### BTCWalletAdapter
Wallet-specific implementations providing unified interface.

**Key Methods:**
- `connect()` - Establish wallet connection
- `disconnect()` - Close wallet connection
- `signMessage(message)` - Sign arbitrary message
- `signPsbt(psbt)` - Sign Partially Signed Bitcoin Transaction
- `sendBitcoin(address, amount)` - Send Bitcoin transaction

### State Management
Real-time wallet state with event-driven updates.

**Key Properties:**
- `status: ConnectionStatus` - Connection state
- `accounts: AccountInfo[]` - Connected accounts
- `network: Network` - Current network
- `error?: Error` - Error information

## API Reference

### BTCWalletManager

**Constructor Parameters:**
- `onStateChange?: (state: WalletState) => void` - State change callback
- `onError?: (error: Error) => void` - Error callback

**Key Methods:**
- `initializeAdapters()` - Initialize built-in wallet adapters
- `connect(walletId: string): Promise<AccountInfo[]>` - Connect to wallet
- `disconnect(): Promise<void>` - Disconnect current wallet
- `switchWallet(walletId: string): Promise<AccountInfo[]>` - Switch wallet
- `assumeConnected(walletId: string): Promise<AccountInfo[] | null>` - Restore connection
- `getAvailableWallets(): WalletInfo[]` - Get available wallets
- `getState(): WalletState` - Get current state
- `on(event: WalletEvent, handler: EventHandler): void` - Add event listener
- `off(event: WalletEvent, handler: EventHandler): void` - Remove event listener

### BTCWalletAdapter

**Properties:**
- `id: string` - Unique wallet identifier
- `name: string` - Display name
- `icon: string` - Icon URL

**Methods:**
- `isReady(): boolean` - Check if wallet is available
- `connect(): Promise<AccountInfo[]>` - Connect to wallet
- `disconnect(): Promise<void>` - Disconnect from wallet
- `signMessage(message: string): Promise<string>` - Sign message
- `signPsbt(psbt: string): Promise<string>` - Sign PSBT
- `sendBitcoin(toAddress: string, amount: number): Promise<string>` - Send BTC

### Wallet Detection

**Enhanced Detection:**
```typescript
import { detectAvailableWallets } from '@btc-connect/core';

const result = await detectAvailableWallets({
  timeout: 20000,
  interval: 300
});
```

**Parameters:**
- `timeout?: number` - Detection timeout (ms)
- `interval?: number` - Poll interval (ms)
- `onProgress?: (wallets: string[], time: number) => void` - Progress callback

**Returns:**
- `wallets: string[]` - Detected wallet IDs
- `adapters: BTCWalletAdapter[]` - Available adapters
- `elapsedTime: number` - Detection duration
- `isComplete: boolean` - Detection completion status

## Supported Wallets

### UniSat
- **ID**: `unisat`
- **Network**: Mainnet, Testnet
- **Status**: ✅ Active

### OKX Wallet
- **ID**: `okx`
- **Network**: Mainnet, Testnet
- **Status**: ✅ Active

### Xverse
- **ID**: `xverse`
- **Network**: Mainnet, Testnet
- **Status**: 🚧 In Development

## Error Handling

**Error Types:**
- `WalletNotInstalledError` - Wallet not installed
- `WalletConnectionError` - Connection failed
- `WalletDisconnectedError` - Wallet disconnected
- `NetworkError` - Network-related error
- `TransactionError` - Transaction failed

**Usage:**
```typescript
try {
  await manager.connect('unisat');
} catch (error) {
  if (error instanceof WalletNotInstalledError) {
    // Handle not installed
  }
  // Handle other errors
}
```

## Best Practices

1. Always wrap wallet operations in try-catch blocks
2. Clean up event listeners when no longer needed
3. Use events to react to state changes
4. Check network compatibility before operations
5. Provide clear feedback for connection states

## Type Definitions

**Core Types:**
- `Network`: `'livenet' | 'testnet' | 'regtest' | 'mainnet'`
- `ConnectionStatus`: `'disconnected' | 'connecting' | 'connected' | 'error'`
- `AccountInfo`: `{ address: string; publicKey?: string; balance?: number; network?: Network }`
- `WalletInfo`: `{ id: string; name: string; icon: string }`
- `WalletState`: `{ status: ConnectionStatus; accounts: AccountInfo[]; currentAccount?: AccountInfo; network?: Network; error?: Error }`

## Contributing

Please read our [Contributing Guide](../../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## Support

- 📧 Email: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [Issues](https://github.com/IceHugh/btc-connect/issues)