export type { BalanceResult, ConnectWalletContext, Network, NetworkContext, SignatureResult, ThemeMode, TransactionResult, WalletModalResult } from '@btc-connect/shared'

export interface BalanceDetail { confirmed: number; unconfirmed: number; total: number }

export interface WalletContextSimplified {
  isConnected: boolean
  isConnecting: boolean
  address: string | null
  balance: BalanceDetail | null
  currentWallet: any
  network: any
  error: Error | null
}

export interface ConnectionPolicyTaskResult { success: boolean; data?: unknown }
export interface ConnectionPolicyTaskContext { manager: any }
export interface ConnectionPolicyTask {
  id: string
  required?: boolean
  interactive?: boolean
  autoBehavior?: 'run' | 'skip'
  run: (ctx: ConnectionPolicyTaskContext) => Promise<ConnectionPolicyTaskResult>
}
export interface ConnectionPolicy { tasks: ConnectionPolicyTask[]; emitEventsOnAutoConnect?: boolean }



