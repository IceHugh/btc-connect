import { SSRWalletProvider } from '@/components/SSRWalletProvider';
import { WalletConnectDemo } from '@/components/WalletConnectDemo';

// 模拟服务器端数据获取
async function getServerData() {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    message: 'This content was server-side rendered',
    timestamp: new Date().toISOString(),
    wallets: [
      { id: 'unisat', name: 'UniSat Wallet', available: true },
      { id: 'okx', name: 'OKX Wallet', available: false },
      { id: 'xverse', name: 'Xverse Wallet', available: true }
    ]
  };
}

export default async function SSRTestPage() {
  const serverData = await getServerData();

  return (
    <SSRWalletProvider>
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <h1>SSR Test Page</h1>

        {/* Server-rendered content */}
        <section style={{ marginBottom: 32 }}>
          <h2>Server-Side Rendered Content</h2>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 16,
            backgroundColor: '#f0f8ff'
          }}>
            <p><strong>Message:</strong> {serverData.message}</p>
            <p><strong>Timestamp:</strong> {serverData.timestamp}</p>
            <p><strong>Available Wallets:</strong></p>
            <ul style={{ marginLeft: 20 }}>
              {serverData.wallets.map(wallet => (
                <li key={wallet.id}>
                  {wallet.name} - {wallet.available ? 'Available' : 'Not Available'}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Client-side wallet functionality */}
        <section style={{ marginBottom: 32 }}>
          <h2>Client-Side Wallet Functionality</h2>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 16,
            backgroundColor: '#fff3cd'
          }}>
            <p><em>The wallet connection components below are only initialized on the client side.</em></p>
            <WalletConnectDemo />
          </div>
        </section>

        {/* Hydration information */}
        <section>
          <h2>Hydration Information</h2>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 16,
            backgroundColor: '#d4edda'
          }}>
            <h4>✅ Hydration Success Indicators:</h4>
            <ul style={{ marginLeft: 20 }}>
              <li>No React hydration mismatches</li>
              <li>Server and client content match</li>
              <li>Interactive elements work after hydration</li>
              <li>Event listeners properly attached</li>
            </ul>

            <h4>🔍 How to Test SSR:</h4>
            <ol style={{ marginLeft: 20 }}>
              <li>View page source - you'll see the server-rendered content</li>
              <li>Disable JavaScript - page content remains visible</li>
              <li>Enable JavaScript - wallet components become interactive</li>
              <li>Check browser console - no hydration errors</li>
            </ol>
          </div>
        </section>
      </div>
    </SSRWalletProvider>
  );
}