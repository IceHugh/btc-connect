import { type AccountInfo, Network } from '../types';
import { BaseWalletAdapter } from './base';

declare global {
  interface Window {
    BitcoinProvider?: {
      connect(): Promise<{ address: string; publicKey: string }>;
      disconnect(): Promise<void>;
      getAccounts(): Promise<{ address: string; publicKey: string }[]>;
      getNetwork(): Promise<string>;
      switchNetwork(network: string): Promise<void>;
      signMessage(message: string): Promise<string>;
      signPsbt(psbt: string): Promise<string>;
      sendBitcoin(toAddress: string, amount: number): Promise<string>;
      on(event: string, callback: (...args: any[]) => void): void;
    };
  }
}

/**
 * Xverse钱包适配器
 */
export class XverseAdapter extends BaseWalletAdapter {
  readonly id = 'xverse';
  readonly name = 'Xverse Wallet';
  readonly icon =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzAwN0FGRiIvPgo8cGF0aCBkPSJNMTYgOEMxMi42ODYyIDggMTAgMTAuNjg2MiAxMCAxNEMxMCAxNy4zMTM4IDEyLjY4NjIgMjAgMTYgMjBDMTkuMzEzOCAyMCAyMiAxNy4zMTM4IDIyIDE0QzIyIDEwLjY4NjIgMTkuMzEzOCA4IDE2IDhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=';

  isReady(): boolean {
    return typeof window !== 'undefined' && !!window.BitcoinProvider;
  }

  protected async handleConnect(): Promise<AccountInfo[]> {
    if (!window.BitcoinProvider) {
      throw new Error('Xverse wallet not found');
    }

    const account = await window.BitcoinProvider.connect();

    const accounts: AccountInfo[] = [
      {
        address: account.address,
        publicKey: account.publicKey,
        balance: undefined,
        network: this.normalizeNetwork('livenet'),
      },
    ];

    // 设置事件监听
    this.setupEventListeners();

    return accounts;
  }

  protected async handleDisconnect(): Promise<void> {
    if (!window.BitcoinProvider) {
      throw new Error('Xverse wallet not found');
    }

    await window.BitcoinProvider.disconnect();
    this.removeEventListeners();
  }

  protected async handleGetAccounts(): Promise<AccountInfo[]> {
    if (!window.BitcoinProvider) {
      throw new Error('Xverse wallet not found');
    }

    const accounts = await window.BitcoinProvider.getAccounts();
    return accounts.map((account) => ({
      address: account.address,
      publicKey: account.publicKey,
      balance: undefined,
      network: this.normalizeNetwork('livenet'),
    }));
  }

  protected async handleGetNetwork(): Promise<Network> {
    if (!window.BitcoinProvider) {
      throw new Error('Xverse wallet not found');
    }

    const network = await window.BitcoinProvider.getNetwork();
    return this.normalizeNetwork(network);
  }

  protected async handleSwitchNetwork(network: Network): Promise<void> {
    if (!window.BitcoinProvider) {
      throw new Error('Xverse wallet not found');
    }

    const xverseNetwork = this.convertToXverseNetwork(network);
    await window.BitcoinProvider.switchNetwork(xverseNetwork);
  }

  protected async handleSignMessage(message: string): Promise<string> {
    if (!window.BitcoinProvider) {
      throw new Error('Xverse wallet not found');
    }

    return await window.BitcoinProvider.signMessage(message);
  }

  protected async handleSignPsbt(psbt: string): Promise<string> {
    if (!window.BitcoinProvider) {
      throw new Error('Xverse wallet not found');
    }

    return await window.BitcoinProvider.signPsbt(psbt);
  }

  protected async handleSendBitcoin(
    toAddress: string,
    amount: number,
  ): Promise<string> {
    if (!window.BitcoinProvider) {
      throw new Error('Xverse wallet not found');
    }

    return await window.BitcoinProvider.sendBitcoin(toAddress, amount);
  }

  private setupEventListeners(): void {
    if (!window.BitcoinProvider) return;

    // 监听账户变化
    window.BitcoinProvider.on(
      'accountsChanged',
      (accounts: { address: string; publicKey: string }[]) => {
        const accountInfos: AccountInfo[] = accounts.map((account) => ({
          address: account.address,
          publicKey: account.publicKey,
          balance: undefined,
          network: this.normalizeNetwork('livenet'),
        }));
        this.updateAccounts(accountInfos);
      },
    );

    // 监听网络变化
    window.BitcoinProvider.on('networkChanged', (network: string) => {
      const normalizedNetwork = this.normalizeNetwork(network);
      this.updateNetwork(normalizedNetwork);
    });
  }

  private removeEventListeners(): void {
    // Xverse wallet doesn't provide a way to remove event listeners
    // This is a limitation of the current API
  }

  /**
   * 将Xverse网络字符串转换为Network枚举
   */
  private normalizeNetwork(network: string): Network {
    switch (network) {
      case 'livenet':
        return 'mainnet';
      case 'testnet':
        return 'testnet';
      case 'regtest':
        return 'regtest';
      default:
        return 'mainnet'; // 默认主网
    }
  }

  /**
   * 将Network枚举转换为Xverse网络字符串
   */
  private convertToXverseNetwork(network: Network): string {
    switch (network) {
      case 'mainnet':
        return 'livenet';
      case 'testnet':
        return 'testnet';
      case 'regtest':
        return 'regtest';
      default:
        return 'livenet'; // 默认主网
    }
  }
}
