import { CacheKeyBuilder, CacheManager, type MemoryCache } from '../cache';
import { WalletEventManager } from '../events';
import type {
  AccountInfo,
  BTCWalletAdapter,
  ErrorContext,
  EventHandler,
  Network,
  WalletEvent,
  WalletState,
} from '../types';
import {
  WalletConnectionError,
  WalletDisconnectedError,
  WalletError,
  WalletNotInstalledError,
} from '../types';
import { WalletErrorHandler } from '../utils/error-handler';

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

  // 缓存实例
  protected cacheManager = CacheManager.getInstance();
  protected balanceCache: MemoryCache;
  protected networkCache: MemoryCache;
  protected accountsCache: MemoryCache;
  protected publicKeyCache: MemoryCache;

  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly icon: string;

  constructor() {
    // 初始化不同类型的缓存
    this.balanceCache = this.cacheManager.getCache('balance', {
      ttl: 10000, // 10秒
      maxSize: 100, // 最大100个条目
      enableAutoCleanup: true,
      cleanupInterval: 30000, // 30秒清理一次
    });

    this.networkCache = this.cacheManager.getCache('network', {
      ttl: 60000, // 1分钟
      maxSize: 50,
      enableAutoCleanup: true,
      cleanupInterval: 60000, // 1分钟清理一次
    });

    this.accountsCache = this.cacheManager.getCache('accounts', {
      ttl: 30000, // 30秒
      maxSize: 50,
      enableAutoCleanup: true,
      cleanupInterval: 30000,
    });

    this.publicKeyCache = this.cacheManager.getCache('publicKey', {
      ttl: 30000, // 30秒
      maxSize: 20,
      enableAutoCleanup: true,
      cleanupInterval: 30000,
    });
  }

  /**
   * 获取钱包实例，子类必须实现
   */
  protected abstract getWalletInstance(): any;

  /**
   * 检查钱包是否可用
   */
  protected checkWalletAvailability(): void {
    if (!this.getWalletInstance()) {
      throw new Error(`${this.name} wallet not found`);
    }
  }

  /**
   * 标准化网络字符串
   */
  protected normalizeNetwork(network: string): Network {
    switch (network) {
      case 'livenet':
      case 'mainnet':
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
   * 创建账户信息
   */
  protected createAccountInfo(
    address: string,
    publicKey?: string,
    network?: Network,
  ): AccountInfo {
    return {
      address,
      publicKey,
      balance: undefined,
      network: network || this.normalizeNetwork('livenet'),
    };
  }

  /**
   * 获取当前地址（用于缓存键）
   */
  protected getCurrentAddress(): string | null {
    return this.state.currentAccount?.address || null;
  }

  /**
   * 清除指定类型的缓存
   */
  protected clearCache(
    type: 'balance' | 'network' | 'accounts' | 'publicKey' | 'all',
  ): void {
    switch (type) {
      case 'balance':
        this.balanceCache.clear();
        break;
      case 'network':
        this.networkCache.clear();
        break;
      case 'accounts':
        this.accountsCache.clear();
        break;
      case 'publicKey':
        this.publicKeyCache.clear();
        break;
      case 'all':
        this.balanceCache.clear();
        this.networkCache.clear();
        this.accountsCache.clear();
        this.publicKeyCache.clear();
        break;
    }
  }

  /**
   * 清除与当前账户相关的缓存
   */
  protected clearCurrentAccountCache(): void {
    const currentAddress = this.getCurrentAddress();
    if (!currentAddress) return;

    // 清除余额缓存
    const balanceKey = CacheKeyBuilder.balance(this.id, currentAddress);
    this.balanceCache.delete(balanceKey);

    // 清除公钥缓存
    const publicKeyKey = `publicKey:${this.id}`;
    this.publicKeyCache.delete(publicKeyKey);
  }

  /**
   * 清除钱包所有缓存
   */
  protected clearWalletCache(): void {
    this.clearCache('all');
  }

  /**
   * 批量创建账户信息
   */
  protected createAccountInfos(
    addresses: string[],
    network?: Network,
  ): AccountInfo[] {
    return addresses.map((address) =>
      this.createAccountInfo(address, undefined, network),
    );
  }

  /**
   * 安全执行钱包操作
   */
  protected async executeWalletOperation<T>(
    operation: (wallet: any) => Promise<T>,
    operationName: string,
    context?: Partial<ErrorContext>,
  ): Promise<T> {
    return WalletErrorHandler.safeExecute(
      () => {
        const wallet = this.getWalletInstance();
        this.checkWalletAvailability();
        return operation(wallet);
      },
      (error: Error) =>
        WalletErrorHandler.createConnectionError(
          this.id,
          `${operationName} failed: ${error instanceof Error ? error.message : String(error)}`,
          error,
          {
            operation: operationName,
            ...context,
          },
        ),
      context,
    );
  }

  /**
   * 设置事件监听器的通用逻辑
   */
  protected setupWalletEventListeners(
    eventMap: Record<string, (...args: any[]) => void>,
  ): void {
    const wallet = this.getWalletInstance();
    if (!wallet || !wallet.on) return;

    Object.entries(eventMap).forEach(([event, handler]) => {
      wallet.on(event, handler);
    });
  }

  /**
   * 移除事件监听器的通用逻辑
   */
  protected removeWalletEventListeners(
    eventMap: Record<string, (...args: any[]) => void>,
  ): void {
    const wallet = this.getWalletInstance();
    if (!wallet || !wallet.removeListener) return;

    Object.entries(eventMap).forEach(([event, handler]) => {
      wallet.removeListener(event, handler);
    });
  }

  /**
   * 检查钱包是否可用
   */
  isReady(): boolean {
    return typeof window !== 'undefined' && !!this.getWalletInstance();
  }

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

      this.eventManager.emitConnect(this.id, accounts);
      return accounts;
    } catch (error) {
      this.state.status = 'error';
      this.state.error =
        error instanceof Error ? error : new Error(String(error));
      const walletError =
        error instanceof WalletError
          ? error
          : new WalletError(
              error instanceof Error ? error.message : String(error),
              'UNKNOWN_ERROR',
              {},
              error instanceof Error ? error : undefined,
            );
      this.eventManager.emitError(this.id, walletError);
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

      this.eventManager.emitDisconnect(this.id);
    } catch (error) {
      this.state.status = 'error';
      this.state.error =
        error instanceof Error ? error : new Error(String(error));
      const walletError =
        error instanceof WalletError
          ? error
          : new WalletError(
              error instanceof Error ? error.message : String(error),
              'UNKNOWN_ERROR',
              {},
              error instanceof Error ? error : undefined,
            );
      this.eventManager.emitError(this.id, walletError);
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
      // 尝试从缓存获取
      const publicKeyKey = `publicKey:${this.id}`;
      let publicKey = this.publicKeyCache.get(publicKeyKey);
      if (publicKey) {
        return publicKey;
      }

      // 缓存未命中，调用底层API
      publicKey = await this.handleGetPublicKey();

      // 缓存结果（只缓存有效的公钥）
      if (publicKey && typeof publicKey === 'string' && publicKey.length > 0) {
        this.publicKeyCache.set(publicKeyKey, publicKey);
      }

      return publicKey;
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
      const currentAddress = this.getCurrentAddress();
      if (!currentAddress) {
        return await this.handleGetBalance();
      }

      // 尝试从缓存获取
      const balanceKey = CacheKeyBuilder.balance(this.id, currentAddress);
      let balance = this.balanceCache.get(balanceKey);
      if (balance) {
        return balance;
      }

      // 缓存未命中，调用底层API
      balance = await this.handleGetBalance();

      // 缓存结果（只缓存有效的余额数据）
      if (balance && typeof balance === 'object' && 'total' in balance) {
        this.balanceCache.set(balanceKey, balance);
      }

      return balance;
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
    const networkKey = CacheKeyBuilder.network(this.id);

    // 尝试从缓存获取
    let network = this.networkCache.get(networkKey);
    if (network) {
      this.state.network = network;
      return network;
    }

    // 缓存未命中，调用底层API
    network = await this.handleGetNetwork();
    this.state.network = network;

    // 缓存结果
    this.networkCache.set(networkKey, network);

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

    // 清除网络相关缓存
    const networkKey = CacheKeyBuilder.network(this.id);
    this.networkCache.delete(networkKey);

    // 清除账户缓存（因为不同网络的账户可能不同）
    this.accountsCache.clear();

    // 更新状态中的网络信息
    this.state.network = network;

    // 发射网络变化事件
    this.eventManager.emitNetworkChange(this.id, network);
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
  on<T extends WalletEvent>(event: T, handler: EventHandler<T>): void {
    this.eventManager.on(event, handler);
  }

  /**
   * 移除事件监听器
   */
  off<T extends WalletEvent>(event: T, handler: EventHandler<T>): void {
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

    // 清除当前账户相关的缓存（因为账户发生了变化）
    this.clearCurrentAccountCache();

    // 清除账户缓存
    this.accountsCache.clear();

    this.eventManager.emitAccountChange(this.id, accounts);
  }

  /**
   * 更新网络信息
   */
  protected updateNetwork(network: Network): void {
    this.state.network = network;

    // 清除网络相关缓存
    const networkKey = CacheKeyBuilder.network(this.id);
    this.networkCache.delete(networkKey);

    // 清除账户缓存（因为不同网络的账户可能不同）
    this.accountsCache.clear();

    this.eventManager.emitNetworkChange(this.id, network);
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.eventManager.destroy();

    // 清除所有缓存
    this.clearWalletCache();

    this.state = {
      status: 'disconnected',
      accounts: [],
    };
    this.isConnected = false;
  }
}
