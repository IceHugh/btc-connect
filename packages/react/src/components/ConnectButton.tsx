import type * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useWallet, useWalletModal } from '../context';
import { formatAddressShort, formatBTCBalance } from '../utils';

// CSS样式
const styles = `
  .btc-connect-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    background-color: #ffffff;
    color: #333333;
    cursor: pointer;
    transition: all 0.15s ease;
    box-sizing: border-box;
    user-select: none;
    min-height: 40px;
  }

  .btc-connect-button:hover:not(:disabled) {
    background-color: #f8f9fa;
    border-color: #adb5bd;
  }

  .btc-connect-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px #f7931a;
  }

  .btc-connect-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btc-connect-button.theme-dark {
    background-color: #1a1a1a;
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .btc-connect-button.theme-dark:hover:not(:disabled) {
    background-color: #2a2a2a;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .btc-connect-button svg {
    width: 18px;
    height: 18px;
    fill: #f7931a;
    flex-shrink: 0;
  }

  .btc-connected-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 4px;
    min-width: 160px;
    max-width: 98vw;
    height: 40px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    cursor: pointer;
    transition: all 0.15s ease;
    box-sizing: border-box;
    font-size: 12px;
    position: relative;
  }

  .btc-connected-status.theme-dark {
    background-color: #2a2a2a;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .btc-connected-status.theme-light {
    background-color: #ffffff;
    color: #333333;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .btc-connected-status:hover {
    opacity: 0.9;
  }

  .btc-balance-section {
    flex: 1;
    text-align: center;
    min-width: 0;
  }

  .btc-balance-amount {
    font-size: 12px;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .btc-balance-unit {
    font-weight: 600;
    color: #f7931a;
    margin-left: 2px;
  }

  .btc-address-section {
    width: 48px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: #e9ecef;
    border: 1px solid #dee2e6;
    transition: all 0.15s ease;
    overflow: hidden;
    padding: 0 6px;
    flex-shrink: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 10px;
    font-weight: 500;
    color: #333333;
    box-sizing: border-box;
    user-select: none;
  }

  .btc-address-section:hover {
    background-color: #f8f9fa;
    border-color: #adb5bd;
  }

  .btc-address-section:focus {
    outline: none;
    box-shadow: 0 0 0 2px #f7931a;
  }

  .btc-address-section.theme-dark {
    background-color: #3a3a3a;
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .btc-address-section.theme-dark:hover {
    background-color: #4a4a4a;
    border-color: rgba(255, 255, 255, 0.2);
  }

  /* 保持向后兼容 */
  .btc-connected-status.theme-dark .btc-address-section {
    background-color: #3a3a3a;
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .btc-connected-status.theme-dark .btc-address-section:hover {
    background-color: #4a4a4a;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .btc-address-text {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .btc-copied-icon {
    color: #22c55e;
    pointer-events: none;
  }

  .btc-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 1000;
    width: auto;
    min-width: 120px;
    max-width: 200px;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid #e9ecef;
    background-color: #ffffff;
    user-select: none;
  }

  .btc-dropdown.theme-dark {
    background-color: #2a2a2a;
    border-color: #404040;
    color: #ffffff;
  }

  .btc-dropdown-item {
    width: 100%;
    appearance: none;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.15s ease;
    background-color: transparent;
    color: inherit;
    text-align: left;
    font-family: inherit;
    font-size: inherit;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  .btc-dropdown-item:hover {
    background-color: #f8f9fa;
  }

  .btc-dropdown.theme-dark .btc-dropdown-item:hover {
    background-color: #3a3a3a;
  }

  @media (max-width: 480px) {
    .btc-connect-button,
    .btc-connected-status {
      width: 100%;
      min-width: auto;
      max-width: 98vw;
    }

    .btc-dropdown {
      max-width: 100%;
      width: auto;
    }
  }
`;

export interface ConnectButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'select' | 'button' | 'compact';
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ConnectButton: React.FC<ConnectButtonProps> = ({
  size = 'md',
  variant: _variant = 'select',
  label = 'Connect',
  disabled = false,
  className = '',
  style,
}) => {
  const { currentAccount, balance, isConnected, disconnect, theme } =
    useWallet();
  const { openModal } = useWalletModal();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedTimer, setCopiedTimer] = useState<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 注入样式
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'btc-connect-button-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = styles;
        document.head.appendChild(style);
      }
    }
  }, []);

  // 处理外部点击
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showDropdown]);

  // 清理复制定时器
  useEffect(() => {
    return () => {
      if (copiedTimer) {
        clearTimeout(copiedTimer);
      }
    };
  }, [copiedTimer]);

  const handleConnect = useCallback(() => {
    if (disabled) return;
    openModal();
  }, [disabled, openModal]);

  const handleDisconnect = useCallback(() => {
    setShowDropdown(false);
    disconnect?.();
  }, [disconnect]);

  const handleCopyAddress = useCallback(async () => {
    if (!currentAccount?.address) return;

    try {
      await navigator.clipboard.writeText(currentAccount.address);
      setCopied(true);

      // 清理之前的定时器
      if (copiedTimer) {
        clearTimeout(copiedTimer);
      }

      // 设置新的定时器
      const timer = setTimeout(() => {
        setCopied(false);
      }, 1200);
      setCopiedTimer(timer);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  }, [currentAccount?.address, copiedTimer]);

  const handleToggleDropdown = useCallback(() => {
    setShowDropdown(!showDropdown);
  }, [showDropdown]);

  const handleAddressClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // 阻止事件冒泡，防止触发父容器的点击事件
      handleCopyAddress();
    },
    [handleCopyAddress],
  );

  // 创建比特币图标
  const BitcoinIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      aria-label="比特币"
      role="img"
    >
      <title>比特币</title>
      <path fill="none" d="M0 0h48v48H0z" />
      <path d="M42 36v2c0 2.21-1.79 4-4 4H10c-2.21 0-4-1.79-4-4V10c0-2.21 1.79-4 4-4h28c2.21 0 4 1.79 4 4v2H24c-2.21 0-4 1.79-4 4v16c0 2.21 1.79 4 4 4h18zm-18-4h20V16H24v16zm8-5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
    </svg>
  );

  // 创建复制成功图标
  const CopiedIcon = () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="btc-copied-icon"
      aria-label="复制成功"
    >
      <title>复制成功</title>
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // 获取按钮样式
  const getButtonStyles = () => {
    const baseStyles: React.CSSProperties = {
      ...(size === 'sm' && {
        minHeight: '32px',
        padding: '4px 12px',
        fontSize: '12px',
      }),
      ...(size === 'lg' && {
        minHeight: '48px',
        padding: '12px 24px',
        fontSize: '16px',
      }),
      ...style,
    };

    return baseStyles;
  };

  if (isConnected && currentAccount?.address) {
    return (
      // biome-ignore lint/a11y/useSemanticElements: 我们使用 div 而不是 button 来避免按钮嵌套问题
      <div
        ref={containerRef}
        className={`btc-connected-status theme-${theme}`}
        style={getButtonStyles()}
        onClick={handleToggleDropdown}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleDropdown();
          }
        }}
      >
        <div className="btc-balance-section">
          <p className="btc-balance-amount">
            {formatBTCBalance(balance?.total || 0)}{' '}
            <span className="btc-balance-unit">BTC</span>
          </p>
        </div>

        <button
          className={`btc-address-section theme-${theme}`}
          onClick={handleAddressClick}
          title={currentAccount.address}
          type="button"
          aria-label={`复制地址: ${currentAccount.address}`}
        >
          {copied ? (
            <CopiedIcon />
          ) : (
            <p className="btc-address-text">
              {formatAddressShort(currentAccount.address, 4)}
            </p>
          )}
        </button>

        {showDropdown && (
          <div ref={dropdownRef} className={`btc-dropdown theme-${theme}`}>
            <button className="btc-dropdown-item" onClick={handleDisconnect}>
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      className={`btc-connect-button theme-${theme} ${className}`}
      style={getButtonStyles()}
      onClick={handleConnect}
      disabled={disabled}
    >
      <BitcoinIcon />
      {label}
    </button>
  );
};

export default ConnectButton;
