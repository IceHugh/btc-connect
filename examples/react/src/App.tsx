import './App.css';
import { BTCConnectButton, WalletModal, useWallet } from '@btc-connect/react';

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
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>BTC Connect React Demo</h1>
      <BTCConnectButton theme="light" label="Connect" />
      <AccountPreview />
      <WalletModal theme="light" />
    </div>
  );
}

export default App;
