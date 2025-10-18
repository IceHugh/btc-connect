import type {
  AccountInfo,
  BalanceDetail,
  Network,
  WalletInfo,
  WalletState,
} from '../types';

// Action 类型定义
export type WalletAction =
  | { type: 'SET_MANAGER'; payload: any }
  | { type: 'SET_STATE'; payload: WalletState }
  | { type: 'SET_CURRENT_WALLET'; payload: WalletInfo | null }
  | { type: 'SET_AVAILABLE_WALLETS'; payload: WalletInfo[] }
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_POLICY_RUNNING'; payload: boolean }
  | { type: 'SET_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | {
      type: 'UPDATE_ACCOUNT_INFO';
      payload: { publicKey?: string; balance?: BalanceDetail };
    }
  | { type: 'SET_NETWORK'; payload: Network }
  | { type: 'SET_ERROR'; payload: Error | undefined }
  | { type: 'RESET_STATE' };

// State 接口定义
export interface WalletReducerState {
  // 核心状态
  manager: any;
  state: WalletState;
  currentWallet: WalletInfo | null;
  availableWallets: WalletInfo[];

  // UI 状态
  isConnecting: boolean;
  isPolicyRunning: boolean;
  isModalOpen: boolean;
  theme: 'light' | 'dark';

  // 错误状态
  error: Error | undefined;
}

// 初始状态
export const initialState: WalletReducerState = {
  manager: null,
  state: {
    status: 'disconnected',
    accounts: [],
  },
  currentWallet: null,
  availableWallets: [],
  isConnecting: false,
  isPolicyRunning: false,
  isModalOpen: false,
  theme: 'light',
  error: undefined,
};

// Reducer 函数
export function walletReducer(
  state: WalletReducerState,
  action: WalletAction,
): WalletReducerState {
  switch (action.type) {
    case 'SET_MANAGER':
      return {
        ...state,
        manager: action.payload,
      };

    case 'SET_STATE':
      return {
        ...state,
        state: action.payload,
        error: undefined,
      };

    case 'SET_CURRENT_WALLET':
      return {
        ...state,
        currentWallet: action.payload,
      };

    case 'SET_AVAILABLE_WALLETS':
      return {
        ...state,
        availableWallets: action.payload,
      };

    case 'SET_CONNECTING':
      return {
        ...state,
        isConnecting: action.payload,
      };

    case 'SET_POLICY_RUNNING':
      return {
        ...state,
        isPolicyRunning: action.payload,
      };

    case 'SET_MODAL_OPEN':
      return {
        ...state,
        isModalOpen: action.payload,
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };

    case 'UPDATE_ACCOUNT_INFO':
      return {
        ...state,
        state: {
          ...state.state,
          currentAccount: state.state.currentAccount
            ? {
                ...state.state.currentAccount,
                publicKey:
                  action.payload.publicKey ??
                  state.state.currentAccount.publicKey,
                balance:
                  action.payload.balance ?? state.state.currentAccount.balance,
              }
            : state.state.currentAccount,
          accounts: state.state.accounts.map(
            (account: AccountInfo, index: number) =>
              index === 0
                ? {
                    ...account,
                    publicKey: action.payload.publicKey ?? account.publicKey,
                    balance: action.payload.balance ?? account.balance,
                  }
                : account,
          ),
        },
      };

    case 'SET_NETWORK':
      return {
        ...state,
        state: {
          ...state.state,
          network: action.payload,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        state: {
          ...state.state,
          error: action.payload,
        },
      };

    case 'RESET_STATE':
      return {
        ...initialState,
        manager: state.manager,
      };

    default:
      return state;
  }
}

// Action Creators
export const walletActionCreators = {
  setManager: (manager: any): WalletAction => ({
    type: 'SET_MANAGER',
    payload: manager,
  }),

  setState: (state: WalletState): WalletAction => ({
    type: 'SET_STATE',
    payload: state,
  }),

  setCurrentWallet: (wallet: WalletInfo | null): WalletAction => ({
    type: 'SET_CURRENT_WALLET',
    payload: wallet,
  }),

  setAvailableWallets: (wallets: WalletInfo[]): WalletAction => ({
    type: 'SET_AVAILABLE_WALLETS',
    payload: wallets,
  }),

  setConnecting: (connecting: boolean): WalletAction => ({
    type: 'SET_CONNECTING',
    payload: connecting,
  }),

  setPolicyRunning: (running: boolean): WalletAction => ({
    type: 'SET_POLICY_RUNNING',
    payload: running,
  }),

  setModalOpen: (open: boolean): WalletAction => ({
    type: 'SET_MODAL_OPEN',
    payload: open,
  }),

  setTheme: (theme: 'light' | 'dark'): WalletAction => ({
    type: 'SET_THEME',
    payload: theme,
  }),

  updateAccountInfo: (info: {
    publicKey?: string;
    balance?: BalanceDetail;
  }): WalletAction => ({
    type: 'UPDATE_ACCOUNT_INFO',
    payload: info,
  }),

  setNetwork: (network: Network): WalletAction => ({
    type: 'SET_NETWORK',
    payload: network,
  }),

  setError: (error: Error | undefined): WalletAction => ({
    type: 'SET_ERROR',
    payload: error,
  }),

  resetState: (): WalletAction => ({
    type: 'RESET_STATE',
  }),
};

// 选择器函数 - 用于从状态中派生计算值
export const walletSelectors = {
  // 是否已连接
  isConnected: (state: WalletReducerState): boolean =>
    state.isPolicyRunning ? false : state.state.status === 'connected',

  // 是否正在连接
  isConnecting: (state: WalletReducerState): boolean =>
    state.state.status === 'connecting' ||
    state.isConnecting ||
    state.isPolicyRunning,

  // 当前地址
  currentAddress: (state: WalletReducerState): string | null =>
    state.state.currentAccount?.address || null,

  // 当前余额
  currentBalance: (state: WalletReducerState): BalanceDetail | null =>
    state.state.currentAccount?.balance &&
    typeof state.state.currentAccount.balance === 'object'
      ? (state.state.currentAccount.balance as BalanceDetail)
      : null,

  // 当前公钥
  currentPublicKey: (state: WalletReducerState): string | null =>
    state.state.currentAccount?.publicKey || null,

  // 当前网络
  currentNetwork: (state: WalletReducerState): Network | undefined =>
    state.state.network,

  // 错误信息
  currentError: (state: WalletReducerState): Error | null =>
    state.state.error || state.error || null,

  // 是否有错误
  hasError: (state: WalletReducerState): boolean =>
    !!(state.state.error || state.error),

  // 暴露的状态（策略执行期间隐藏敏感信息）
  exposedState: (state: WalletReducerState): WalletState =>
    state.isPolicyRunning
      ? {
          status: 'connecting',
          accounts: [],
        }
      : state.state,
};
