import { LitElement, html, css } from 'lit';
import { copyToClipboard, formatDecimal } from '@btc-connect/shared';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('connect-button')
export class ConnectButton extends LitElement {
  static styles = css`
    :host {
      position: relative;
      display: inline-block;
    }

    .button.x {
      max-width: var(--btc-connect-button-width, 160px);
      min-width: var(--btc-connect-button-width, 160px);
      width: var(--btc-connect-button-width, 160px);
      height: var(--btc-connect-button-height, 36px);
      display: flex;
      padding: var(--btc-connect-button-padding, 0.375rem 1rem);
      font-size: var(--btc-connect-button-font-size, 0.75rem);
      line-height: var(--btc-connect-button-line-height, 1rem);
      font-weight: var(--btc-connect-button-font-weight, 600);
      text-align: center;
      text-transform: uppercase;
      vertical-align: middle;
      align-items: center;
      justify-content: center;
      border-radius: var(--btc-connect-button-border-radius, 0.375rem);
      border: var(--btc-connect-button-border, 1px solid rgba(24, 23, 23, 0.25));
      gap: var(--btc-connect-button-gap, 0.2rem);
      color: var(--btc-connect-button-text-color, #ffffff);
      background-color: var(--btc-connect-button-bg-color, rgb(24, 23, 23));
      cursor: pointer;
      transition: all 0.6s ease;
      text-decoration: none;
      box-sizing: border-box;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    /* Dark theme (default) */
    .button.x.dark {
      color: #ffffff;
      background-color: rgb(24, 23, 23);
      border: 1px solid rgba(24, 23, 23, 0.25);
    }

    .button.x.dark:hover {
      background-color: #333;
    }

    /* Light theme */
    .button.x.light {
      color: #333333;
      background-color: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .button.x.light:hover {
      background-color: #f5f5f5;
    }

    .button.x svg {
      height: 18px;
      width: 18px;
      fill: #f7931a;
      margin-right: 0.375rem;
      flex-shrink: 0;
    }

    .button.x.light svg {
      fill: #f7931a;
    }

    .button.x:hover {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .button.x:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.3);
    }

    .button.x:active {
      opacity: 0.8;
    }

    /* Popup dropdown */
    .popup {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      z-index: 1000;
      width: 100%;
      min-width: unset;
      box-sizing: border-box;
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .popup.dark {
      background-color: #282c34;
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.12);
    }

    .popup.light {
      background-color: #ffffff;
      color: #333333;
      border-color: rgba(0, 0, 0, 0.08);
    }

    .popup-button {
      width: 100%;
      appearance: none;
      border: none;
      border-radius: 6px;
      padding: 8px 12px;
      cursor: pointer;
      font-weight: 600;
      text-transform: capitalize;
      transition: background-color 0.2s ease, opacity 0.2s ease;
    }

    .popup.dark .popup-button {
      background-color: #4a4e5a;
      color: #ffffff;
    }

    .popup.dark .popup-button:hover {
      background-color: #5a5f6c;
    }

    .popup.light .popup-button {
      background-color: #f5f5f5;
      color: #333333;
    }

    .popup.light .popup-button:hover {
      background-color: #ebebeb;
    }

    /* 连接后的样式 */
    .connected-status {
      max-width: var(--btc-connect-button-width, 160px);
      min-width: var(--btc-connect-button-width, 160px);
      width: var(--btc-connect-button-width, 160px);
      height: var(--btc-connect-button-height, 36px);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      padding: 0.3rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      box-sizing: border-box;
      gap: 0.2rem;
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 600;
      text-align: center;
      text-transform: uppercase;
      vertical-align: middle;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    /* Dark theme (default) */
    .connected-status.dark {
      background-color: #282c34;
      color: #ffffff;
      border: 1px solid rgba(24, 23, 23, 0.25);
    }

    .connected-status.dark:hover {
      background-color: #32363e;
    }

    /* Light theme */
    .connected-status.light {
      background-color: #ffffff;
      color: #333333;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .connected-status.light:hover {
      background-color: #f5f5f5;
    }

    .balance-section {
      flex: 1;
      text-align: center;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .balance-amount {
      font-size: 0.75rem;
      font-weight: 600;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-transform: none;
      text-align: center;
    }

    .connected-status.dark .balance-amount {
      color: #ffffff;
    }

    .connected-status.light .balance-amount {
      color: #333333;
    }

    .balance-unit {
      font-weight: 600;
    }

    .connected-status.dark .balance-unit {
      color: #f7931a;
    }

    .connected-status.light .balance-unit {
      color: #f7931a;
    }

    .address-section {
      border-radius: 0.25rem;
      flex-shrink: 0;
      display: flex;
      align-items: center;  
      justify-content: center;
      cursor: pointer;
      width: var(--btc-connect-address-width, 40px);
      min-width: var(--btc-connect-address-width, 40px);
      max-width: var(--btc-connect-address-width, 40px);
      height: var(--btc-connect-button-height, 24px);
      box-sizing: border-box;
      overflow: hidden;
    }

    .connected-status.dark .address-section {
      background-color: #4a4e5a;
    }

    .connected-status.light .address-section {
      background-color: #f0f0f0;
    }

    .address-text {
      font-size: 0.625rem;
      font-weight: 500;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
      text-transform: none;
      text-align: center;
    }

    .copied-icon {
      display: inline-flex;
      color: #22c55e;
      pointer-events: none;
    }

    .connected-status.dark .address-text {
      color: #ffffff;
    }

    .connected-status.light .address-text {
      color: #333333;
    }

    @media (max-width: 480px) {
      .button.x,
      .connected-status {
        max-width: 100%;
        width: 100%;
        min-width: auto;
      }
    }
  `;

  @property({ type: String }) label = 'Connect';
  @property({ type: Boolean }) connected = false;
  @property({ type: Number }) balance = 0;
  @property({ type: String }) address = '';
  @property({ type: String }) unit = 'BTC';
  @property({ type: String }) theme = 'light';
  @property({ type: String }) disconnectText = 'Disconnect';

  @state() private showPopup = false;
  @state() private copied = false;
  private copiedTimer?: number;

  connectedCallback(): void {
    super.connectedCallback();
    this._onDocumentClick = this._onDocumentClick.bind(this);
    document.addEventListener('click', this._onDocumentClick, { capture: true });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onDocumentClick, { capture: true } as any);
    if (this.copiedTimer) {
      clearTimeout(this.copiedTimer);
      this.copiedTimer = undefined;
    }
  }

  private _onDocumentClick(event: MouseEvent): void {
    const path = event.composedPath();
    if (!path.includes(this)) {
      if (this.showPopup) {
        this.showPopup = false;
      }
    }
  }

  private _togglePopup(event: Event): void {
    event.stopPropagation();
    this.showPopup = !this.showPopup;
  }

  private _disconnect(): void {
    this.dispatchEvent(
      new CustomEvent('disconnect', {
        bubbles: true,
        composed: true,
      }),
    );
    this.showPopup = false;
  }

  private async _copyAddress(event: Event): Promise<void> {
    event.stopPropagation();
    if (!this.address) return;
    try {
      await copyToClipboard(this.address);
      this.copied = true;
      if (this.copiedTimer) clearTimeout(this.copiedTimer);
      this.copiedTimer = window.setTimeout(() => {
        this.copied = false;
        this.copiedTimer = undefined;
      }, 1200);
    } catch {
      // 忽略错误，保持静默失败
    }
  }

  render() {
    if (this.connected) {
      // 获取地址的最后4位
      const shortAddress = this.address ? this.address.slice(-4) : 'wallet';

      return html`
        <div class="connected-status ${this.theme}" @click=${this._togglePopup}>
          <div class="balance-section">
            <p class="balance-amount">${formatDecimal(this.balance, 6)} <span class="balance-unit">${this.unit}</span></p>
          </div>
          <div class="address-section" title="address" @click=${this._copyAddress}>
            ${this.copied
          ? html`<span class="copied-icon" aria-label="copied" title="copied">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>`
          : html`<p class="address-text">${shortAddress}</p>`}
          </div>
        </div>
        ${this.showPopup
          ? html`<div class="popup ${this.theme}" @click=${(e: Event) => e.stopPropagation()}>
              <button class="popup-button" @click=${this._disconnect}>${this.disconnectText}</button>
            </div>`
          : null}
      `;
    }

    return html`
      <button class="button x ${this.theme}">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          viewBox="0 0 48 48"
          height="48"
        >
          <path fill="none" d="M0 0h48v48H0z"></path>
          <path
            d="M42 36v2c0 2.21-1.79 4-4 4H10c-2.21 0-4-1.79-4-4V10c0-2.21 1.79-4 4-4h28c2.21 0 4 1.79 4 4v2H24c-2.21 0-4 1.79-4 4v16c0 2.21 1.79 4 4 4h18zm-18-4h20V16H24v16zm8-5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
          ></path>
        </svg>
        ${this.label}
      </button>
    `;
  }
}
