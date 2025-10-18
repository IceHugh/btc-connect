import type { AccountInfo, ErrorContext, Network } from '../types';
import { WalletErrorHandler } from '../utils/error-handler';
import { BaseWalletAdapter } from './base';

declare global {
  interface Window {
    okxwallet?: {
      bitcoin: {
        // 连接方法
        connect(): Promise<{ address: string; publicKey: string }>;
        requestAccounts(): Promise<string[]>;
        disconnect(): Promise<void>;

        // 账户信息
        getAccounts(): Promise<string[]>;
        getPublicKey(): Promise<string>;
        getBalance(): Promise<{
          confirmed: number;
          unconfirmed: number;
          total: number;
        }>;

        // 网络管理
        getNetwork(): Promise<string>;

        // Inscriptions

        getInscriptions(
          cursor?: number,
          size?: number,
        ): Promise<{
          total: number;
          list: Array<{
            inscriptionId: string;
            inscriptionNumber: string;
            address: string;
            outputValue: string;
            contentLength: string;
            contentType: number;
            timestamp: number;
            offset: number;
            output: string;
            genesisTransaction: string;
            location: string;
          }>;
        }>;

        // 交易相关
        sendBitcoin(
          toAddress: string,
          satoshis: number,
          options?: {
            feeRate?: number;
          },
        ): Promise<string>;

        send({
          from,
          to,
          value,
          satBytes,
          memo,
          memoPos,
        }: {
          from: string;
          to: string;
          value: string;
          satBytes?: string;
          memo?: string;
          memoPos?: number;
        }): Promise<{ txhash: string }>;

        sendInscription(
          address: string,
          inscriptionId: string,
          options?: {
            feeRate?: number;
          },
        ): Promise<string>;

        // 签名相关
        signMessage(
          signStr: string,
          type?: 'ecdsa' | 'bip322-simple',
        ): Promise<string>;

        // PSBT 相关
        signPsbt(psbt: string): Promise<string>;

        // 交易推送
        pushTx(rawTx: string): Promise<string>;

        // 事件监听
        on(event: string, callback: (...args: any[]) => void): void;
      };
    };
  }
}

/**
 * OKX钱包适配器
 */
export class OKXAdapter extends BaseWalletAdapter {
  readonly id = 'okx';
  readonly name = 'OKX Wallet';
  readonly icon =
    'https://web3.okx.com/cdn/assets/imgs/254/5678AFAB27871136.png';

  protected getWalletInstance() {
    if (typeof window === 'undefined') return undefined;

    // 多种方式检测 OKX 钱包
    const okxwallet = window.okxwallet;

    if (!okxwallet || !okxwallet.bitcoin) return undefined;

    const wallet = okxwallet.bitcoin;

    // 确保钱包有必要的接口
    if (typeof wallet.connect === 'function' ||
        typeof wallet.requestAccounts === 'function') {
      return wallet;
    }

    return undefined;
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
      'Failed to connect OKX wallet',
      {
        operation: 'connect',
        walletId: this.id,
        suggestion: 'Please ensure OKX wallet is installed and unlocked',
      },
    );
  }

  protected async handleDisconnect(): Promise<void> {
    return this.executeWalletOperation(
      async (wallet) => {
        await wallet.disconnect();
        // OKX 没有提供移除事件监听器的方法
      },
      'Failed to disconnect OKX wallet',
      {
        operation: 'disconnect',
        walletId: this.id,
      },
    );
  }

  protected async handleGetAccounts(): Promise<AccountInfo[]> {
    return this.executeWalletOperation(
      async (wallet) => {
        const addresses = await wallet.getAccounts();
        return this.createAccountInfos(addresses);
      },
      'Failed to get accounts from OKX wallet',
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
      'Failed to get network from OKX wallet',
      {
        operation: 'getNetwork',
        walletId: this.id,
      },
    );
  }

  protected async handleSwitchNetwork(_network: Network): Promise<void> {
    throw WalletErrorHandler.createConnectionError(
      this.id,
      'OKX wallet does not support network switching',
      undefined,
      {
        operation: 'switchNetwork',
        walletId: this.id,
        network: _network,
        suggestion:
          'Network switching is not supported by OKX wallet. Please switch networks manually in the wallet.',
      },
    );
  }

  protected async handleSignMessage(message: string): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.signMessage(message),
      'Failed to sign message with OKX wallet',
      {
        operation: 'signMessage',
        walletId: this.id,
      },
    );
  }

  protected async handleSignPsbt(psbt: string): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.signPsbt(psbt),
      'Failed to sign PSBT with OKX wallet',
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
      'Failed to send bitcoin with OKX wallet',
      {
        operation: 'sendBitcoin',
        walletId: this.id,
        address: toAddress,
      },
    );
  }

  private setupEventListeners(): void {
    if (!window.okxwallet?.bitcoin) return;

    // 监听账户变化
    window.okxwallet.bitcoin.on('accountsChanged', (accounts: string[]) => {
      const accountInfos: AccountInfo[] = accounts.map((address) => ({
        address,
        publicKey: undefined,
        balance: undefined,
        network: this.normalizeNetwork('livenet'),
      }));
      this.updateAccounts(accountInfos);
    });

    // 监听网络变化
    window.okxwallet.bitcoin.on('networkChanged', (network: string) => {
      const normalizedNetwork = this.normalizeNetwork(network);
      this.updateNetwork(normalizedNetwork);
    });
  }

  // 新增的 OKX 特有方法

  /**
   * 请求账户连接
   */
  protected async handleRequestAccounts(): Promise<AccountInfo[]> {
    return this.executeWalletOperation(
      async (wallet) => {
        const addresses = await wallet.requestAccounts();
        const accounts = this.createAccountInfos(addresses);

        // 设置事件监听
        this.setupEventListeners();

        return accounts;
      },
      'Failed to request accounts from OKX wallet',
      {
        operation: 'requestAccounts',
        walletId: this.id,
      },
    );
  }

  /**
   * 获取公钥
   */
  protected async handleGetPublicKey(): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.getPublicKey(),
      'Failed to get public key from OKX wallet',
      {
        operation: 'getPublicKey',
        walletId: this.id,
      },
    );
  }

  /**
   * 获取余额
   */
  protected async handleGetBalance(): Promise<{
    confirmed: number;
    unconfirmed: number;
    total: number;
  }> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.getBalance(),
      'Failed to get balance from OKX wallet',
      {
        operation: 'getBalance',
        walletId: this.id,
      },
    );
  }

  /**
   * 高级签名消息（支持多种签名类型）
   */
  protected async handleSignMessageAdvanced(
    message: string,
    type?: 'ecdsa' | 'bip322-simple',
  ): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.signMessage(message, type),
      'Failed to sign advanced message with OKX wallet',
      {
        operation: 'signMessageAdvanced',
        walletId: this.id,
      },
    );
  }

  /**
   * 发送比特币（支持选项）
   */
  protected async handleSendBitcoinAdvanced(
    toAddress: string,
    amount: number,
    options?: {
      feeRate?: number;
    },
  ): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.sendBitcoin(toAddress, amount, options),
      'Failed to send advanced bitcoin transaction with OKX wallet',
      {
        operation: 'sendBitcoinAdvanced',
        walletId: this.id,
        address: toAddress,
      },
    );
  }

  /**
   * 发送铭文
   */
  protected async handleSendInscription(
    address: string,
    inscriptionId: string,
    options?: {
      feeRate?: number;
    },
  ): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) =>
        await wallet.sendInscription(address, inscriptionId, options),
      'Failed to send inscription with OKX wallet',
      {
        operation: 'sendInscription',
        walletId: this.id,
        address,
      },
    );
  }

  /**
   * 推送交易
   */
  protected async handlePushTx(rawTx: string): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.pushTx(rawTx),
      'Failed to push transaction with OKX wallet',
      {
        operation: 'pushTx',
        walletId: this.id,
      },
    );
  }

  /**
   * 获取铭文列表
   */
  async getInscriptions(
    cursor: number = 0,
    size: number = 20,
  ): Promise<{
    total: number;
    list: Array<{
      inscriptionId: string;
      inscriptionNumber: string;
      address: string;
      outputValue: string;
      contentLength: string;
      contentType: number;
      timestamp: number;
      offset: number;
      output: string;
      genesisTransaction: string;
      location: string;
    }>;
  }> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.getInscriptions(cursor, size),
      'Failed to get inscriptions from OKX wallet',
      {
        operation: 'getInscriptions',
        walletId: this.id,
      },
    );
  }

  /**
   * 使用 send 方法发送交易
   */
  async send(options: {
    from: string;
    to: string;
    value: string;
    satBytes?: string;
    memo?: string;
    memoPos?: number;
  }): Promise<{ txhash: string }> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.send(options),
      'Failed to send transaction with OKX wallet',
      {
        operation: 'send',
        walletId: this.id,
        address: options.to,
      },
    );
  }
}
