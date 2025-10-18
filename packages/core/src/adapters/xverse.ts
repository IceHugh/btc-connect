import { type AccountInfo, ErrorContext, type Network } from '../types';
import { WalletErrorHandler } from '../utils/error-handler';
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

  protected getWalletInstance() {
    return typeof window !== 'undefined' ? window.BitcoinProvider : undefined;
  }

  protected async handleConnect(): Promise<AccountInfo[]> {
    return this.executeWalletOperation(
      async (wallet) => {
        const account = await wallet.connect();

        const accounts: AccountInfo[] = [
          this.createAccountInfo(account.address, account.publicKey),
        ];

        // 设置事件监听
        this.setupEventListeners();

        return accounts;
      },
      'Failed to connect Xverse wallet',
      {
        operation: 'connect',
        walletId: this.id,
        suggestion: 'Please ensure Xverse wallet is installed and unlocked',
      },
    );
  }

  protected async handleDisconnect(): Promise<void> {
    return this.executeWalletOperation(
      async (wallet) => {
        await wallet.disconnect();
        this.removeEventListeners();
      },
      'Failed to disconnect Xverse wallet',
      {
        operation: 'disconnect',
        walletId: this.id,
      },
    );
  }

  protected async handleGetAccounts(): Promise<AccountInfo[]> {
    return this.executeWalletOperation(
      async (wallet) => {
        const accounts = await wallet.getAccounts();
        return accounts.map((account: { address: string; publicKey: string }) =>
          this.createAccountInfo(account.address, account.publicKey),
        );
      },
      'Failed to get accounts from Xverse wallet',
      {
        operation: 'getAccounts',
        walletId: this.id,
      },
    );
  }

  protected async handleGetNetwork(): Promise<Network> {
    return this.executeWalletOperation(
      async (wallet) => {
        const network = await wallet.getNetwork();
        return this.normalizeNetwork(network);
      },
      'Failed to get network from Xverse wallet',
      {
        operation: 'getNetwork',
        walletId: this.id,
      },
    );
  }

  protected async handleSwitchNetwork(network: Network): Promise<void> {
    return this.executeWalletOperation(
      async (wallet) => {
        const xverseNetwork = this.convertToXverseNetwork(network);
        await wallet.switchNetwork(xverseNetwork);
      },
      'Failed to switch network in Xverse wallet',
      {
        operation: 'switchNetwork',
        walletId: this.id,
        network,
      },
    );
  }

  protected async handleSignMessage(message: string): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.signMessage(message),
      'Failed to sign message with Xverse wallet',
      {
        operation: 'signMessage',
        walletId: this.id,
      },
    );
  }

  protected async handleSignPsbt(psbt: string): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.signPsbt(psbt),
      'Failed to sign PSBT with Xverse wallet',
      {
        operation: 'signPsbt',
        walletId: this.id,
      },
    );
  }

  protected async handleSendBitcoin(
    toAddress: string,
    amount: number,
  ): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.sendBitcoin(toAddress, amount),
      'Failed to send bitcoin with Xverse wallet',
      {
        operation: 'sendBitcoin',
        walletId: this.id,
        address: toAddress,
      },
    );
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
