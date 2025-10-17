import { SSRWalletProvider } from '@/components/SSRWalletProvider';
import { WalletConnectDemo } from '@/components/WalletConnectDemo';

export default function Home() {
  return (
    <div>
      {/* Light Theme Example */}
      <SSRWalletProvider theme="light">
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
          <h2>Light Theme Example</h2>
          <WalletConnectDemo />
        </div>
      </SSRWalletProvider>

      {/* Dark Theme Example */}
      <SSRWalletProvider theme="dark">
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto', backgroundColor: '#2a2a2a', color: '#fff' }}>
          <h2>Dark Theme Example</h2>
          <WalletConnectDemo />
        </div>
      </SSRWalletProvider>
    </div>
  );
}