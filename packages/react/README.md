# @btc-connect/react

[中文文档](./README.zh-CN.md) | English

<p align="center">
  <strong>React adapter for BTC Connect with Hooks and Context</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@btc-connect/react">
    <img src="https://img.shields.io/npm/v/@btc-connect/react.svg" alt="NPM Version">
  </a>
  <a href="https://github.com/IceHugh/btc-connect/actions">
    <img src="https://github.com/IceHugh/btc-connect/workflows/CI/badge.svg" alt="CI">
  </a>
  <a href="https://codecov.io/gh/IceHugh/btc-connect">
    <img src="https://codecov.io/gh/IceHugh/btc-connect/branch/main/graph/badge.svg" alt="Coverage">
  </a>
  <a href="https://bundlephobia.com/result?p=@btc-connect/react">
    <img src="https://img.shields.io/bundlephobia/minzip/@btc-connect/react.svg" alt="Bundle Size">
  </a>
</p>

## Overview

`@btc-connect/react` provides React-specific bindings for BTC Connect, offering a declarative way to integrate Bitcoin wallet functionality into React applications. It includes custom hooks, context providers, and pre-built components for seamless wallet integration.

## Features

- 🎣 **React Hooks**: Declarative wallet state management with custom hooks
- 📦 **Context Provider**: Centralized wallet state management
- 🎨 **Pre-built Components**: Ready-to-use wallet connection UI components
- ⚛️ **React 18+ Support**: Built for modern React with concurrent features
- 🔄 **Auto Reconnection**: Automatic wallet reconnection on app reload
- 🛡️ **Type Safe**: Full TypeScript support with proper type definitions
- 📱 **SSR Compatible**: Server-side rendering support with Next.js
- 🎯 **Framework Optimized**: Designed specifically for React patterns

## Installation

```bash
npm install @btc-connect/react
```

**Peer Dependencies**: Ensure you have React 18+ installed:

```bash
npm install react react-dom
```

## Quick Start

```tsx
import React from 'react';
import { BTCWalletProvider, ConnectButton, WalletModal } from '@btc-connect/react';

function App() {
  return (
    <BTCWalletProvider autoConnect={true}>
      <div>
        <h1>My Bitcoin App</h1>
        <ConnectButton />
        <WalletModal />
      </div>
    </BTCWalletProvider>
  );
}

export default App;
```

## Core Components

### BTCWalletProvider

The root provider that manages wallet state and provides it to the entire application tree.

```tsx
interface WalletProviderProps {
  children: ReactNode;
  config?: WalletManagerConfig;
  autoConnect?: boolean;
  connectTimeout?: number;
  connectionPolicy?: ConnectionPolicy;
  theme?: 'light' | 'dark';
}

function App() {
  return (
    <BTCWalletProvider
      autoConnect={true}
      connectTimeout={5000}
      theme="light"
      config={{
        onStateChange: (state) => console.log('State:', state),
        onError: (error) => console.error('Error:', error)
      }}
    >
      <YourApp />
    </BTCWalletProvider>
  );
}

#### Theme Management

The `BTCWalletProvider` centrally manages the theme for all components. Theme settings are automatically passed down to all child components:

```tsx
// Set dark theme
<BTCWalletProvider theme="dark">
  <ConnectButton />  {/* Automatically uses dark theme */}
  <WalletModal />    {/* Automatically uses dark theme */}
</BTCWalletProvider>

// Set light theme (default)
<BTCWalletProvider theme="light">
  <ConnectButton />  {/* Automatically uses light theme */}
  <WalletModal />    {/* Automatically uses light theme */}
</BTCWalletProvider>
```

**Supported Themes:**
- `"light"`: Light theme (default)
- `"dark"`: Dark theme

**Dynamic Theme Switching:**
```tsx
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <BTCWalletProvider theme={theme}>
      <div>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          Toggle Theme
        </button>
        <ConnectButton />
        <WalletModal />
      </div>
    </BTCWalletProvider>
  );
}
```
```

### ConnectButton

A pre-built button component for wallet connection with customizable styling.

```tsx
interface ConnectButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'select' | 'button' | 'compact';
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function Header() {
  return (
    <header>
      <ConnectButton
        size="md"
        variant="select"
        label="Connect Wallet"
      />
    </header>
  );
}
```

### WalletModal

A modal component for wallet selection and connection management.

```tsx
interface WalletModalProps {
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

function WalletLayout() {
  const { isModalOpen, openModal, closeModal } = useWalletModal();

  return (
    <div>
      <ConnectButton onClick={openModal} />
      <WalletModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
```

## Hooks API

### useWallet

Get the current wallet state and account information.

```tsx
function AccountInfo() {
  const {
    status,
    accounts,
    currentAccount,
    network,
    error,
    isConnected,
    isConnecting,
    address,
    balance,
    publicKey,
    currentWallet
  } = useWallet();

  if (isConnecting) return <div>Connecting...</div>;
  if (!isConnected) return <div>Not connected</div>;

  return (
    <div>
      <h3>Account Information</h3>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Network:</strong> {network}</p>
      <p><strong>Balance:</strong> {balance} sats</p>
      <p><strong>Wallet:</strong> {currentWallet?.name}</p>
    </div>
  );
}
```

### useConnectWallet

Handle wallet connection operations.

```tsx
function WalletControls() {
  const {
    connect,
    disconnect,
    switchWallet,
    availableWallets
  } = useConnectWallet();

  const handleConnect = async (walletId: string) => {
    try {
      await connect(walletId);
      console.log('Connected successfully!');
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <div>
      <h3>Available Wallets</h3>
      {availableWallets.map(wallet => (
        <button
          key={wallet.id}
          onClick={() => handleConnect(wallet.id)}
        >
          {wallet.name}
        </button>
      ))}
      <button onClick={() => disconnect()}>
        Disconnect
      </button>
    </div>
  );
}
```

### useWalletEvent

Listen to wallet events with automatic cleanup.

```tsx
function EventListener() {
  useWalletEvent('connect', (accounts) => {
    console.log('Wallet connected:', accounts);
    // Show success notification
  });

  useWalletEvent('disconnect', () => {
    console.log('Wallet disconnected');
    // Clear user data
  });

  useWalletEvent('accountChange', (accounts) => {
    console.log('Account changed:', accounts);
    // Update UI
  });

  useWalletEvent('networkChange', (network) => {
    console.log('Network changed:', network);
    // Show network warning if needed
  });

  return <div>Event listener active</div>;
}
```

### useNetwork

Manage network information and switching.

```tsx
function NetworkInfo() {
  const { network, switchNetwork } = useNetwork();

  const handleNetworkSwitch = async (targetNetwork: Network) => {
    try {
      await switchNetwork(targetNetwork);
      console.log(`Switched to ${targetNetwork}`);
    } catch (error) {
      console.error('Network switch failed:', error);
    }
  };

  return (
    <div>
      <p><strong>Current Network:</strong> {network}</p>
      <button onClick={() => handleNetworkSwitch('mainnet')}>
        Switch to Mainnet
      </button>
      <button onClick={() => handleNetworkSwitch('testnet')}>
        Switch to Testnet
      </button>
    </div>
  );
}
```

### useAccount

Get detailed account and balance information.

```tsx
function AccountDetails() {
  const {
    accounts,
    currentAccount,
    hasAccounts,
    refreshAccountInfo
  } = useAccount();

  useEffect(() => {
    // Refresh account info every 30 seconds
    const interval = setInterval(refreshAccountInfo, 30000);
    return () => clearInterval(interval);
  }, [refreshAccountInfo]);

  if (!hasAccounts) {
    return <div>No accounts available</div>;
  }

  return (
    <div>
      <h3>Account Details</h3>
      <p><strong>Total Accounts:</strong> {accounts.length}</p>
      {currentAccount && (
        <div>
          <p><strong>Current Address:</strong> {currentAccount.address}</p>
          <p><strong>Balance:</strong> {currentAccount.balance} sats</p>
          <button onClick={refreshAccountInfo}>
            Refresh Balance
          </button>
        </div>
      )}
    </div>
  );
}
```

### useBalance

Focused balance management with formatting.

```tsx
function BalanceDisplay() {
  const {
    balance,
    confirmedBalance,
    unconfirmedBalance,
    totalBalance,
    isLoading,
    error,
    refreshBalance
  } = useBalance();

  if (isLoading) return <div>Loading balance...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h3>Balance Information</h3>
      <p><strong>Total:</strong> {totalBalance} sats</p>
      <p><strong>Confirmed:</strong> {confirmedBalance} sats</p>
      <p><strong>Unconfirmed:</strong> {unconfirmedBalance} sats</p>
      <button onClick={refreshBalance}>
        Refresh
      </button>
    </div>
  );
}
```

### useWalletModal

Control the wallet selection modal.

```tsx
function ModalControls() {
  const { isOpen, open, close, toggle } = useWalletModal();

  return (
    <div>
      <button onClick={open}>Open Wallet Modal</button>
      <button onClick={close}>Close Wallet Modal</button>
      <button onClick={toggle}>Toggle Modal</button>
      <p>Modal is {isOpen ? 'open' : 'closed'}</p>
    </div>
  );
}
```

## Advanced Usage

### Custom Connection Policy

Define custom tasks to run after wallet connection.

```tsx
const connectionPolicy: ConnectionPolicy = {
  tasks: [
    {
      run: async ({ manager, accounts }) => {
        // Custom post-connection logic
        console.log('Connected with accounts:', accounts);

        // Load user data
        await loadUserData(accounts[0].address);

        return { success: true };
      },
      required: false,
      autoBehavior: 'run'
    },
    {
      run: async ({ manager }) => {
        // Network validation
        const network = await manager.getCurrentAdapter()?.getNetwork();
        if (network === 'mainnet') {
          // Show mainnet warning
          showMainnetWarning();
        }
        return { success: true };
      },
      required: true,
      autoBehavior: 'run'
    }
  ],
  emitEventsOnAutoConnect: true
};

function App() {
  return (
    <BTCWalletProvider connectionPolicy={connectionPolicy}>
      {/* Your app */}
    </BTCWalletProvider>
  );
}
```

### Custom Theme Integration

Integrate with your existing theme system by dynamically setting the theme in the Provider.

```tsx
import { useTheme } from './theme-context';

function App() {
  const { theme } = useTheme();

  return (
    <BTCWalletProvider theme={theme.mode}>
      <ConnectButton
        size="lg"
        variant="select"
        className={theme.colors.primary}
      />
      <WalletModal />
    </BTCWalletProvider>
  );
}
```

### Error Boundaries

Implement proper error handling for wallet operations.

```tsx
import { WalletError, WalletConnectionError } from '@btc-connect/core';

class WalletErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Wallet Error:', error, errorInfo);

    // Report to error tracking service
    trackError(error, {
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong with the wallet connection.</h2>
          <details>
            {this.state.error && this.state.error.message}
          </details>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <WalletErrorBoundary>
      <BTCWalletProvider>
        <YourApp />
      </BTCWalletProvider>
    </WalletErrorBoundary>
  );
}
```

## Server-Side Rendering (SSR)

The React adapter is fully compatible with SSR frameworks like Next.js.

### Next.js App Router

```tsx
// app/layout.tsx
import { BTCWalletProvider } from '@btc-connect/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <BTCWalletProvider>
          {children}
        </BTCWalletProvider>
      </body>
    </html>
  );
}
```

### Client-Side Only Components

```tsx
// components/WalletConnectButton.tsx
'use client';

import { ConnectButton } from '@btc-connect/react';

export default function WalletConnectButton() {
  return <ConnectButton />;
}
```

## Testing

The library provides utilities for testing your wallet integration.

```tsx
// __tests__/wallet-component.test.tsx
import { render, screen } from '@testing-library/react';
import { BTCWalletProvider } from '@btc-connect/react';
import { createMockManager } from '@btc-connect/core/test-utils';

// Mock the wallet manager
jest.mock('@btc-connect/core', () => ({
  ...jest.requireActual('@btc-connect/core'),
  createWalletManager: jest.fn(() => createMockManager())
}));

function TestComponent() {
  const { isConnected, address } = useWallet();

  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <p>Not connected</p>
      )}
    </div>
  );
}

test('displays connection status', () => {
  render(
    <BTCWalletProvider>
      <TestComponent />
    </BTCWalletProvider>
  );

  expect(screen.getByText('Not connected')).toBeInTheDocument();
});
```

## Performance Optimization

### Memoization

```tsx
import { useMemo } from 'react';

function OptimizedWalletDisplay() {
  const { balance, address } = useWallet();

  const formattedBalance = useMemo(() => {
    if (!balance) return '0 sats';
    return `${(balance / 100000000).toFixed(8)} BTC`;
  }, [balance]);

  const shortAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  return (
    <div>
      <p>{shortAddress}</p>
      <p>{formattedBalance}</p>
    </div>
  );
}
```

### Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const WalletModal = lazy(() => import('@btc-connect/react').then(mod => ({
  default: mod.WalletModal
})));

function App() {
  return (
    <BTCWalletProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <WalletModal />
      </Suspense>
    </BTCWalletProvider>
  );
}
```

## Best Practices

1. **Provider Placement**: Place the provider as high as possible in your component tree
2. **Error Handling**: Always wrap wallet operations in try-catch blocks
3. **Loading States**: Show appropriate loading states during connection
4. **Event Cleanup**: Use the provided hooks which handle cleanup automatically
5. **SSR Considerations**: Use client-side only components for wallet-dependent UI
6. **Performance**: Memoize expensive calculations and use lazy loading for modals

## Contributing

Please read our [Contributing Guide](../../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## Support

- 📧 Email: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [Issues](https://github.com/IceHugh/btc-connect/issues)
