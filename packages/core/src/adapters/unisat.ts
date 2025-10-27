import type {
  AccountInfo,
  Network,
  UniSatBalance,
  UniSatChainInfo,
  UniSatInscriptionsResponse,
  UniSatSendBitcoinOptions,
  UniSatSendInscriptionOptions,
  UniSatSendRunesOptions,
  UniSatSignPsbtOptions,
  UniSatWalletAdapter,
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
  implements UniSatWalletAdapter
{
  readonly id = 'unisat';
  readonly name = 'UniSat Wallet';
  readonly icon = 'https://next-cdn.unisat.io/_/2025-v1242/logo/color.svg';

  protected getWalletInstance() {
    if (typeof window === 'undefined') return undefined;

    // 多种方式检测 UniSat 钱包
    const wallet = window.unisat;

    if (!wallet) return undefined;

    // 确保钱包有必要的接口
    if (
      typeof wallet.requestAccounts === 'function' ||
      typeof wallet.connect === 'function'
    ) {
      return wallet;
    }

    return undefined;
  }

  protected async handleConnect(): Promise<AccountInfo[]> {
    return this.executeWalletOperation(
      async (wallet) => {
        const addresses = await wallet.requestAccounts();

        const accounts = this.createAccountInfos(addresses);

        // 设置事件监听
        this.setupEventListeners();

        return accounts;
      },
      'Failed to connect UniSat wallet',
      {
        operation: 'connect',
        walletId: this.id,
        suggestion: 'Please ensure UniSat wallet is installed and unlocked',
      },
    );
  }

  protected async handleDisconnect(): Promise<void> {
    return this.executeWalletOperation(
      async (wallet) => {
        await wallet.disconnect();
        this.removeEventListeners();
      },
      'Failed to disconnect UniSat wallet',
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
        return addresses.map((address: string) =>
          this.createAccountInfo(address),
        );
      },
      'Failed to get accounts from UniSat wallet',
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
      'Failed to get network from UniSat wallet',
      {
        operation: 'getNetwork',
        walletId: this.id,
      },
    );
  }

  protected async handleSwitchNetwork(network: Network): Promise<void> {
    return this.executeWalletOperation(
      async (wallet) => {
        const unisatNetwork = this.convertToUnisatNetwork(network);
        await wallet.switchNetwork(unisatNetwork);
      },
      'Failed to switch network in UniSat wallet',
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
      'Failed to sign message with UniSat wallet',
      {
        operation: 'signMessage',
        walletId: this.id,
      },
    );
  }

  protected async handleSignPsbt(psbt: string): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.signPsbt(psbt),
      'Failed to sign PSBT with UniSat wallet',
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
      'Failed to send bitcoin with UniSat wallet',
      {
        operation: 'sendBitcoin',
        walletId: this.id,
        address: toAddress,
      },
    );
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
      network: this.state.network || this.normalizeNetwork('livenet'),
    }));

    // 更新内部状态
    this.updateAccounts(accountInfos);

    // 发射核心事件系统的事件（包含钱包ID）
    this.eventManager.emitAccountChange(this.id, accountInfos);
  };

  private handleNetworkChanged = (network: string) => {
    const normalizedNetwork = this.normalizeNetwork(network);

    // 更新内部状态
    this.updateNetwork(normalizedNetwork);

    // 发射核心事件系统的事件（包含钱包ID）
    this.eventManager.emitNetworkChange(this.id, normalizedNetwork);
  };

  /**
   * 将UniSat网络字符串转换为Network枚举
   */
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
    return this.executeWalletOperation(
      async (wallet) => await wallet.getPublicKey(),
      'Failed to get public key from UniSat wallet',
      {
        operation: 'getPublicKey',
        walletId: this.id,
      },
    );
  }

  /**
   * 获取余额
   */
  async getBalance(): Promise<UniSatBalance> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.getBalance(),
      'Failed to get balance from UniSat wallet',
      {
        operation: 'getBalance',
        walletId: this.id,
      },
    );
  }

  /**
   * 获取 Inscriptions
   */
  async getInscriptions(
    cursor: number = 0,
    size: number = 10,
  ): Promise<UniSatInscriptionsResponse> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.getInscriptions(cursor, size),
      'Failed to get inscriptions from UniSat wallet',
      {
        operation: 'getInscriptions',
        walletId: this.id,
      },
    );
  }

  /**
   * 获取链信息
   */
  async getChain(): Promise<UniSatChainInfo> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.getChain(),
      'Failed to get chain info from UniSat wallet',
      {
        operation: 'getChain',
        walletId: this.id,
      },
    );
  }

  /**
   * 切换链
   */
  async switchChain(chain: string): Promise<UniSatChainInfo> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.switchChain(chain),
      'Failed to switch chain in UniSat wallet',
      {
        operation: 'switchChain',
        walletId: this.id,
      },
    );
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
    return this.executeWalletOperation(
      async (wallet) =>
        await wallet.sendRunes(address, runeid, amount, options),
      'Failed to send runes with UniSat wallet',
      {
        operation: 'sendRunes',
        walletId: this.id,
        address,
      },
    );
  }

  /**
   * 发送 Inscription
   */
  async sendInscription(
    address: string,
    inscriptionId: string,
    options?: UniSatSendInscriptionOptions,
  ): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => {
        const result = await wallet.sendInscription(
          address,
          inscriptionId,
          options,
        );
        return result.txid;
      },
      'Failed to send inscription with UniSat wallet',
      {
        operation: 'sendInscription',
        walletId: this.id,
        address,
      },
    );
  }

  /**
   * 铭刻 BRC-20 Transfer
   */
  async inscribeTransfer(ticker: string, amount: string): Promise<void> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.inscribeTransfer(ticker, amount),
      'Failed to inscribe transfer with UniSat wallet',
      {
        operation: 'inscribeTransfer',
        walletId: this.id,
      },
    );
  }

  /**
   * 签名 PSBT（高级版本）
   */
  async signPsbtAdvanced(
    psbtHex: string,
    options?: UniSatSignPsbtOptions,
  ): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.signPsbt(psbtHex, options),
      'Failed to sign advanced PSBT with UniSat wallet',
      {
        operation: 'signPsbtAdvanced',
        walletId: this.id,
      },
    );
  }

  /**
   * 批量签名 PSBT
   */
  async signPsbts(
    psbtHexs: string[],
    options?: UniSatSignPsbtOptions,
  ): Promise<string[]> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.signPsbts(psbtHexs, options),
      'Failed to sign multiple PSBTs with UniSat wallet',
      {
        operation: 'signPsbts',
        walletId: this.id,
      },
    );
  }

  /**
   * 推送 PSBT
   */
  async pushPsbt(psbtHex: string): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.pushPsbt(psbtHex),
      'Failed to push PSBT with UniSat wallet',
      {
        operation: 'pushPsbt',
        walletId: this.id,
      },
    );
  }

  /**
   * 推送原始交易
   */
  async pushTx(rawtx: string): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.pushTx({ rawtx }),
      'Failed to push transaction with UniSat wallet',
      {
        operation: 'pushTx',
        walletId: this.id,
      },
    );
  }

  /**
   * 签名消息（支持多种签名类型）
   */
  async signMessageAdvanced(
    message: string,
    type?: 'ecdsa' | 'bip322-simple',
  ): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.signMessage(message, type),
      'Failed to sign advanced message with UniSat wallet',
      {
        operation: 'signMessageAdvanced',
        walletId: this.id,
      },
    );
  }

  /**
   * 发送比特币（支持选项）
   */
  async sendBitcoinAdvanced(
    toAddress: string,
    satoshis: number,
    options?: UniSatSendBitcoinOptions,
  ): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.sendBitcoin(toAddress, satoshis, options),
      'Failed to send advanced bitcoin transaction with UniSat wallet',
      {
        operation: 'sendBitcoinAdvanced',
        walletId: this.id,
        address: toAddress,
      },
    );
  }
}
