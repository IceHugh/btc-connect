import './App.css';
import { BTCConnectButton, WalletModal, useWallet, useWalletModal } from '@btc-connect/react';

function AccountPreview() {
  const { address, balance, isConnected } = useWallet();
  const { isModalOpen } = useWalletModal();

  return (
    <div style={{ marginTop: 16, fontSize: 14 }}>
      <div>
        <b>Status:</b> {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <div>
        <b>Address:</b> {address ?? '-'}
      </div>
      {balance && (
        <div>
          <b>Balance:</b> {balance.total} BTC
        </div>
      )}
      <div>
        <b>Modal State:</b> {isModalOpen ? 'Open' : 'Closed'}
      </div>
    </div>
  );
}

function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>BTC Connect React Demo</h1>
      <p style={{ marginBottom: 16 }}>
        This demo showcases the new native Web Components integration with React.
        The components below are built with native Web Components and wrapped for React.
      </p>

      <div style={{ marginBottom: 24 }}>
        <h3>Light Theme</h3>
        <BTCConnectButton theme="light" label="Connect Wallet" />
        <AccountPreview />
        <WalletModal theme="light" />
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3>Dark Theme</h3>
        <div style={{ backgroundColor: '#333', padding: 16, borderRadius: 8 }}>
          <BTCConnectButton theme="dark" label="Connect Wallet" />
          <WalletModal theme="dark" />
        </div>
      </div>

      <div style={{ marginTop: 32, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        <h4>SSR Compatibility</h4>
        <p>This example is fully SSR compatible. The Web Components are dynamically loaded only on the client side.</p>
      </div>
    </div>
  );
}

export default App;
