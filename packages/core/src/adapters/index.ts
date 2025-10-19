import { OKXAdapter } from './okx';
import { UniSatAdapter } from './unisat';

export { BaseWalletAdapter } from './base';
export { OKXAdapter } from './okx';
export { UniSatAdapter } from './unisat';
export { XverseAdapter } from './xverse';

// 适配器工厂函数
export function createAdapter(type: 'unisat' | 'okx' | 'xverse') {
  switch (type) {
    case 'unisat':
      return new UniSatAdapter();
    case 'okx':
      return new OKXAdapter();
    // case 'xverse':
    //   return new XverseAdapter();
    default:
      throw new Error(`Unsupported wallet type: ${type}`);
  }
}

// 获取所有可用的适配器
export function getAllAdapters() {
  return [new UniSatAdapter(), new OKXAdapter()];
}

// 获取可用的适配器（已安装的钱包）
export function getAvailableAdapters() {
  return getAllAdapters().filter((adapter) => adapter.isReady());
}
