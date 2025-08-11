import { type AccountInfo, Network } from '../types';
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
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzE5MTkxOSIvPgo8cGF0aCBkPSJNMTYgOEMxMi42ODYyIDggMTAgMTAuNjg2MiAxMCAxNEMxMCAxNy4zMTM4IDEyLjY4NjIgMjAgMTYgMjBDMTkuMzEzOCAyMCAyMiAxNy4zMTM4IDIyIDE0QzIyIDEwLjY4NjIgMTkuMzEzOCA4IDE2IDhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=';

  isReady(): boolean {
    return typeof window !== 'undefined' && !!window.okxwallet?.bitcoin;
  }

  protected async handleConnect(): Promise<AccountInfo[]> {
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    const account = await window.okxwallet.bitcoin.connect();

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
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    await window.okxwallet.bitcoin.disconnect();
    // OKX 没有提供移除事件监听器的方法
  }

  protected async handleGetAccounts(): Promise<AccountInfo[]> {
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    const addresses = await window.okxwallet.bitcoin.getAccounts();

    // 获取每个地址的公钥
    const accounts: AccountInfo[] = [];
    for (const address of addresses) {
      try {
        // OKX 没有直接提供批量获取公钥的方法，这里使用空字符串
        accounts.push({
          address,
          publicKey: '',
          balance: undefined,
          network: this.normalizeNetwork('livenet'),
        });
      } catch (_error) {
        accounts.push({
          address,
          publicKey: undefined,
          balance: undefined,
          network: this.normalizeNetwork('livenet'),
        });
      }
    }

    return accounts;
  }

  protected async handleGetNetwork(): Promise<Network> {
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    const network = await window.okxwallet.bitcoin.getNetwork();
    return this.normalizeNetwork(network);
  }

  protected async handleSwitchNetwork(_network: Network): Promise<void> {
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    // OKX 钱包可能不支持网络切换，抛出错误
    throw new Error('OKX wallet does not support network switching');
  }

  protected async handleSignMessage(message: string): Promise<string> {
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    return await window.okxwallet.bitcoin.signMessage(message);
  }

  protected async handleSignPsbt(psbt: string): Promise<string> {
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    return await window.okxwallet.bitcoin.signPsbt(psbt);
  }

  protected async handleSendBitcoin(
    toAddress: string,
    amount: number,
  ): Promise<string> {
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    return await window.okxwallet.bitcoin.sendBitcoin(toAddress, amount);
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
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    const addresses = await window.okxwallet.bitcoin.requestAccounts();

    const accounts: AccountInfo[] = addresses.map((address) => ({
      address,
      publicKey: undefined,
      balance: undefined,
      network: this.normalizeNetwork('livenet'),
    }));

    // 设置事件监听
    this.setupEventListeners();

    return accounts;
  }

  /**
   * 获取公钥
   */
  protected async handleGetPublicKey(): Promise<string> {
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    return await window.okxwallet.bitcoin.getPublicKey();
  }

  /**
   * 获取余额
   */
  protected async handleGetBalance(): Promise<{
    confirmed: number;
    unconfirmed: number;
    total: number;
  }> {
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    return await window.okxwallet.bitcoin.getBalance();
  }

  /**
   * 高级签名消息（支持多种签名类型）
   */
  protected async handleSignMessageAdvanced(
    message: string,
    type?: 'ecdsa' | 'bip322-simple',
  ): Promise<string> {
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    return await window.okxwallet.bitcoin.signMessage(message, type);
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
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    return await window.okxwallet.bitcoin.sendBitcoin(
      toAddress,
      amount,
      options,
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
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    return await window.okxwallet.bitcoin.sendInscription(
      address,
      inscriptionId,
      options,
    );
  }

  /**
   * 推送交易
   */
  protected async handlePushTx(rawTx: string): Promise<string> {
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    return await window.okxwallet.bitcoin.pushTx(rawTx);
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
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    return await window.okxwallet.bitcoin.getInscriptions(cursor, size);
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
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX wallet not found');
    }

    return await window.okxwallet.bitcoin.send(options);
  }

  /**
   * 将OKX网络字符串转换为Network枚举
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
}
