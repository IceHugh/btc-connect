'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { SSRWalletProvider } from '@/components/SSRWalletProvider';
import { WalletTestSuite } from '@/components/WalletTestSuite';

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <SSRWalletProvider theme={theme}>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: theme === 'light' ? '#f8f9fa' : '#1a1a1a',
          transition: 'background-color 0.3s ease',
        }}
      >
        <Header theme={theme} />

        {/* 主题切换测试按钮 */}
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            borderBottom: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
          }}
        >
          <h2
            style={{
              color: theme === 'light' ? '#333' : '#fff',
              marginBottom: '16px',
            }}
          >
            主题切换测试
          </h2>
          <button
            onClick={toggleTheme}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: theme === 'light' ? '#007bff' : '#0056b3',
              color: '#fff',
              transition: 'all 0.3s ease',
              boxShadow:
                theme === 'light'
                  ? '0 2px 4px rgba(0,0,0,0.1)'
                  : '0 2px 8px rgba(0,0,0,0.3)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.backgroundColor =
                theme === 'light' ? '#0056b3' : '#004085';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor =
                theme === 'light' ? '#007bff' : '#0056b3';
            }}
          >
            切换到 {theme === 'light' ? '暗色' : '亮色'} 主题
          </button>
          <p
            style={{
              marginTop: '12px',
              color: theme === 'light' ? '#666' : '#ccc',
              fontSize: '14px',
            }}
          >
            当前主题: <strong>{theme === 'light' ? '亮色' : '暗色'}</strong>
          </p>
        </div>

        <main style={{ paddingTop: '0' }}>
          <WalletTestSuite />
        </main>
      </div>
    </SSRWalletProvider>
  );
}
