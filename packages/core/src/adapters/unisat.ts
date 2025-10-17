import type {
  AccountInfo,
  UniSatBalance,
  UniSatChainInfo,
  UniSatInscriptionsResponse,
  UniSatSendBitcoinOptions,
  UniSatSendInscriptionOptions,
  UniSatSendRunesOptions,
  UniSatSignPsbtOptions,
  UniSatWalletAdapter,
  Network,
} from '../types';
import { BaseWalletAdapter } from './base';

declare global {
  interface Window {
    unisat?: {
      // 基础方法
      requestAccounts(): Promise<string[]>;
      getAccounts(): Promise<string[]>;
      connect(): Promise<string[]>;
      disconnect(): Promise<void>;

      // 网络管理
      getNetwork(): Promise<string>;
      switchNetwork(network: string): Promise<void>;
      getChain(): Promise<{
        enum: string;
        name: string;
        network: string;
      }>;
      switchChain(chain: string): Promise<{
        enum: string;
        name: string;
        network: string;
      }>;

      // 账户信息
      getPublicKey(): Promise<string>;
      getBalance(): Promise<{
        confirmed: number;
        unconfirmed: number;
        total: number;
      }>;

      // Inscriptions
      getInscriptions(
        cursor: number,
        size: number,
      ): Promise<{
        total: number;
        list: Array<{
          inscriptionId: string;
          inscriptionNumber: string;
          address: string;
          outputValue: string;
          content: string;
          contentLength: string;
          contentType: string;
          preview: string;
          timestamp: number;
          offset: number;
          genesisTransaction: string;
          location: string;
          output: string;
        }>;
      }>;

      // 交易相关
      sendBitcoin(
        toAddress: string,
        satoshis: number,
        options?: {
          feeRate?: number;
          memo?: string;
          memos?: string[];
        },
      ): Promise<string>;

      // Runes
      sendRunes(
        address: string,
        runeid: string,
        amount: string,
        options?: {
          feeRate?: number;
        },
      ): Promise<{ txid: string }>;

      // Inscription 转账
      sendInscription(
        address: string,
        inscriptionId: string,
        options?: {
          feeRate?: number;
        },
      ): Promise<{ txid: string }>;

      // BRC-20
      inscribeTransfer(ticker: string, amount: string): Promise<void>;

      // 签名相关
      signMessage(
        msg: string,
        type?: 'ecdsa' | 'bip322-simple',
      ): Promise<string>;

      // PSBT 相关
      signPsbt(
        psbtHex: string,
        options?: {
          autoFinalized?: boolean;
          toSignInputs?: Array<{
            index: number;
            address?: string;
            publicKey?: string;
            sighashTypes?: number[];
            disableTweakSigner?: boolean;
            useTweakedSigner?: boolean;
          }>;
        },
      ): Promise<string>;

      signPsbts(
        psbtHexs: string[],
        options?: {
          autoFinalized?: boolean;
          toSignInputs?: Array<{
            index: number;
            address?: string;
            publicKey?: string;
            sighashTypes?: number[];
            useTweakedSigner?: boolean;
          }>;
        },
      ): Promise<string[]>;

      pushPsbt(psbtHex: string): Promise<string>;
      pushTx(options: { rawtx: string }): Promise<string>;

      // 事件监听
      on(event: string, callback: (...args: any[]) => void): void;
      removeListener(event: string, callback: (...args: any[]) => void): void;
    };
  }
}

/**
 * UniSat钱包适配器 - 完整实现所有 Unisat API
 */
export class UniSatAdapter
  extends BaseWalletAdapter
  implements UniSatWalletAdapter {
  readonly id = 'unisat';
  readonly name = 'UniSat Wallet';
  readonly icon =
    'https://next-cdn.unisat.io/_/2025-v1242/logo/color.svg';

  isReady(): boolean {
    return typeof window !== 'undefined' && !!window.unisat;
  }

  protected async handleConnect(): Promise<AccountInfo[]> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }

    const addresses = await window.unisat.requestAccounts();

    const accounts: AccountInfo[] = addresses.map((address) => ({
      address,
      publicKey: undefined, // UniSat doesn't provide public key directly
      balance: undefined,
      network: this.normalizeNetwork('livenet'),
    }));

    // 设置事件监听
    this.setupEventListeners();

    return accounts;
  }

  protected async handleDisconnect(): Promise<void> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }

    await window.unisat.disconnect();
    this.removeEventListeners();
  }

  protected async handleGetAccounts(): Promise<AccountInfo[]> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }

    const addresses = await window.unisat.getAccounts();
    return addresses.map((address) => ({
      address,
      publicKey: undefined,
      balance: undefined,
      network: this.normalizeNetwork('livenet'),
    }));
  }

  protected async handleGetNetwork(): Promise<Network> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }

    const network = await window.unisat.getNetwork();
    return this.normalizeNetwork(network);
  }

  protected async handleSwitchNetwork(network: Network): Promise<void> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }

    const unisatNetwork = this.convertToUnisatNetwork(network);
    await window.unisat.switchNetwork(unisatNetwork);
  }

  protected async handleSignMessage(message: string): Promise<string> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }

    return await window.unisat.signMessage(message);
  }

  protected async handleSignPsbt(psbt: string): Promise<string> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }

    return await window.unisat.signPsbt(psbt);
  }

  protected async handleSendBitcoin(
    toAddress: string,
    amount: number,
  ): Promise<string> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }

    return await window.unisat.sendBitcoin(toAddress, amount);
  }

  private setupEventListeners(): void {
    if (!window.unisat) return;

    // 监听账户变化
    window.unisat.on('accountsChanged', this.handleAccountsChanged);

    // 监听网络变化
    window.unisat.on('networkChanged', this.handleNetworkChanged);
  }

  private removeEventListeners(): void {
    if (!window.unisat) return;

    // 清理所有事件监听器
    window.unisat.removeListener('accountsChanged', this.handleAccountsChanged);
    window.unisat.removeListener('networkChanged', this.handleNetworkChanged);
  }

  private handleAccountsChanged = (accounts: string[]) => {
    const accountInfos: AccountInfo[] = accounts.map((address) => ({
      address,
      publicKey: undefined,
      balance: undefined,
      network: this.normalizeNetwork('livenet'),
    }));
    this.updateAccounts(accountInfos);
  };

  private handleNetworkChanged = (network: string) => {
    const normalizedNetwork = this.normalizeNetwork(network);
    this.updateNetwork(normalizedNetwork);
  };

  /**
   * 将UniSat网络字符串转换为Network枚举
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
   * 将Network枚举转换为UniSat网络字符串
   */
  private convertToUnisatNetwork(network: Network): string {
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

  // 新增的 UniSat API 方法

  /**
   * 获取公钥
   */
  async getPublicKey(): Promise<string> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }
    return await window.unisat.getPublicKey();
  }

  /**
   * 获取余额
   */
  async getBalance(): Promise<UniSatBalance> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }
    return await window.unisat.getBalance();
  }

  /**
   * 获取 Inscriptions
   */
  async getInscriptions(
    cursor: number = 0,
    size: number = 10,
  ): Promise<UniSatInscriptionsResponse> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }
    return await window.unisat.getInscriptions(cursor, size);
  }

  /**
   * 获取链信息
   */
  async getChain(): Promise<UniSatChainInfo> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }
    return await window.unisat.getChain();
  }

  /**
   * 切换链
   */
  async switchChain(chain: string): Promise<UniSatChainInfo> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }
    return await window.unisat.switchChain(chain);
  }

  /**
   * 发送 Runes
   */
  async sendRunes(
    address: string,
    runeid: string,
    amount: string,
    options?: UniSatSendRunesOptions,
  ): Promise<{ txid: string }> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }
    return await window.unisat.sendRunes(address, runeid, amount, options);
  }

  /**
   * 发送 Inscription
   */
  async sendInscription(
    address: string,
    inscriptionId: string,
    options?: UniSatSendInscriptionOptions,
  ): Promise<string> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }
    const result = await window.unisat.sendInscription(
      address,
      inscriptionId,
      options,
    );
    return result.txid;
  }

  /**
   * 铭刻 BRC-20 Transfer
   */
  async inscribeTransfer(ticker: string, amount: string): Promise<void> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }
    return await window.unisat.inscribeTransfer(ticker, amount);
  }

  /**
   * 签名 PSBT（高级版本）
   */
  async signPsbtAdvanced(
    psbtHex: string,
    options?: UniSatSignPsbtOptions,
  ): Promise<string> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }
    return await window.unisat.signPsbt(psbtHex, options);
  }

  /**
   * 批量签名 PSBT
   */
  async signPsbts(
    psbtHexs: string[],
    options?: UniSatSignPsbtOptions,
  ): Promise<string[]> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }
    return await window.unisat.signPsbts(psbtHexs, options);
  }

  /**
   * 推送 PSBT
   */
  async pushPsbt(psbtHex: string): Promise<string> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }
    return await window.unisat.pushPsbt(psbtHex);
  }

  /**
   * 推送原始交易
   */
  async pushTx(rawtx: string): Promise<string> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }
    return await window.unisat.pushTx({ rawtx });
  }

  /**
   * 签名消息（支持多种签名类型）
   */
  async signMessageAdvanced(
    message: string,
    type?: 'ecdsa' | 'bip322-simple',
  ): Promise<string> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }
    return await window.unisat.signMessage(message, type);
  }

  /**
   * 发送比特币（支持选项）
   */
  async sendBitcoinAdvanced(
    toAddress: string,
    satoshis: number,
    options?: UniSatSendBitcoinOptions,
  ): Promise<string> {
    if (!window.unisat) {
      throw new Error('UniSat wallet not found');
    }
    return await window.unisat.sendBitcoin(toAddress, satoshis, options);
  }
}
