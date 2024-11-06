Based on the detailed documentation provided, let's enhance the readability by organizing the information about methods within `BtcWalletConnect`, `useReactWalletStore`, and `WalletConnectReact`, including parameters, return types, and their general meanings.

### BtcWalletConnect Documentation

Let's refine the documentation by including explanations for TypeScript types like `BtcConnectorId` and `BtcWalletNetwork`, and also expand on the `BtcWalletConnect` methods that were previously omitted, such as `signPsbt` and others.

### Key TypeScript Types

- **`BtcConnectorId`**: Represents the identifier for a specific wallet connector. Common connector IDs include `"unisat"` and `"okx"`, which are used to specify the underlying service or platform for wallet operations.

- **`BtcWalletNetwork`**: Specifies the blockchain network type the wallet operates on. Possible values include `"livenet"` for the main network where real transactions occur, and `"testnet"` for a sandbox environment used for testing purposes.

### BtcWalletConnect Detailed Documentation

#### Interface: `BtcWalletConnectOptions`
- **`network?`**: (Optional) Type: `BtcWalletNetwork`. Specifies the blockchain network to connect to.
- **`defaultConnectorId?`**: (Optional) Type: `BtcConnectorId`. Specifies the default connector to use for wallet operations.

#### Class: `BtcWalletConnect`
- **Constructor**: Initializes a new instance of the BtcWalletConnect class.
  - **Parameters**: `options: BtcWalletConnectOptions`
  - **Returns**: An instance of `BtcWalletConnect`.

Initialization:
```typescript
const walletOptions: BtcWalletConnectOptions = {
  network: "livenet",
  defaultConnectorId: "unisat"
};
const wallet = new BtcWalletConnect(walletOptions);
```

- **Methods**:
  - **`connect(): Promise<boolean>`**: Attempts to establish a connection with the wallet.
    - **Returns**: A promise that resolves to a boolean indicating whether the connection was successful.
  
  - **`disconnect(): Promise<void>`**: Disconnects the currently connected wallet.
    - **Returns**: A promise that resolves once the wallet has been disconnected.
  
  - **`getAccounts(): Promise<string[]>`**: Retrieves the addresses of the connected wallet accounts.
    - **Returns**: A promise that resolves to an array of account addresses.
  
  - **`getNetwork(): Promise<BtcWalletNetwork>`**: Fetches the current blockchain network of the wallet.
    - **Returns**: A promise that resolves to the current `BtcWalletNetwork`.
  
  - **`switchNetwork(network: BtcWalletNetwork): Promise<void>`**: Switches the wallet's blockchain network.
    - **Returns**: A promise that resolves once the network has been switched.
  
  - **`sendToAddress(toAddress: string, amount: number): Promise<string>`**: Sends a specified amount of cryptocurrency to a given address.
    - **Parameters**:
      - `toAddress`: The recipient's address.
      - `amount`: The amount of cryptocurrency to send.
    - **Returns**: A promise that resolves to the transaction ID of the completed transaction.
  
  - **`signMessage(message: string, type?: MessageType): Promise<string>`**: Signs a given message with the private key of the connected wallet.
    - **Parameters**:
      - `message`: The message to be signed.
      - `type?`: (Optional) The type of message being signed.
    - **Returns**: A promise that resolves to the signature.
  
  - **`signPsbt(psbtHex: string, options?: any): Promise<string>`**: Signs a Partially Signed Bitcoin Transaction (PSBT).
    - **Parameters**:
      - `psbtHex`: The PSBT in hexadecimal format.
      - `options?`: (Optional) Additional options for signing.
    - **Returns**: A promise that resolves to the signed PSBT in hexadecimal format.
  
  - **`signPsbts(psbtHexs: string[], options?: any): Promise<string[]>`**: Signs multiple PSBTs.
    - **Parameters**:
      - `psbtHexs`: An array of PSBTs in hexadecimal format.
      - `options?`: (Optional) Additional options for the signing process.
    - **Returns**: A promise that resolves to an array of signed PSBTs in hexadecimal format.
  
  - **`pushTx(rawTx: string): Promise<string>`**: Broadcasts a raw transaction to the blockchain.
    - **Parameters**:
      - `rawTx`: The raw transaction data in hexadecimal format.
    - **Returns**: A promise that resolves to the transaction ID of the broadcasted transaction.
  
  - **`pushPsbt(psbtHex: string): Promise<string>`**: Broadcasts a PSBT to the blockchain.
    - **Parameters**:
      - `psbtHex`: The PSBT in hexadecimal format.
    - **Returns**: A promise that resolves to the transaction ID of the broadcasted PSBT.
Connection Methods:
```typescript
// Connecting to the wallet
wallet.connect().then((success) => {
  console.log('Connection success:', success);
});

// Disconnecting the wallet
wallet.disconnect().then(() => {
  console.log('Disconnected');
});
```

Transaction and Signing Methods:
```typescript
// Sending cryptocurrency
wallet.sendToAddress("1BitcoinAddress...", 1000).then((txId) => {
  console.log('Transaction ID:', txId);
});

// Signing a message
wallet.signMessage("Hello, blockchain!").then((signature) => {
  console.log('Signature:', signature);
});

// Signing a PSBT
wallet.signPsbt("psbtHex...", {}).then((signedPsbt) => {
  console.log('Signed PSBT:', signedPsbt);
});
```

### useReactWalletStore (React-specific)

- **Purpose**: Manages the wallet's state in React applications.
It seems there was an issue generating the document through my code execution environment. However, I can still provide you with the Markdown content directly here. You can copy this Markdown content into your own `.md` file manually:

#### Wallet State Interface Documentation

This document describes the structure of the wallet state used within a cryptocurrency application. It outlines the types and fields that comprise the state of a `BtcWalletConnect` instance and related information.

##### Fields Description

- `btcWallet?`: Optional. An instance of `BtcWalletConnect`. Represents the wallet connection.
- `balance`: A `Balance` object containing details about the wallet's balance, including confirmed and unconfirmed amounts.
- `publicKey`: The public key of the wallet as a `string`.
- `address`: The blockchain address of the wallet as a `string`.
- `connected`: A `boolean` indicating whether the wallet is currently connected.
- `initStatus`: A `boolean` indicating whether the wallet has been initialized.
- `network`: The `BtcWalletNetwork` the wallet is connected to, e.g., `"livenet"` or `"testnet"`.
- `connectorId?`: Optional. The `BtcConnectorId` of the currently selected connector.
- `localConnectorId?`: Optional. The `BtcConnectorId` of the locally stored connector preference.
- `connector?`: Optional. The current `Connector` instance used for blockchain interactions.
- `connectors?`: Optional. An array of objects representing available connectors. Each object contains:
  - `id`: The `BtcConnectorId` of the connector.
  - `name`: The name of the connector as a `string`.
  - `logo`: A `base64 string` URL to the connector's logo.
  - `connector`: The connector instance, type `any`.
  - `installed`: A `boolean` indicating whether the connector is installed.

##### Types Overview

- `BtcWalletConnect`: Represents the main class for wallet connectivity.
- `Balance`: An object containing numeric fields for `confirmed`, `unconfirmed`, and `total` balances.
- `BtcWalletNetwork`: Enumerates the blockchain networks supported, such as `"livenet"` and `"testnet"`.
- `BtcConnectorId`: Identifies connectors by ID, such as `"unisat"` or `"okx"`.
- `Connector`: The interface for blockchain connector implementations.
```


- **Methods**:
  - **init(config: BtcWalletConnectOptions): void**: Initializes the wallet with configuration options.
  - **check(): void**: Checks the current status of the wallet connection.
  - **connect(): void**: Connects to the wallet.
  - **disconnect(): void**: Disconnects the wallet.
  - **switchConnector(id: BtcConnectorId): void**: Switches the wallet connector.
  - **switchNetwork(network: BtcWalletNetwork): void**: Switches the blockchain network.
```jsx
import React from 'react';
import { useReactWalletStore } from 'btc-connect/dist/react'';

function WalletComponent() {
  const { connect, disconnect, balance, init } = useReactWalletStore();

  useEffect(() => {
    init({ network: 'livenet', defaultConnectorId: 'unisat' });
  }, []);

  return (
    <div>
      <button onClick={connect}>Connect Wallet</button>
      <button onClick={disconnect}>Disconnect Wallet</button>
      <div>Balance: {balance}</div>
    </div>
  );
}
```

### WalletConnectReact (React-specific)

- **Component Props**:
  - `config`: Configuration for the wallet connection. Includes `network` and `defaultConnectorId`.
  - `theme`: Optional. Theme settings for the component.
  - `onConnectSuccess`, `onConnectError`, `onDisconnectSuccess`, `onDisconnectError`: Callback functions for handling connection events.
  - `children`: React elements to be rendered within the component.
```jsx
import React from 'react';
import { WalletConnectReact } from 'btc-connect/dist/react';

const App = () => (
  <WalletConnectReact
    config={{ network: "livenet", defaultConnectorId: "unisat" }}
    onConnectSuccess={() => console.log("Connected")}
    onConnectError={(error) => console.log("Connection Error:", error)}
    onDisconnectSuccess={() => console.log("Disconnected")}
    onDisconnectError={(error) => console.log("Disconnection Error:", error)}
  >
    <div>Your DApp content here.</div>
  </WalletConnectReact>
);
```
This structured documentation aims to provide a clear overview of the key functionalities within `BtcWalletConnect`, including the methods for managing wallet connections, transactions, and network settings. Additionally, it outlines how to use `useReactWalletStore` for state management in React applications and `WalletConnectReact` for incorporating wallet connectivity into React components, complete with callback props for handling various connection events.