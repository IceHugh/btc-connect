import { SSRWalletProvider } from '@/components/SSRWalletProvider';
import { Header } from '@/components/Header';
import { WalletTestSuite } from '@/components/WalletTestSuite';

export default function Home() {
  return (
    <SSRWalletProvider theme="light">
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <Header theme="light" />
        <main style={{ paddingTop: '0' }}>
          <WalletTestSuite />
        </main>
      </div>
    </SSRWalletProvider>
  );
}