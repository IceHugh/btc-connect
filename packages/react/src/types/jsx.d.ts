/// <reference types="react" />

/**
 * Web Components JSX 类型声明
 * 为React提供Web Components的JSX支持
 */

import type { BTCConnectButtonProps } from '@btc-connect/ui';
import type { WalletModalProps } from '@btc-connect/ui';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'btc-connect-button': BTCConnectButtonProps & {
        ref?: React.Ref<any>;
        [key: string]: any;
      };
      'btc-wallet-modal': WalletModalProps & {
        ref?: React.Ref<any>;
        [key: string]: any;
      };
    }
  }
}