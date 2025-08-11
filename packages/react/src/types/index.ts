export type {
  BalanceResult,
  ConnectWalletContext,
  Network,
  NetworkContext,
  SignatureResult,
  ThemeMode,
  TransactionResult,
  WalletModalResult,
} from '@btc-connect/shared';

// 覆盖 React 公开的 WalletContext 类型：将 account 重命名为 address
export interface BalanceDetail {
  confirmed: number;
  unconfirmed: number;
  total: number;
}

export interface WalletContext {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balance: BalanceDetail | null;
  currentWallet: any; // 来自 core 的 WalletInfo
  network: any; // 来自 core 的 Network
  error: Error | null;
}



// 连接策略类型（可选，用于在连接后执行任务）
export interface ConnectionPolicyTaskResult {
  success: boolean;
  data?: unknown;
}

export interface ConnectionPolicyTaskContext {
  manager: any; // BTCWalletManager，但为兼容外部应用，这里不强绑定类型
}

export interface ConnectionPolicyTask {
  id: string;
  required?: boolean;
  interactive?: boolean;
  autoBehavior?: 'run' | 'skip';
  run: (ctx: ConnectionPolicyTaskContext) => Promise<ConnectionPolicyTaskResult>;
}

export interface ConnectionPolicy {
  tasks: ConnectionPolicyTask[];
  emitEventsOnAutoConnect?: boolean;
}
