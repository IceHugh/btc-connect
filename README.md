
<div align="center">
  <a href="https://github.com/IceHugh/btc-connect/blob/main/README_ZH.md">中文</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/IceHugh/btc-connect/blob/main/doc.md">Document</a>
  <br />
</div>

<div align="center">
  <img src="https://github.com/IceHugh/btc-connect/blob/main/images/example_black.png" width="300">
  <img src="https://github.com/IceHugh/btc-connect/blob/main/images/example_white.png" width="300">
  <br />
</div>

# BTC Wallet Connect

BTC Wallet Connect is a library that allows you to easily integrate Bitcoin wallets (Unisat and OKX) into your web application. With this library, you can enable your users to manage their Bitcoin addresses, send and receive transactions, and interact with Bitcoin wallets directly from your web app.

## Features

- Connect to popular Bitcoin wallets (Unisat and OKX)
- Manage Bitcoin addresses and check balances
- Send and receive Bitcoin transactions
- Sign messages and PSBTs
- Push transactions and PSBTs to the network
- Switch between different connectors and networks
- Customizable UI theme (light and dark)
- Typescript support
- Support for React components
- Support for pure JavaScript usage (compatible with Vue, vanilla JS, etc.)

## Installation

You can install the package via npm, yarn, pnpm or bun:

### npm
```bash
npm install btc-connect
```

### Yarn
```bash
yarn add btc-connect
```

### pnpm
```bash
pnpm add btc-connect
```

### bun
```bash
bun add btc-connect
```

## Requirements

For React:
- react (>=16.8.0)
- react-dom (>=16.8.0)

The library also uses the `zustand` state management library for React hooks.

## Usage

### React

Import the `WalletConnectReact` component and wrap your application with it:

```jsx
import React from 'react';
import { WalletConnectReact } from 'btc-connect/dist/react';

const App = () => {
  const config = {
    network: 'livenet', // or 'testnet'
    defaultConnectorId: 'unisat', // or 'okx'
  };

  return (
    <WalletConnectReact
      config={config}
      onConnectSuccess={(btcWallet) => {
        // Handle successful connection
      }}
      theme="dark"
      onConnectError={(error) => {
        // Handle connection error
      }}
      onDisconnectSuccess={() => {
        // Handle successful disconnection
      }}
      onDisconnectError={(error) => {
        // Handle disconnection error
      }}
    >
      {/* Your app components */}
    </WalletConnectReact>
  );
};

export default App;
```

You can also use the `useReactWalletStore` hook to access the wallet store and perform various actions:

```jsx
import React from 'react';
import { useReactWalletStore } from 'btc-connect/dist/react';

const MyComponent = () => {
  const walletStore = useReactWalletStore();

  const connect = () => {
    walletStore.connect();
  };

  const disconnect = () => {
    walletStore.disconnect();
  };

  const sendBitcoin = async () => {
    const toAddress = '...';
    const amount = 1000;
    const txid = await walletStore.btcWallet?.sendToAddress(toAddress, amount);
    console.log('Transaction ID:', txid);
  };

  return (
    <div>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
      <button onClick={sendBitcoin}>Send Bitcoin</button>
    </div>
  );
};

export default MyComponent;
```

### Pure JavaScript

You can use the `BtcWalletConnect` class directly in your JavaScript code:

```javascript
import BtcWalletConnect from 'btc-connect';

const config = {
  network: 'livenet', // or 'testnet'
  defaultConnectorId: 'unisat', // or 'okx'
};

const btcWallet = new BtcWalletConnect(config);

// Connect to the wallet
btcWallet.connect()
  .then(() => {
    // Handle successful connection
  })
  .catch((error) => {
    // Handle connection error
  });

// Send Bitcoin
const toAddress = '...';
const amount = 1000;
btcWallet.sendToAddress(toAddress, amount)
  .then((txid) => {
    console.log('Transaction ID:', txid);
  })
  .catch((error) => {
    // Handle error
  });

// Disconnect from the wallet
btcWallet.disconnect()
  .then(() => {
    // Handle successful disconnection
  })
  .catch((error) => {
    // Handle disconnection error
  });
```

This pure JavaScript usage makes it compatible with Vue, vanilla JavaScript, and other frameworks or libraries.

For more detailed information and examples, please refer to the [Doc](https://github.com/IceHugh/btc-connect/doc.md).

## TODO

- Support for Vue components

## Contributing

Contributions are welcome! Please read the [contributing guidelines](https://github.com/IceHugh/btc-connect/blob/main/CONTRIBUTING.md) for more information.



## License

BTC Wallet Connect is licensed under the [MIT License](https://github.com/IceHugh/btc-connect/blob/main/LICENSE).

## Support and Donation

If you find this project helpful and you would like to support its continued development, feel free to make a donation through one of the following methods. Your support is a tremendous encouragement for us!

<!-- ### PayPal

You can donate via PayPal: [Donate via PayPal](Your_PayPal_Link)

### Patreon

Alternatively, you can become our patron on Patreon: [Become a Patron](Your_Patreon_Link)

### WeChat/Alipay QR Codes

You can also donate by scanning the following QR codes in WeChat or Alipay:

![WeChat QR Code](Your_WeChat_QR_Code_Image_Link) ![Alipay QR Code](Your_Alipay_QR_Code_Image_Link) -->

## Cryptocurrency

You can also donate using the following cryptocurrency addresses:

- BTC: bc1pnacumj3jhn28x8lwj5fqfwzxcq0kfhyrtzadd4unlg4cu57mp3wghp0j73
<img src="https://github.com/IceHugh/btc-connect/blob/main/images/btc_qrcode.jpg" width="300" >
Thank you to every supporter for your contributions!
