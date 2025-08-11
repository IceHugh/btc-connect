import { inject, provide, reactive, type App, type InjectionKey, type Plugin } from 'vue'
import type { AccountInfo, WalletInfo, WalletManagerConfig, WalletState, WalletEvent } from '@btc-connect/core'
import { BTCWalletManager } from '@btc-connect/core'
import { storage } from '@btc-connect/shared'

export interface ConnectionPolicyTaskResult { success: boolean }
export interface ConnectionPolicyTaskContext { manager: BTCWalletManager }
export interface ConnectionPolicyTask {
  run: (ctx: ConnectionPolicyTaskContext) => Promise<ConnectionPolicyTaskResult>
  required?: boolean
  autoBehavior?: 'run' | 'skip'
}
export interface ConnectionPolicy {
  emitEventsOnAutoConnect?: boolean
  tasks: ConnectionPolicyTask[]
}

export interface WalletContextValue {
  state: WalletState
  currentWallet: WalletInfo | null
  availableWallets: WalletInfo[]
  isConnected: boolean
  isConnecting: boolean
  connect: (walletId: string) => Promise<AccountInfo[]>
  disconnect: () => Promise<void>
  switchWallet: (walletId: string) => Promise<AccountInfo[]>
  manager: BTCWalletManager
}

const WalletContextKey: InjectionKey<WalletContextValue> = Symbol('BTCWalletContext')

export interface CreateWalletProviderOptions {
  app?: App
  config?: WalletManagerConfig
  autoConnect?: boolean
  connectTimeout?: number
  connectionPolicy?: ConnectionPolicy
}

export function createWalletProvider(options: CreateWalletProviderOptions = {}) {
  const {
    config,
    autoConnect = false,
    connectTimeout = 5000,
    connectionPolicy,
  } = options

  const manager = new BTCWalletManager(config)
  const stateObj = reactive({
    state: manager.getState() as WalletState,
    currentWallet: manager.getCurrentWallet() as WalletInfo | null,
    availableWallets: manager.getAvailableWallets() as WalletInfo[],
    isConnecting: false,
    isPolicyRunning: false,
  })

  const STORAGE_KEY_LAST_WALLET = 'btc-connect:last-wallet-id'

  const updateState = () => {
    stateObj.state = manager.getState()
    stateObj.currentWallet = manager.getCurrentWallet()
    stateObj.availableWallets = manager.getAvailableWallets()
  }

  if (config?.onStateChange) {
    const original = config.onStateChange
    manager.config.onStateChange = (newState: WalletState) => {
      updateState()
      original?.(newState)
    }
  } else {
    manager.config.onStateChange = updateState
  }

  const connect = async (walletId: string): Promise<AccountInfo[]> => {
    stateObj.isConnecting = true
    try {
      const connectedAccounts = await manager.connect(walletId)

      if (connectionPolicy?.tasks?.length) {
        stateObj.isPolicyRunning = true
        let hasFatalError = false
        try {
          for (const task of connectionPolicy.tasks) {
            try {
              const result = await task.run({ manager })
              const failed = !result.success
              if (failed && (task.required !== false)) {
                hasFatalError = true
                break
              }
            } catch {
              if (task.required !== false) {
                hasFatalError = true
                break
              }
            }
          }
        } finally {
          stateObj.isPolicyRunning = false
        }

        if (hasFatalError) {
          try { await manager.disconnect() } catch {}
          throw new Error('Connection policy failed')
        }
      }

      // enrich info similar to react implementation
      try {
        const adapter: any = manager.getCurrentAdapter()
        if (adapter) {
          try { await adapter.getNetwork?.() } catch {}
          try {
            const pk = await adapter.getPublicKey?.()
            if (pk && adapter.state?.currentAccount) {
              adapter.state.currentAccount.publicKey = pk
            }
          } catch {}
          try {
            const bal = await adapter.getBalance?.()
            if (bal && typeof bal === 'object') {
              const detail =
                typeof bal.confirmed === 'number' &&
                typeof bal.unconfirmed === 'number' &&
                typeof bal.total === 'number'
                  ? { confirmed: bal.confirmed, unconfirmed: bal.unconfirmed, total: bal.total }
                  : null
              if (detail) {
                const s = adapter.state
                if (s?.currentAccount) s.currentAccount.balance = detail
                if (Array.isArray(s?.accounts) && s.accounts.length > 0) s.accounts[0].balance = detail
              }
            }
          } catch {}
          updateState()
        }
      } catch {}

      storage.set(STORAGE_KEY_LAST_WALLET, walletId)
      return connectedAccounts
    } finally {
      stateObj.isConnecting = false
    }
  }

  const disconnect = async (): Promise<void> => {
    stateObj.isConnecting = true
    try {
      await manager.disconnect()
      storage.remove(STORAGE_KEY_LAST_WALLET)
    } finally {
      stateObj.isConnecting = false
    }
  }

  const switchWallet = async (walletId: string): Promise<AccountInfo[]> => {
    stateObj.isConnecting = true
    try {
      const accounts = await manager.switchWallet(walletId)
      storage.set(STORAGE_KEY_LAST_WALLET, walletId)
      return accounts
    } finally {
      stateObj.isConnecting = false
    }
  }

  // Auto connect
  if (autoConnect) {
    const lastWalletId = storage.get<string>(STORAGE_KEY_LAST_WALLET)
    if (lastWalletId) {
      const withTimeout = <T,>(p: Promise<T>, ms: number) =>
        new Promise<T>((resolve, reject) => {
          const t = setTimeout(() => reject(new Error('autoConnect timeout')), ms)
          p.then((v) => { clearTimeout(t); resolve(v) }).catch((e) => { clearTimeout(t); reject(e) })
        })

      ;(async () => {
        try {
          const result = await withTimeout((manager as any).assumeConnected(lastWalletId), connectTimeout)
          if (!result) {
            // ignore
          } else {
            updateState()
            if (connectionPolicy?.emitEventsOnAutoConnect && connectionPolicy.tasks?.length) {
              stateObj.isPolicyRunning = true
              let hasFatalError = false
              try {
                for (const task of connectionPolicy.tasks) {
                  if (task.autoBehavior !== 'run') continue
                  try {
                    const r = await task.run({ manager })
                    const failed = !r.success
                    if (failed && (task.required !== false)) { hasFatalError = true; break }
                  } catch {
                    if (task.required !== false) { hasFatalError = true; break }
                  }
                }
              } finally {
                stateObj.isPolicyRunning = false
              }
              if (hasFatalError) {
                try { await manager.disconnect() } catch {}
              } else {
                storage.set(STORAGE_KEY_LAST_WALLET, lastWalletId)
              }
            }
          }
        } catch {
          // timeout or fail ignored
        }
      })()
    }
  }

  const exposed = {
    get state(): WalletState { return stateObj.isPolicyRunning ? { status: 'connecting', accounts: [] } as WalletState : stateObj.state },
    get currentWallet() { return stateObj.currentWallet },
    get availableWallets() { return stateObj.availableWallets },
    get isConnected() { return (this.state.status === 'connected') },
    get isConnecting() { return stateObj.isConnecting || stateObj.isPolicyRunning || this.state.status === 'connecting' },
    connect,
    disconnect,
    switchWallet,
    manager,
  } satisfies WalletContextValue

  provide(WalletContextKey, exposed)
  return exposed
}

export function useWalletContext(): WalletContextValue {
  const ctx = inject(WalletContextKey)
  if (!ctx) throw new Error('useWalletContext must be used after createWalletProvider() in setup')
  return ctx
}

export function onWalletEvent(event: WalletEvent, handler: (...args: any[]) => void) {
  const { manager } = useWalletContext()
  manager.on(event, handler)
  return () => manager.off(event, handler)
}

export function installBTCWallet(app: App, options?: CreateWalletProviderOptions) {
  const ctx = createWalletProvider(options)
  app.provide(WalletContextKey, ctx)
  return ctx
}

// SSR 友好的 Vue 插件写法
export const BTCWalletPlugin: Plugin = {
  install(app: App, options?: CreateWalletProviderOptions) {
    // 不在 install 中访问 window/localStorage，createWalletProvider 本身已做延迟/容错
    installBTCWallet(app, options)
  },
}

export type { WalletState } from '@btc-connect/core'


