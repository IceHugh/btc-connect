import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

interface WalletOption {
  id: string;
  name: string;
  description?: string;
  icon: string;
  installed?: boolean;
  downloadUrl?: string;
}

interface ModalTexts {
  title?: string;
  installedText?: string;
  notInstalledText?: string;
  downloadText?: string;
}

@customElement('wallet-modal')
export class WalletModal extends LitElement {
  static styles = css`
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: rgba(0,0,0,0.4);
    }

    .modal-content {
      margin: var(--btc-connect-modal-margin, 10% auto);
      padding: var(--btc-connect-modal-padding, 16px);
      border-radius: var(--btc-connect-modal-border-radius, 8px);
      position: relative;
      max-width: var(--btc-connect-modal-max-width, 320px);
      width: var(--btc-connect-modal-width, 90%);
      transition: all 0.3s ease;
    }

    /* Dark theme */
    .modal-content.dark {
      background-color: #282c34;
      color: #ffffff;
      border: 1px solid rgba(24, 23, 23, 0.25);
    }

    /* Light theme */
    .modal-content.light {
      background-color: #ffffff;
      color: #333333;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .close {
      float: right;
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      line-height: 1;
      transition: color 0.3s ease;
    }

    .modal-content.dark .close {
      color: #aaa;
    }

    .modal-content.dark .close:hover,
    .modal-content.dark .close:focus {
      color: #ffffff;
    }

    .modal-content.light .close {
      color: #666;
    }

    .modal-content.light .close:hover,
    .modal-content.light .close:focus {
      color: #333333;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }

    .modal-content.dark .modal-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .modal-content.light .modal-header {
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .modal-title {
      font-size: 16px;
      font-weight: bold;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .modal-content.dark .modal-title {
      color: #ffffff;
    }

    .modal-content.light .modal-title {
      color: #333333;
    }

    .wallet-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .wallet-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .wallet-item.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .wallet-item.disabled .wallet-actions {
      opacity: 1;
    }

    .wallet-item.disabled .download-button {
      opacity: 1;
      cursor: pointer;
    }

    .modal-content.dark .wallet-item {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background-color: #32363e;
    }

    .modal-content.dark .wallet-item:hover:not(.disabled) {
      background-color: #4a4e5a;
      border-color: #f7931a;
    }

    .modal-content.dark .wallet-item.disabled:hover {
      background-color: #32363e;
      border-color: rgba(255, 255, 255, 0.1);
    }

    .modal-content.light .wallet-item {
      border: 1px solid rgba(0, 0, 0, 0.1);
      background-color: #ffffff;
    }

    .modal-content.light .wallet-item:hover:not(.disabled) {
      background-color: #f5f5f5;
      border-color: #f7931a;
    }

    .modal-content.light .wallet-item.disabled:hover {
      background-color: #ffffff;
      border-color: rgba(0, 0, 0, 0.1);
    }

    .wallet-icon {
      width: 28px;
      height: 28px;
      margin-right: 12px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .wallet-icon img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px;
    }

    .wallet-icon.fallback {
      background-color: #f7931a;
      color: #ffffff;
      font-weight: bold;
      font-size: 14px;
    }

    .wallet-info {
      flex: 1;
    }

    .wallet-name {
      font-weight: bold;
      margin-bottom: 2px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .modal-content.dark .wallet-name {
      color: #ffffff;
    }

    .modal-content.light .wallet-name {
      color: #333333;
    }

    .wallet-description {
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .modal-content.dark .wallet-description {
      color: #aaa;
    }

    .modal-content.light .wallet-description {
      color: #666;
    }

    .install-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .install-badge.installed {
      background-color: #4caf50;
      color: #ffffff;
    }

    .install-badge.not-installed {
      background-color: #ff9800;
      color: #ffffff;
    }

    .download-button {
      padding: 4px 8px;
      font-size: 11px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
    }

    .modal-content.dark .download-button {
      background-color: #f7931a;
      color: #ffffff;
    }

    .modal-content.dark .download-button:hover {
      background-color: #e6851a;
    }

    .modal-content.light .download-button {
      background-color: #f7931a;
      color: #ffffff;
    }

    .modal-content.light .download-button:hover {
      background-color: #e6851a;
    }

    .wallet-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* 移动端优化 */
    @media (max-width: 480px) {
      .modal-content {
        margin: 5% auto;
        width: 95%;
        max-width: none;
        padding: 12px;
      }
      
      .modal-title {
        font-size: 15px;
      }
      
      .wallet-item {
        padding: 10px;
      }
      
      .wallet-icon {
        width: 24px;
        height: 24px;
        margin-right: 10px;
        font-size: 12px;
      }
      
      .wallet-name {
        font-size: 13px;
      }
      
      .wallet-description {
        font-size: 11px;
      }
    }
  `;

  @property({ type: Boolean }) open = false;
  @property({ type: String }) theme = 'light';
  @property({ type: String }) title = 'Select Wallet';
  @property({ type: Object }) texts: ModalTexts = {
    title: 'Select Wallet',
    installedText: 'Installed',
    notInstalledText: 'Not Installed',
    downloadText: 'Download'
  };
  @property({ type: Array }) wallets: WalletOption[] = [];

  constructor() {
    super();
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleKeyDown);
  }

  private _handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.open) {
      this.close();
    }
  }

  private _handleCloseClick() {
    this.close();
  }

  private _handleModalClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  private _handleWalletSelect(wallet: WalletOption) {
    // 如果钱包未安装，不执行任何操作
    if (!wallet.installed) {
      return;
    }

    // 只有已安装的钱包才能被选择
    this.dispatchEvent(new CustomEvent('wallet-selected', {
      detail: { 
        wallet: wallet.id,
        walletData: wallet
      },
      bubbles: true,
      composed: true
    }));
    this.close();
  }

  public close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('modal-closed', {
      bubbles: true,
      composed: true
    }));
  }

  public openModal() {
    this.open = true;
    this.dispatchEvent(new CustomEvent('modal-opened', {
      bubbles: true,
      composed: true
    }));
  }

  private _isImageUrl(icon: string): boolean {
    return icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:image');
  }

  render() {
    return html`
      <div 
        class="modal" 
        style="display: ${this.open ? 'block' : 'none'}"
        @click="${this._handleModalClick}"
      >
        <div class="modal-content ${this.theme}">
          <div class="modal-header">
            <div class="modal-title">${this.texts.title || this.title}</div>
            <span class="close" @click="${this._handleCloseClick}">&times;</span>
          </div>
          
          <div class="wallet-list">
            ${this.wallets.map(wallet => {
              // 判断显示逻辑
              const isInstalled = wallet.installed === true;
              const hasDownloadUrl = !!wallet.downloadUrl;
              const showNotInstalledBadge = !isInstalled && !hasDownloadUrl;
              const showDownloadButton = !isInstalled && hasDownloadUrl;
              
              return html`
                <div class="wallet-item ${!isInstalled ? 'disabled' : ''}" 
                     @click="${isInstalled ? () => this._handleWalletSelect(wallet) : null}">
                  <div class="wallet-icon ${this._isImageUrl(wallet.icon) ? '' : 'fallback'}">
                    ${this._isImageUrl(wallet.icon) 
                      ? html`<img src="${wallet.icon}" alt="${wallet.name}" onerror="this.parentElement.classList.add('fallback'); this.remove(); this.parentElement.textContent = '${wallet.name.charAt(0).toUpperCase()}';" />`
                      : wallet.name.charAt(0).toUpperCase()
                    }
                  </div>
                  <div class="wallet-info">
                    <div class="wallet-name">
                      ${wallet.name}
                      ${showNotInstalledBadge ? html`
                        <span class="install-badge not-installed">
                          ${this.texts.notInstalledText}
                        </span>
                      ` : ''}
                    </div>
                    ${wallet.description ? html`
                      <div class="wallet-description">${wallet.description}</div>
                    ` : ''}
                  </div>
                  ${showDownloadButton ? html`
                    <div class="wallet-actions">
                      <a 
                        href="${wallet.downloadUrl}" 
                        target="_blank" 
                        class="download-button"
                      >
                        📥 ${this.texts.downloadText}
                      </a>
                    </div>
                  ` : ''}
                </div>
              `;
            })}
          </div>
        </div>
      </div>
    `;
  }
}
