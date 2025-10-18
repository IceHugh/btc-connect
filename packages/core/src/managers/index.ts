import { getAvailableAdapters } from '../adapters';
import { BaseWalletAdapter } from '../adapters/base';
import { WalletEventManager } from '../events';
import type {
  AccountInfo,
  BTCWalletAdapter,
  WalletEvent,
  WalletInfo,
  WalletManager,
  WalletManagerConfig,
  WalletState,
} from '../types';

/**
 * 钱包管理器实现
 */
export class BTCWalletManager implements WalletManager {
  public config: WalletManagerConfig;
  private adapters: Map<string, BTCWalletAdapter> = new Map();
  private currentAdapter: BTCWalletAdapter | null = null;
  private eventManager: WalletEventManager = new WalletEventManager();
  private isDestroyed = false;

  constructor(config: WalletManagerConfig = {}) {
    this.config = { ...config };
  }

  /**
   * 初始化适配器
   */
  public initializeAdapters(): void {
    const availableAdapters = getAvailableAdapters();

    for (const adapter of availableAdapters) {
      this.register(adapter);
    }
  }

  /**
   * 注册适配器
   */
  register(adapter: BTCWalletAdapter): void {
    if (this.isDestroyed) {
      throw new Error('WalletManager has been destroyed');
    }

    const existingAdapter = this.adapters.get(adapter.id);
    if (existingAdapter) {
      // 如果已存在，先销毁旧的适配器
      if (existingAdapter instanceof BaseWalletAdapter) {
        existingAdapter.destroy();
      }
    }

    this.adapters.set(adapter.id, adapter);

    // 监听适配器事件
    this.setupAdapterListeners(adapter);
  }

  /**
   * 注销适配器
   */
  unregister(walletId: string): void {
    const adapter = this.adapters.get(walletId);
    if (adapter) {
      // 如果是当前适配器，先断开连接
      if (this.currentAdapter === adapter) {
        this.disconnect().catch(() => {
          // 忽略断开连接的错误
        });
      }

      // 销毁适配器
      if (adapter instanceof BaseWalletAdapter) {
        adapter.destroy();
      }

      this.adapters.delete(walletId);
    }
  }

  /**
   * 获取适配器
   */
  getAdapter(walletId: string): BTCWalletAdapter | null {
    return this.adapters.get(walletId) || null;
  }

  /**
   * 获取所有适配器
   */
  getAllAdapters(): BTCWalletAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * 获取可用的钱包列表
   */
  getAvailableWallets(): WalletInfo[] {
    console.log('=== getAvailableWallets Debug ===');
    const allAdapters = this.getAllAdapters();
    const availableWallets = allAdapters.filter((adapter) => {
      const isReady = adapter.isReady();
      console.log(`Adapter ${adapter.id}: isReady = ${isReady}`);
      return isReady;
    });

    const walletInfos = availableWallets.map((adapter) => ({
      id: adapter.id,
      name: adapter.name,
      icon: adapter.icon,
    }));

    console.log('Available wallet infos:', walletInfos);
    return walletInfos;
  }

  /**
   * 连接钱包
   */
  async connect(walletId: string): Promise<AccountInfo[]> {
    if (this.isDestroyed) {
      throw new Error('WalletManager has been destroyed');
    }

    const adapter = this.getAdapter(walletId);
    if (!adapter) {
      throw new Error(`Wallet ${walletId} not found`);
    }

    // 如果已经有连接的适配器，先断开
    if (this.currentAdapter && this.currentAdapter !== adapter) {
      await this.disconnect();
    }

    try {
      // 连接钱包（由外层控制超时/交互）
      const accounts = await adapter.connect();

      this.currentAdapter = adapter;

      // 发射连接事件
      this.eventManager.emitConnectLegacy(accounts);

      // 调用状态变化回调
      if (this.config.onStateChange) {
        this.config.onStateChange(this.getState());
      }

      return accounts;
    } catch (error) {
      // 调用错误处理回调
      if (this.config.onError) {
        this.config.onError(
          error instanceof Error ? error : new Error(String(error)),
        );
      }

      // 发射错误事件
      this.eventManager.emitErrorLegacy(
        error instanceof Error ? error : new Error(String(error)),
      );

      throw error;
    }
  }

  /**
   * 采纳已授权会话为已连接（不触发授权弹窗）
   */
  async assumeConnected(walletId: string): Promise<AccountInfo[] | null> {
    const adapter = this.getAdapter(walletId);
    if (!adapter) return null;

    // 如果已经是当前适配器并且有账户，直接返回
    const state = adapter.getState();
    if (this.currentAdapter?.id === walletId && state.accounts.length > 0) {
      return state.accounts;
    }

    try {
      // 尝试静默获取账户
      const accounts = await adapter.getAccounts();
      if (!accounts || accounts.length === 0) return null;

      // 标记为当前适配器并更新为已连接状态
      this.currentAdapter = adapter;

      if (adapter instanceof BaseWalletAdapter) {
        (adapter as any).state = {
          ...(adapter as any).state,
          status: 'connected',
          accounts,
          currentAccount: accounts[0],
        };
        (adapter as any).isConnected = true;
      }

      // 尝试补充只读信息（忽略失败）
      try {
        await adapter.getNetwork();
      } catch {}
      try {
        const pk = await (adapter as any).getPublicKey?.();
        if (pk && (adapter as any).state?.currentAccount) {
          (adapter as any).state.currentAccount.publicKey = pk;
        }
      } catch {}
      try {
        const bal = await (adapter as any).getBalance?.();
        console.log('bal', bal);

        const s = (adapter as any).state;
        if (s?.currentAccount) {
          s.currentAccount.balance = bal;
        }
        if (Array.isArray(s?.accounts) && s.accounts.length > 0) {
          s.accounts[0].balance = bal;
        }
      } catch {}

      this.eventManager.emitConnectLegacy((adapter as any).state.accounts);
      if (this.config.onStateChange) {
        this.config.onStateChange(this.getState());
      }
      return accounts;
    } catch {
      return null;
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (this.currentAdapter) {
      try {
        await this.currentAdapter.disconnect();
      } catch (error) {
        // 忽略断开连接的错误
        console.warn('Error disconnecting wallet:', error);
      } finally {
        this.currentAdapter = null;
        this.eventManager.emitDisconnectLegacy();

        // 调用状态变化回调
        if (this.config.onStateChange) {
          this.config.onStateChange(this.getState());
        }
      }
    }
  }

  /**
   * 切换钱包
   */
  async switchWallet(walletId: string): Promise<AccountInfo[]> {
    return await this.connect(walletId);
  }

  /**
   * 获取当前状态
   */
  getState(): WalletState {
    if (this.currentAdapter) {
      return this.currentAdapter.getState();
    }

    return {
      status: 'disconnected',
      accounts: [],
    };
  }

  /**
   * 获取当前适配器
   */
  getCurrentAdapter(): BTCWalletAdapter | null {
    return this.currentAdapter;
  }

  /**
   * 获取当前钱包
   */
  getCurrentWallet(): WalletInfo | null {
    if (!this.currentAdapter) {
      return null;
    }

    return {
      id: this.currentAdapter.id,
      name: this.currentAdapter.name,
      icon: this.currentAdapter.icon,
    };
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
   * 销毁管理器
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // 断开所有连接
    this.disconnect().catch(() => {
      // 忽略断开连接的错误
    });

    // 销毁所有适配器
    for (const adapter of this.adapters.values()) {
      if (adapter instanceof BaseWalletAdapter) {
        adapter.destroy();
      }
    }

    // 清理适配器映射
    this.adapters.clear();

    // 销毁事件管理器
    this.eventManager.destroy();

    this.currentAdapter = null;
  }

  /**
   * 设置适配器事件监听器
   */
  private setupAdapterListeners(adapter: BTCWalletAdapter): void {
    // 监听适配器的所有事件并转发
    const events: WalletEvent[] = [
      'connect',
      'disconnect',
      'accountChange',
      'networkChange',
      'error',
    ];

    for (const event of events) {
      adapter.on(event, (...args: any[]) => {
        // 如果不是当前适配器，不转发事件
        if (adapter !== this.currentAdapter) return;

        // 转发事件
        this.eventManager.emit(event, ...args);

        // 如果是状态变化事件，调用回调
        if (
          (event === 'accountChange' || event === 'networkChange') &&
          this.config.onStateChange
        ) {
          this.config.onStateChange(this.getState());
        }

        // 如果是错误事件，调用错误处理回调
        if (event === 'error' && this.config.onError) {
          const error = args[0] as Error;
          this.config.onError(error);
        }
      });
    }
  }
}
