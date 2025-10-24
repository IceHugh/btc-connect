import { getAllAdapters } from '@btc-connect/core';
import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useConnectWallet, useWallet, useWalletModal } from '../context';

// CSS样式 - 使用合理的z-index值
const styles = `
  .btc-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .btc-modal-container {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    max-width: 400px;
    max-height: 80vh;
    width: 90vw;
    height: auto;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: #333333;
  }

  .btc-modal-container.theme-dark {
    background-color: #1a1a1a;
    color: #ffffff;
  }

  .btc-modal-header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .btc-modal-header.theme-dark {
    border-bottom-color: #333333;
  }

  .btc-modal-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: inherit;
  }

  .btc-modal-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 4px;
    color: #666666;
    border-radius: 4px;
    transition: background-color 0.15s ease;
  }

  .btc-modal-close:hover {
    background-color: #f8f9fa;
    color: #333333;
  }

  .btc-modal-close.theme-dark:hover {
    background-color: #2a2a2a;
    color: #ffffff;
  }

  .btc-modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 24px;
  }

  .btc-wallet-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .btc-wallet-item {
    border: 1px solid #dee2e6;
    border-radius: 8px;
    margin-bottom: 8px;
    transition: all 0.15s ease;
    cursor: pointer;
    background-color: #ffffff;
  }

  .btc-wallet-item:hover {
    border-color: #f7931a;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .btc-wallet-item.theme-dark {
    background-color: #1a1a1a;
    border-color: #404040;
  }

  .btc-wallet-item.theme-dark:hover {
    border-color: #f7931a;
    background-color: #2a2a2a;
  }

  .btc-wallet-item:last-child {
    margin-bottom: 0;
  }

  .btc-wallet-button {
    width: 100%;
    padding: 16px;
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: inherit;
    font-size: 14px;
    color: inherit;
    text-align: left;
  }

  .btc-wallet-icon {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
  }

  .btc-wallet-icon img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  .btc-wallet-icon.theme-dark {
    background-color: #2a2a2a;
  }

  .btc-wallet-info {
    flex: 1;
    min-width: 0;
  }

  .btc-wallet-name {
    font-weight: 500;
    margin: 0 0 4px 0;
    color: inherit;
  }

  .btc-wallet-description {
    font-size: 12px;
    color: #666666;
    margin: 0;
  }

  .btc-wallet-description.theme-dark {
    color: #cccccc;
  }

  .btc-wallet-status {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 9999px;
    font-weight: 500;
  }

  .btc-wallet-status.installed {
    background-color: #22c55e;
    color: white;
  }

  .btc-wallet-status.not-installed {
    background-color: #e9ecef;
    color: #666666;
  }

  .btc-wallet-status.not-installed.theme-dark {
    background-color: #3a3a3a;
    color: #cccccc;
  }

  .btc-modal-footer {
    padding: 16px 24px 24px;
    border-top: 1px solid #e9ecef;
  }

  .btc-modal-footer.theme-dark {
    border-top-color: #333333;
  }

  .btc-disclaimer {
    font-size: 12px;
    color: #666666;
    text-align: center;
    margin: 0;
    line-height: 1.5;
  }

  .btc-disclaimer.theme-dark {
    color: #cccccc;
  }

  @media (max-width: 480px) {
    .btc-modal-container {
      width: 100vw;
      height: 100vh;
      max-width: none;
      max-height: none;
      border-radius: 0;
    }

    .btc-modal-header {
      padding: 16px;
    }

    .btc-modal-content {
      padding: 0 16px;
    }

    .btc-modal-footer {
      padding: 16px;
    }
  }

  @keyframes btc-modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .btc-modal-container {
    animation: btc-modalFadeIn 0.3s ease-out;
  }
`;

export interface WalletModalProps {
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  installed: boolean;
  recommended?: boolean;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  title = 'Select Wallet',
  className = '',
  style,
}) => {
  const { availableWallets, connect } = useConnectWallet();
  const { isModalOpen, closeModal } = useWalletModal();
  const { theme } = useWallet();
  const backdropRef = useRef<HTMLDivElement>(null);

  // 获取钱包描述
  const getWalletDescription = useCallback((walletId: string): string => {
    const descriptions: Record<string, string> = {
      unisat: 'Bitcoin wallet for Chrome',
      okx: 'Multi-chain wallet',
      xverse: 'Bitcoin wallet for mobile',
    };
    return descriptions[walletId] || 'Bitcoin wallet';
  }, []);

  // 生成钱包信息列表
  const walletInfos = React.useMemo(() => {
    const installedSet = new Set(
      availableWallets.map((w: { id: string }) => w.id),
    );
    const allAdapters = getAllAdapters();

    return allAdapters.map(
      (adapter) =>
        ({
          id: adapter.id,
          name: adapter.name,
          icon: adapter.icon,
          description: getWalletDescription(adapter.id),
          installed: installedSet.has(adapter.id),
          recommended: ['unisat', 'okx'].includes(adapter.id),
        }) as WalletInfo,
    );
  }, [availableWallets, getWalletDescription]);

  // 注入样式
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'btc-wallet-modal-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = styles;
        document.head.appendChild(style);
      }
    }
  }, []);

  // 处理背景点击
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    },
    [closeModal],
  );

  // 处理钱包选择
  const handleWalletSelect = useCallback(
    async (wallet: WalletInfo) => {
      if (wallet.installed) {
        try {
          await connect(wallet.id);
          closeModal();
        } catch (error) {
          console.error('Failed to connect wallet:', error);
        }
      } else {
        // 打开钱包下载页面
        if (wallet.id === 'unisat') {
          window.open('https://unisat.io/download', '_blank');
        } else if (wallet.id === 'okx') {
          window.open('https://www.okx.com/web3', '_blank');
        } else if (wallet.id === 'xverse') {
          window.open('https://www.xverse.app/download', '_blank');
        }
      }
    },
    [connect, closeModal],
  );

  // 处理ESC键关闭
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen, closeModal]);

  // 阻止背景滚动
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  if (!isModalOpen) {
    return null;
  }

  const modalContent = (
    <div
      ref={backdropRef}
      className="btc-modal-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          handleBackdropClick(e as any);
        }
      }}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        className={`btc-modal-container theme-${theme} ${className}`}
        style={style}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            // 允许Tab键在模态框内导航
            return;
          }
          e.stopPropagation();
        }}
      >
        {/* 模态框头部 */}
        <div className={`btc-modal-header theme-${theme}`}>
          <h2 className="btc-modal-title">{title}</h2>
          <button
            className={`btc-modal-close theme-${theme}`}
            onClick={closeModal}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* 模态框内容 */}
        <div className="btc-modal-content">
          <ul className="btc-wallet-list">
            {walletInfos.map((wallet) => (
              <li key={wallet.id} className={`btc-wallet-item theme-${theme}`}>
                <button
                  className="btc-wallet-button"
                  onClick={() => handleWalletSelect(wallet)}
                >
                  {/* 钱包图标 */}
                  <div className={`btc-wallet-icon theme-${theme}`}>
                    {wallet.icon.startsWith('http') ? (
                      <img src={wallet.icon} alt={wallet.name} />
                    ) : (
                      <span>{wallet.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  {/* 钱包信息 */}
                  <div className="btc-wallet-info">
                    <h3 className="btc-wallet-name">
                      {wallet.name}
                      {wallet.recommended && ' ⭐'}
                    </h3>
                    <p className={`btc-wallet-description theme-${theme}`}>
                      {wallet.description}
                    </p>
                  </div>

                  {/* 安装状态 */}
                  <div
                    className={`btc-wallet-status ${wallet.installed ? 'installed' : 'not-installed'}`}
                  >
                    {wallet.installed ? 'Installed' : 'Not Installed'}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 模态框底部 */}
        <div className={`btc-modal-footer theme-${theme}`}>
          <p className={`btc-disclaimer theme-${theme}`}>
            By connecting a wallet, you agree to the Terms of Service and
            Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );

  // 使用 createPortal 将模态框渲染到 body
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

export default WalletModal;
