# Usage Guide

This guide explains how to integrate the `@btc-connect/react` package into your React application to manage Bitcoin wallet connections.

## Installation

First, install the necessary packages:

```bash
npm install @btc-connect/react
# or
yarn add @btc-connect/react
# or
bun add @btc-connect/react
```

## Setup

Wrap your application with the `BTCWalletProvider` to provide wallet context to all components.

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BTCWalletProvider } from '@btc-connect/react';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BTCWalletProvider>
      <App />
    </BTCWalletProvider>
  </React.StrictMode>
);
```

## UI Components

This package provides UI components to trigger wallet connection and display wallet information.

### BTCConnectButton

The `BTCConnectButton` component displays a button that shows the connection status. When clicked, it opens the wallet selection modal.

```tsx
// src/App.tsx
import { BTCConnectButton, WalletModal } from '@btc-connect/react';

function App() {
  return (
    <div>
      <h1>BTC Connect Demo</h1>
      <BTCConnectButton />
      <WalletModal />
    </div>
  );
}

export default App;
```

### WalletModal

The `WalletModal` component is a modal that allows users to select a wallet to connect.

## Hooks

The package provides several hooks to interact with the wallet.

### useWallet

`useWallet` provides the current wallet state, including connection status, accounts, network, and balance.

```tsx
import { useWallet } from '@btc-connect/react';

function WalletInfo() {
  const { isConnected, address, balance, network } = useWallet();

  if (!isConnected) {
    return <p>Not connected</p>;
  }

  return (
    <div>
      <p>Address: {address}</p>
      <p>Balance: {balance?.total} sats</p>
      <p>Network: {network}</p>
    </div>
  );
}
```

### useConnectWallet

`useConnectWallet` provides functions to connect, disconnect, and switch wallets.

```tsx
import { useConnectWallet } from '@btc-connect/react';

function ConnectControls() {
  const { disconnect } = useConnectWallet();

  return <button onClick={() => disconnect()}>Disconnect</button>;
}
```

### useBalance

`useBalance` is a convenient hook to get the balance of the current account.

```tsx
import { useBalance } from '@btc-connect/react';

function Balance() {
  const balance = useBalance();

  return <p>Balance: {balance?.total} sats</p>;
}
```

### useSignature

`useSignature` provides functions to sign messages and PSBTs.

```tsx
import { useSignature } from '@btc-connect/react';

function Signer() {
  const { signMessage, signPsbt } = useSignature();

  const handleSignMessage = async () => {
    const signature = await signMessage('Hello, world!');
    console.log('Signature:', signature);
  };

  const handleSignPsbt = async () => {
    const psbt = '...'; // Your PSBT here
    const signedPsbt = await signPsbt(psbt);
    console.log('Signed PSBT:', signedPsbt);
  };

  return (
    <div>
      <button onClick={handleSignMessage}>Sign Message</button>
      <button onClick={handleSignPsbt}>Sign PSBT</button>
    </div>
  );
}
```

### useTransactions

`useTransactions` provides functions to send Bitcoin.

```tsx
import { useTransactions } from '@btc-connect/react';

function TransactionSender() {
  const { sendBitcoin } = useTransactions();

  const handleSend = async () => {
    const txid = await sendBitcoin('recipient_address', 10000);
    console.log('Transaction ID:', txid);
  };

  return <button onClick={handleSend}>Send 10000 sats</button>;
}
```

## Complete Example

Here is a complete example of how to use the components and hooks together.

```tsx
// src/App.tsx
import {
  BTCConnectButton,
  WalletModal,
  useWallet,
  useSignature,
  useTransactions,
} from '@btc-connect/react';

function App() {
  const { isConnected, address, balance, network } = useWallet();
  const { signMessage } = useSignature();
  const { sendBitcoin } = useTransactions();

  const handleSign = async () => {
    try {
      const sig = await signMessage('Hello from btc-connect');
      alert(`Signature: ${sig}`);
    } catch (error) {
      console.error(error);
      alert(`Error signing message: ${error.message}`);
    }
  };

  const handleSend = async () => {
    try {
      const to = prompt('Enter recipient address:');
      if (!to) return;
      const amount = prompt('Enter amount in sats:');
      if (!amount) return;

      const txid = await sendBitcoin(to, parseInt(amount, 10));
      alert(`Transaction sent: ${txid}`);
    } catch (error) {
      console.error(error);
      alert(`Error sending transaction: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>@btc-connect/react Demo</h1>
      <BTCConnectButton />
      <WalletModal />

      {isConnected && (
        <div style={{ marginTop: '20px' }}>
          <h2>Wallet Info</h2>
          <p>Address: {address}</p>
          <p>Balance: {balance?.total} sats</p>
          <p>Network: {network}</p>

          <h2>Actions</h2>
          <button onClick={handleSign}>Sign Message</button>
          <button onClick={handleSend} style={{ marginLeft: '10px' }}>
            Send Bitcoin
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
```
