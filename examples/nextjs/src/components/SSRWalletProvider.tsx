'use client';

import type {
  ConnectionPolicyTaskContext,
  ConnectionPolicyTaskResult,
} from '@btc-connect/react';
import { BTCWalletProvider } from '@btc-connect/react';
import { useEffect, useState } from 'react';

interface SSRWalletProviderProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}

export function SSRWalletProvider({
  children,
  theme = 'light',
}: SSRWalletProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 在服务端渲染时，显示加载占位符，避免执行钱包相关hooks
  if (!isClient) {
    return (
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <h1>BTC Connect - Next.js SSR Example</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>
          Loading wallet connection functionality...
        </p>
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 16,
            backgroundColor: '#f8f9fa',
            textAlign: 'center',
            color: '#333',
          }}
        >
          <p>
            <strong>SSR Loading State</strong>
          </p>
          <p>
            Wallet components will be available after client-side hydration.
          </p>
        </div>
      </div>
    );
  }

  // 客户端渲染时，才渲染完整的钱包提供者
  return (
    <BTCWalletProvider
      theme={theme}
      autoConnect={true}
      connectTimeout={5000}
      connectionPolicy={{
        tasks: [
          {
            id: 'sign-message',
            required: false,
            autoBehavior: 'skip',
            run: async ({
              manager,
            }: ConnectionPolicyTaskContext): Promise<ConnectionPolicyTaskResult> => {
              const adapter = manager.getCurrentAdapter();
              if (!adapter?.signMessage) {
                return { success: false };
              }
              try {
                const sig = await adapter.signMessage('SSR Demo message');
                return { success: true, data: sig };
              } catch (error) {
                console.error('Sign message failed:', error);
                return { success: false };
              }
            },
          },
        ],
        emitEventsOnAutoConnect: false,
      }}
    >
      <div className="ssr-ready">{children}</div>
    </BTCWalletProvider>
  );
}
