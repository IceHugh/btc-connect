'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BTCConnectButton,
  WalletModal,
  useWallet,
  useWalletModal,
  useWalletEvent
} from '@btc-connect/react';

export function WalletConnectDemo() {
  const [logs, setLogs] = useState<string[]>([]);
  const { address, balance, isConnected, isConnecting } = useWallet();
  const { openModal, isModalOpen } = useWalletModal();

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  
  // 监听钱包事件
  useWalletEvent('connect', (accounts) => {
    addLog(`Wallet connected with ${accounts.length} account(s)`);
  });

  useWalletEvent('disconnect', () => {
    addLog('Wallet disconnected');
  });

  useWalletEvent('accountChange', (accounts) => {
    addLog(`Account changed: ${accounts.length} account(s)`);
  });

  useWalletEvent('networkChange', (network) => {
    addLog(`Network changed to: ${network}`);
  });

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1>BTC Connect - Next.js SSR Example</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>
          This example demonstrates Bitcoin wallet connection with full SSR support.
          The page is server-side rendered, and wallet functionality is enabled only on the client.
        </p>
      </div>

      {/* Light Theme Section */}
      <section style={{ marginBottom: 32 }}>
        <h2>Light Theme</h2>
        <div style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 16,
          backgroundColor: '#fff'
        }}>
          <div style={{ marginBottom: 16 }}>
            <BTCConnectButton label="Connect Wallet" />
          </div>
        </div>
      </section>

      {/* Dark Theme Section */}
      <section style={{ marginBottom: 32 }}>
        <h2>Dark Theme</h2>
        <div style={{
          border: '1px solid #444',
          borderRadius: 8,
          padding: 16,
          backgroundColor: '#2a2a2a',
          color: '#fff'
        }}>
          <div style={{ marginBottom: 16 }}>
            <BTCConnectButton label="Connect Wallet" />
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section style={{ marginBottom: 32 }}>
        <h2>Connection Status</h2>
        <div style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 16,
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Status:</strong> {isConnecting ? 'Connecting...' : (isConnected ? 'Connected' : 'Disconnected')}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Address:</strong> {address || '-'}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Balance:</strong> {balance ? `${balance.total} BTC` : '-'}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Modal:</strong> {isModalOpen ? 'Open' : 'Closed'}
          </div>
          <div style={{ marginBottom: 8 }}>
            <button
              onClick={useCallback(() => {
                openModal();
              }, [openModal])}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f7931a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Test Open Modal
            </button>
          </div>
        </div>
      </section>

      {/* Event Logs */}
      <section style={{ marginBottom: 32 }}>
        <h2>Event Logs</h2>
        <div style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 16,
          backgroundColor: '#f8f9fa',
          fontFamily: 'monospace',
          fontSize: 14
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#999' }}>No events yet. Connect a wallet to see events.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: 4 }}>
                {log}
              </div>
            ))
          )}
        </div>
      </section>

      {/* SSR Info */}
      <section>
        <h2>SSR Information</h2>
        <div style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 16,
          backgroundColor: '#e7f3ff'
        }}>
          <h4>✅ SSR Compatible Features:</h4>
          <ul style={{ marginLeft: 20, marginBottom: 16 }}>
            <li>Page is server-side rendered for optimal performance</li>
            <li>Wallet components are dynamically loaded only on client</li>
            <li>No hydration mismatches</li>
            <li>Fallback UI during loading</li>
          </ul>

          <h4>🔧 Technical Implementation:</h4>
          <ul style={{ marginLeft: 20 }}>
            <li>Web Components loaded dynamically with useEffect</li>
            <li>Provider wrapped with client-side detection</li>
            <li>Graceful fallback for server-side rendering</li>
            <li>Event listeners attached only on client</li>
          </ul>
        </div>
      </section>

      {/* 模态框 */}
      <WalletModal />
    </div>
  );
}