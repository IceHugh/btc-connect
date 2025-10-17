// 主题模式类型
export type ThemeMode = 'light' | 'dark';

// 网络类型
export type Network = 'livenet' | 'testnet' | 'regtest' | 'mainnet';


// 余额详情类型
export interface BalanceDetail {
  confirmed: number;
  unconfirmed: number;
  total: number;
}

// React 钱包上下文类型
export interface WalletContext {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balance: BalanceDetail | null;
  currentWallet: any; // 来自 core 的 WalletInfo
  network: any; // 来自 core 的 Network
  error: Error | null;
}

// 连接策略任务结果类型
export interface ConnectionPolicyTaskResult {
  success: boolean;
  data?: unknown;
}

// 连接策略任务上下文类型
export interface ConnectionPolicyTaskContext {
  manager: any; // BTCWalletManager，但为兼容外部应用，这里不强绑定类型
}

// 连接策略任务类型
export interface ConnectionPolicyTask {
  id: string;
  required?: boolean;
  interactive?: boolean;
  autoBehavior?: 'run' | 'skip';
  run: (ctx: ConnectionPolicyTaskContext) => Promise<ConnectionPolicyTaskResult>;
}

// 连接策略类型
export interface ConnectionPolicy {
  tasks: ConnectionPolicyTask[];
  emitEventsOnAutoConnect?: boolean;
}