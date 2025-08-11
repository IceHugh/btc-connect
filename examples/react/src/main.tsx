import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BTCWalletProvider } from '@btc-connect/react';
import type { ConnectionPolicyTaskContext, ConnectionPolicyTaskResult } from '@btc-connect/react';
import './index.css';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
createRoot(rootElement).render(
  <StrictMode>
    <BTCWalletProvider
      autoConnect={true}
      connectTimeout={5000}
      connectionPolicy={{
        tasks: [
          {
            id: 'sign-message',
            required: true,
            interactive: true,
            autoBehavior: 'skip',
            run: async ({ manager }: ConnectionPolicyTaskContext): Promise<ConnectionPolicyTaskResult> => {
              const adapter = manager.getCurrentAdapter();
              if (!adapter?.signMessage) {
                return { success: false };
              }
              const sig = await adapter.signMessage('Demo message');
              return { success: true, data: sig };
            },
          },
        ],
        emitEventsOnAutoConnect: false,
      }}
    >
      <App />
    </BTCWalletProvider>
  </StrictMode>,
);
