/// <reference types="react" />

/**
 * Web Components JSX 类型声明
 * 为React提供Web Components的JSX支持
 */

import type { ConnectButtonProps } from '../components/ConnectButton';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'btc-connect-button': ConnectButtonProps & {
        ref?: React.Ref<any>;
        [key: string]: any;
      };
      'btc-wallet-modal': {
        ref?: React.Ref<any>;
        [key: string]: any;
      };
    }
  }
}