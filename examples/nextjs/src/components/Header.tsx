'use client';

import { ConnectButton } from '@btc-connect/react';

interface HeaderProps {
  theme?: 'light' | 'dark';
}

export function Header({ theme = 'light' }: HeaderProps) {
  return (
    <header style={{
      backgroundColor: theme === 'light' ? '#ffffff' : '#1a1a1a',
      borderBottom: `2px solid ${theme === 'light' ? '#f7931a' : '#f7931a'}`,
      padding: '16px 0',
      boxShadow: theme === 'light'
        ? '0 2px 8px rgba(0,0,0,0.1)'
        : '0 2px 8px rgba(0,0,0,0.3)',
      position: 'sticky' as const,
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo 和标题 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Bitcoin Logo */}
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#f7931a',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(247, 147, 26, 0.3)'
          }}>
            <svg
              width="24"
              height="24"
              fill="white"
              viewBox="0 0 24 24"
              style={{ display: 'block' }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56c-.21-.81-.84-1.29-1.84-1.29H10v8h2v-3h2.5c1 0 1.63-.48 1.84-1.29.2-.76-.01-1.58-.56-2.09.55-.51.76-1.33.56-2.09z"/>
            </svg>
          </div>

          {/* 标题文字 */}
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: theme === 'light' ? '#212529' : '#ffffff',
              lineHeight: '1.2'
            }}>
              BTC Connect
            </h1>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: theme === 'light' ? '#6c757d' : '#adb5bd',
              marginTop: '2px'
            }}>
              Next.js 测试套件
            </p>
          </div>
        </div>

        {/* 右侧钱包连接按钮 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            fontSize: '14px',
            color: theme === 'light' ? '#6c757d' : '#adb5bd'
          }}>
            钱包连接
          </div>
          <ConnectButton
            size="md"
            variant="select"
            label="连接钱包"
          />
        </div>
      </div>
    </header>
  );
}
