import { WalletEventManager } from '../events';
import type { AccountInfo, BTCWalletAdapter, Network, WalletEvent, WalletState } from '../types';
import {
  WalletConnectionError,
  WalletDisconnectedError,
  WalletNotInstalledError,
} from '../types';

/**
 * 钱包适配器基类
 */
export abstract class BaseWalletAdapter implements BTCWalletAdapter {
  protected eventManager: WalletEventManager = new WalletEventManager();
  protected state: WalletState = {
    status: 'disconnected',
    accounts: [],
  };
  protected isConnected = false;

  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly icon: string;

  /**
   * 检查钱包是否可用
   */
  abstract isReady(): boolean;

  /**
   * 获取当前状态
   */
  getState(): WalletState {
    return { ...this.state };
  }

  /**
   * 连接钱包
   */
  async connect(): Promise<AccountInfo[]> {
    if (this.isConnected) {
      return this.state.accounts;
    }

    if (!this.isReady()) {
      throw new WalletNotInstalledError(this.id);
    }

    try {
      this.state.status = 'connecting';
      const accounts = await this.handleConnect();

      this.state.status = 'connected';
      this.state.accounts = accounts;
      this.state.currentAccount = accounts[0];
      this.isConnected = true;

      this.eventManager.emitConnect(accounts);
      return accounts;
    } catch (error) {
      this.state.status = 'error';
      this.state.error =
        error instanceof Error ? error : new Error(String(error));
      this.eventManager.emitError(this.state.error);
      throw new WalletConnectionError(
        this.id,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.handleDisconnect();

      this.state.status = 'disconnected';
      this.state.accounts = [];
      this.state.currentAccount = undefined;
      this.state.network = undefined;
      this.isConnected = false;

      this.eventManager.emitDisconnect();
    } catch (error) {
      this.state.status = 'error';
      this.state.error =
        error instanceof Error ? error : new Error(String(error));
      this.eventManager.emitError(this.state.error);
      throw new WalletDisconnectedError(this.id);
    }
  }

  /**
   * 获取账户列表
   */
  async getAccounts(): Promise<AccountInfo[]> {
    // 放开静默探测：未连接也允许调用底层 API 获取账户
    return await this.handleGetAccounts();
  }

  /**
   * 请求连接账户 - 类似于 MetaMask 的 requestAccounts
   */
  async requestAccounts(): Promise<AccountInfo[]> {
    if (!this.isReady()) {
      throw new WalletNotInstalledError(this.id);
    }

    if (this.handleRequestAccounts) {
      return await this.handleRequestAccounts();
    }

    // 如果没有实现 requestAccounts，则使用 connect 方法
    return await this.connect();
  }

  /**
   * 获取公钥
   */
  async getPublicKey(): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }

    if (this.handleGetPublicKey) {
      return await this.handleGetPublicKey();
    }

    throw new Error(`${this.name} does not support getPublicKey`);
  }

  /**
   * 获取余额
   */
  async getBalance(): Promise<any> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }

    if (this.handleGetBalance) {
      return await this.handleGetBalance();
    }

    throw new Error(`${this.name} does not support getBalance`);
  }

  /**
   * 高级签名消息（支持多种签名类型）
   */
  async signMessageAdvanced(message: string, type?: string): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }

    if (this.handleSignMessageAdvanced) {
      return await this.handleSignMessageAdvanced(message, type);
    }

    // 回退到基础签名方法
    return await this.signMessage(message);
  }

  /**
   * 发送比特币（支持选项）
   */
  async sendBitcoinAdvanced(
    toAddress: string,
    amount: number,
    options?: any,
  ): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }

    if (this.handleSendBitcoinAdvanced) {
      return await this.handleSendBitcoinAdvanced(toAddress, amount, options);
    }

    // 回退到基础发送方法
    return await this.sendBitcoin(toAddress, amount);
  }

  /**
   * 发送铭文
   */
  async sendInscription(
    address: string,
    inscriptionId: string,
    options?: any,
  ): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }

    if (this.handleSendInscription) {
      return await this.handleSendInscription(address, inscriptionId, options);
    }

    throw new Error(`${this.name} does not support sendInscription`);
  }

  /**
   * 推送交易
   */
  async pushTx(rawTx: string): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }

    if (this.handlePushTx) {
      return await this.handlePushTx(rawTx);
    }

    throw new Error(`${this.name} does not support pushTx`);
  }

  /**
   * 获取当前账户
   */
  async getCurrentAccount(): Promise<AccountInfo | null> {
    if (!this.isConnected) {
      return null;
    }
    return this.state.currentAccount || null;
  }

  /**
   * 获取网络信息
   */
  async getNetwork(): Promise<Network> {
    // 放开静默探测：未连接也允许调用底层 API 获取网络
    const network = await this.handleGetNetwork();
    this.state.network = network;
    return network;
  }

  /**
   * 切换网络
   */
  async switchNetwork(network: Network): Promise<void> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }
    await this.handleSwitchNetwork(network);
  }

  /**
   * 签名消息
   */
  async signMessage(message: string): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }
    return await this.handleSignMessage(message);
  }

  /**
   * 签名PSBT
   */
  async signPsbt(psbt: string): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }
    return await this.handleSignPsbt(psbt);
  }

  /**
   * 发送比特币
   */
  async sendBitcoin(toAddress: string, amount: number): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }
    return await this.handleSendBitcoin(toAddress, amount);
  }

  /**
   * 添加事件监听器
   */
  on(event: WalletEvent, handler: (...args: any[]) => void): void {
    this.eventManager.on(event, handler);
  }

  /**
   * 移除事件监听器
   */
  off(event: WalletEvent, handler: (...args: any[]) => void): void {
    this.eventManager.off(event, handler);
  }

  /**
   * 子类需要实现的抽象方法
   */
  protected abstract handleConnect(): Promise<AccountInfo[]>;
  protected abstract handleDisconnect(): Promise<void>;
  protected abstract handleGetAccounts(): Promise<AccountInfo[]>;
  protected abstract handleGetNetwork(): Promise<Network>;
  protected abstract handleSwitchNetwork(network: Network): Promise<void>;
  protected abstract handleSignMessage(message: string): Promise<string>;
  protected abstract handleSignPsbt(psbt: string): Promise<string>;
  protected abstract handleSendBitcoin(
    toAddress: string,
    amount: number,
  ): Promise<string>;

  /**
   * 可选的高级方法 - 子类可以根据需要实现
   */
  protected handleRequestAccounts?(): Promise<AccountInfo[]>;
  protected handleGetPublicKey?(): Promise<string>;
  protected handleGetBalance?(): Promise<any>;
  protected handleSignMessageAdvanced?(
    message: string,
    type?: string,
  ): Promise<string>;
  protected handleSendBitcoinAdvanced?(
    toAddress: string,
    amount: number,
    options?: any,
  ): Promise<string>;
  protected handleSendInscription?(
    address: string,
    inscriptionId: string,
    options?: any,
  ): Promise<string>;
  protected handlePushTx?(rawTx: string): Promise<string>;

  /**
   * 更新账户信息
   */
  protected updateAccounts(accounts: AccountInfo[]): void {
    this.state.accounts = accounts;
    this.state.currentAccount = accounts[0] || undefined;
    this.eventManager.emitAccountChange(accounts);
  }

  /**
   * 更新网络信息
   */
  protected updateNetwork(network: Network): void {
    this.state.network = network;
    this.eventManager.emitNetworkChange(network);
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.eventManager.destroy();
    this.state = {
      status: 'disconnected',
      accounts: [],
    };
    this.isConnected = false;
  }
}
