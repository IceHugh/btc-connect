import { Network, Balance } from '../types';

type Address = string;

/**
 * 抽象类 BtcConnector 定义了所有连接器的基础结构和方法
 */
export abstract class BtcConnector {
  /** 唯一的连接器标识 */
  abstract readonly id: string;
  /** 连接器名称 */
  abstract readonly name: string;

  /** 扩展或 Snap 的主页 */
  abstract homepage: string;

  /** 连接器是否可用 */
  ready: boolean = false;

  public connected: boolean = false;
  address: Address | undefined = undefined;

  publicKey: string | undefined;

  network: Network;
  networks: Network[] = [Network.LIVENET, Network.TESTNET, Network.REGTEST, Network.TESTNET4];

  constructor(network: Network) {
    this.network = network;
  }

  /** 连接方法，需在子类中实现 */
  abstract connect(): Promise<boolean>;

  /** 发送比特币到指定地址，需在子类中实现 */
  abstract sendToAddress(toAddress: string, amount: number): Promise<string>;

  /** 签署 PSBT，需在子类中实现 */
  abstract signPsbt(psbtHex: string, options?: any): Promise<string>;

  /** 获取当前信息，需在子类中实现 */
  abstract getCurrentInfo(): Promise<void>;

  abstract balance: Balance;

  /**
   * 断开连接，重置相关属性
   */
  disconnect(): void {
    this.address = undefined;
    this.publicKey = undefined;
    this.connected = false;
    this.balance = { confirmed: 0, unconfirmed: 0, total: 0 };
  }

  /**
   * 获取账户地址
   * @returns 账户地址
   */
  getAccount(): string | undefined {
    return this.address;
  }

  /**
   * 检查是否已授权
   * @returns 是否授权
   */
  isAuthorized(): boolean {
    const address = this.getAccount();
    return !!address;
  }

  /**
   * 获取当前网络
   * @returns 当前网络
   */
  async getNetwork(): Promise<Network> {
    if (!this.network) {
      throw new Error('Something went wrong while connecting');
    }
    return this.network;
  }

  /**
   * 获取公共密钥
   * @returns 公共密钥
   */
  async getPublicKey(): Promise<string> {
    if (!this.publicKey) {
      throw new Error('Something went wrong while connecting');
    }
    return this.publicKey;
  }

  /**
   * 切换网络
   * @param network 目标网络
   */
  async switchNetwork(network: Network): Promise<void> {
    this.network = network;
    await this.getCurrentInfo();
  }
}
