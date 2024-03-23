// Generated by dts-bundle-generator v8.1.2

export type WalletNetwork = "livenet" | "testnet";
export type Balance = {
	confirmed: number;
	unconfirmed: number;
	total: number;
};
export interface BtcWalletConnectOptions {
	network?: BtcWalletNetwork;
	defaultConnectorId?: BtcConnectorId;
}
export type BtcWalletNetwork = "livenet" | "testnet";
export type BtcConnectorId = "unisat" | "okx";
export type AccountsChangedEvent = (event: "networkChanged", handler: (accounts: Array<string>) => void) => void;
export type NetworkChangedEvent = (event: "networkChanged", handler: (network: BtcWalletNetwork) => void) => void;
export type MessageType = "ecdsa" | "bip322-simple";
export type Address = string;
declare abstract class BtcConnector {
	/** Unique connector id */
	abstract readonly id: string;
	/** Connector name */
	abstract readonly name: string;
	abstract readonly logo: string;
	/** Extension or Snap homepage */
	abstract homepage: string;
	/** Whether connector is usable */
	ready: boolean;
	connected: boolean;
	address: Address | undefined;
	publicKey: string | undefined;
	network: WalletNetwork;
	constructor(network: WalletNetwork);
	abstract connect(): Promise<boolean>;
	abstract sendToAddress(toAddress: string, amount: number): Promise<string>;
	abstract signPsbt(psbtHex: string, options?: any): Promise<string>;
	disconnect(): void;
	getAccount(): string | undefined;
	isAuthorized(): boolean;
	getNetwork(): Promise<WalletNetwork>;
	getPublicKey(): Promise<string>;
}
declare namespace UnisatWalletTypes {
	type AccountsChangedEvent = (event: "accountsChanged" | "networkChanged", handler: (accounts: Array<string> | string) => void) => void;
	type Inscription = {
		inscriptionId: string;
		inscriptionNumber: string;
		address: string;
		outputValue: string;
		content: string;
		contentLength: string;
		contentType: string;
		preview: string;
		timestamp: number;
		offset: number;
		genesisTransaction: string;
		location: string;
	};
	type GetInscriptionsResult = {
		total: number;
		list: Inscription[];
	};
	type SendInscriptionsResult = {
		txid: string;
	};
	type Network = "livenet" | "testnet";
}
export type Unisat = {
	requestAccounts: () => Promise<string[]>;
	getAccounts: () => Promise<string[]>;
	on: UnisatWalletTypes.AccountsChangedEvent;
	removeListener: UnisatWalletTypes.AccountsChangedEvent;
	getInscriptions: (cursor: number, size: number) => Promise<UnisatWalletTypes.GetInscriptionsResult>;
	sendInscription: (address: string, inscriptionId: string, options?: {
		feeRate: number;
	}) => Promise<UnisatWalletTypes.SendInscriptionsResult>;
	switchNetwork: (network: "livenet" | "testnet") => Promise<void>;
	getNetwork: () => Promise<UnisatWalletTypes.Network>;
	getPublicKey: () => Promise<string>;
	getBalance: () => Promise<Balance>;
	sendBitcoin: (address: string, atomicAmount: number, options?: {
		feeRate: number;
	}) => Promise<string>;
	pushTx: ({ rawtx }: {
		rawtx: string;
	}) => Promise<string>;
	pushPsbt: (psbtHex: string) => Promise<string>;
	signMessage: (message: string, type?: "ecdsa" | "bip322-simple") => Promise<string>;
	signPsbt: (psbtHex: string, options?: {
		autoFinalized?: boolean;
		toSignInputs: {
			index: number;
			address?: string;
			publicKey?: string;
			sighashTypes?: number[];
			disableTweakSigner?: boolean;
		}[];
	}) => Promise<string>;
	signPsbts: (psbtHexs: string[], options?: {
		autoFinalized?: boolean;
		toSignInputs: {
			index: number;
			address?: string;
			publicKey?: string;
			sighashTypes?: number[];
			disableTweakSigner?: boolean;
		};
	}[]) => Promise<string[]>;
};
declare class UnisatConnector extends BtcConnector {
	readonly id = "unisat";
	readonly name = "Unisat";
	readonly logo = "data:image/svg+xml;base64,Cjxzdmcgd2lkdGg9IjEwMHB4IiBoZWlnaHQ9IjEwMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KICAgIDxkZWZzPgogICAgICAgIDxsaW5lYXJHcmFkaWVudCB4MT0iOTEuODc1NTY2NyUiIHkxPSIyOS43Mjg4NjIyJSIgeDI9IjUuNTkzNTkzODUlIiB5Mj0iNjcuNzM4NzI0OCUiIGlkPSJsaW5lYXJHcmFkaWVudC1leXZkOXN5Z2Z5LTEiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMjAxQzFCIiBvZmZzZXQ9IjAlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiM3NzM5MEQiIG9mZnNldD0iMzYlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNFQTgxMDEiIG9mZnNldD0iNjclIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNGNEI4NTIiIG9mZnNldD0iMTAwJSI+PC9zdG9wPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IHgxPSIxMC41MTQwNjI0JSIgeTE9IjYyLjg4MzE2ODglIiB4Mj0iMTEwLjc4ODYyJSIgeTI9IjM3LjMyMTc0MDIlIiBpZD0ibGluZWFyR3JhZGllbnQtZXl2ZDlzeWdmeS0yIj4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzFGMUQxQyIgb2Zmc2V0PSIwJSI+PC9zdG9wPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjNzczOTBEIiBvZmZzZXQ9IjM3JSI+PC9zdG9wPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjRUE4MTAxIiBvZmZzZXQ9IjY3JSI+PC9zdG9wPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjRjRGQjUyIiBvZmZzZXQ9IjEwMCUiPjwvc3RvcD4KICAgICAgICA8L2xpbmVhckdyYWRpZW50PgogICAgICAgIDxyYWRpYWxHcmFkaWVudCBjeD0iNTAlIiBjeT0iNTAuMDQ1MDk4OCUiIGZ4PSI1MCUiIGZ5PSI1MC4wNDUwOTg4JSIgcj0iNTAuODMyODIzNiUiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC41MDAwMDAsMC41MDA0NTEpLHNjYWxlKDAuOTgzNjEyLDEuMDAwMDAwKSx0cmFuc2xhdGUoLTAuNTAwMDAwLC0wLjUwMDQ1MSkiIGlkPSJyYWRpYWxHcmFkaWVudC1leXZkOXN5Z2Z5LTMiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjRjRCODUyIiBvZmZzZXQ9IjAlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNFQTgxMDEiIG9mZnNldD0iMzMlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiM3NzM5MEQiIG9mZnNldD0iNjQlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMyMTFDMUQiIG9mZnNldD0iMTAwJSI+PC9zdG9wPgogICAgICAgIDwvcmFkaWFsR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iR3JvdXAiPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNS4wMDAwMDAsIDYuMDAwMDAwKSIgZmlsbC1ydWxlPSJub256ZXJvIiBpZD0iUGF0aCI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNDkuMzcxMDQwNiw3LjkwMTkzODMzIEw2Ny42OTU5OTYsMjUuNzU0MjQ5NyBDNjkuMjU1ODc2MiwyNy4yNzA2MjQ1IDcwLjAyMzYwMTgsMjguODA0OTc3OSA3MCwzMC4zNTExMzQgQzY5Ljk3NTI5MywzMS44OTcyOTAxIDY5LjMwNDE4NSwzMy4zMDY2MTcgNjcuOTkyMjk5MSwzNC41ODUxNTMzIEM2Ni42MTk4OSwzNS45MjMyNTIyIDY1LjEzODY0ODksMzYuNjAxMjIyMyA2My41NTQ2MTQzLDM2LjYzMDg2NjMgQzYxLjk3MDU3OTcsMzYuNjU0NzQ2MiA2MC4zOTg2MjIzLDM1LjkwNTQxMDkgNTguODM4NzQyMSwzNC4zODkwMzYxIEw0MC4wOTY3MTE2LDE2LjEzMjI4OTUgQzM3Ljk2ODUxNjgsMTQuMDU2OTMyNCAzNS45MTI5MjI1LDEyLjU4ODAxNTUgMzMuOTM1OTY3MiwxMS43MjU3MzA5IEMzMS45NTg4NzQ2LDEwLjg2MzQ0NjIgMjkuODc5MTI1OSwxMC43MjY2NzE5IDI3LjcwMjYyMjMsMTEuMzIxMzUwNSBDMjUuNTIwMDgwMSwxMS45MTAwODY2IDIzLjE4MDM5NywxMy40MjY1MTYzIDIwLjY3MTM1ODcsMTUuODY0NjY5NyBDMTcuMjEzMTYyMiwxOS4yMzY1NDE2IDE1LjU2MjU2NTgsMjIuNDAwMjE5MSAxNS43MzE5MjExLDI1LjM1NTgzOTMgQzE1LjkwMTEzOTEsMjguMzExMzIyMyAxNy42MTgxNjAyLDMxLjM3OTg5MTkgMjAuODc2OTQ1NiwzNC41NDk2MDc5IEwzOS43NzAyMTU1LDUyLjk2MDg4NzggQzQxLjM0ODIxMTUsNTQuNDk1MTAzOSA0Mi4xMjE5NzU4LDU2LjAyOTMyMDEgNDIuMDk3ODIxNCw1Ny41NTE3MzM1IEM0Mi4wNzM2NjcsNTkuMDgwMDQ4MyA0MS4zOTY1MjAzLDYwLjQ4OTUxMjQgNDAuMDYwMzQyOCw2MS43OTE3OTE0IEMzOC43MzAzNDExLDYzLjA4ODE2OTEgMzcuMjYxMTc3Miw2My43NjYxMzkxIDM1LjY2NTA2NTQsNjMuODE5NjYzMSBDMzQuMDY4OTUzNiw2My44NzMxODcxIDMyLjQ3ODg4MDQsNjMuMTI5ODkwMyAzMC45MDY5MjMsNjEuNTk1NTM2OSBMMTIuNTgxOTY3Nyw0My43NDMyMzkzIEM5LjYwMTM2OTYxLDQwLjg0MTI4MDIgNy40NDkwMzQxMywzOC4wOTM4NTQ0IDYuMTI1MDAyNDUsMzUuNTAwOTYxOSBDNC44MDA5NTcwNCwzMi45MDgyMDY2IDQuMzA1MjAxNywyOS45NzY0NjYzIDQuNjQ5ODEzNjIsMjYuNzA1NzQwOSBDNC45NTgxNTI3OCwyMy45MDQ3OTEyIDUuODcxMDY1NTksMjEuMTkzMDQ4IDcuMzk0NjMxODMsMTguNTY0NjEwMSBDOC45MTIxMzIwMywxNS45MzYwMzUgMTEuMDg4NjQ5NCwxMy4yNDgxMTY4IDEzLjkxMjEwNjYsMTAuNDk0NzQ4NSBDMTcuMjczNTQ4Miw3LjIxODA2Njg3IDIwLjQ4Mzg4NzYsNC43MDg1MjA3NSAyMy41NDMxMjQ3LDIuOTYwMTUzOSBDMjYuNTk2MzIzMywxLjIxMTc5OTQgMjkuNTUyNjI5NywwLjI0MjQ3MDk2MyAzMi40MDYyOCwwLjA0MDI4MDI0MjIgQzM1LjI2NTk2ODgsLTAuMTYxOTEwNzUzIDM4LjA4MzM4NzUsMC4zOTcwODc5NDUgNDAuODcwNDc1OSwxLjcxNzI3Mjc3IEM0My42NTc3MDE1LDMuMDM3NDYxNyA0Ni40ODcxOTc0LDUuMDk1MDU5NzggNDkuMzY1MDAyLDcuOTAxOTM4MzMgTDQ5LjM3MTA0MDYsNy45MDE5MzgzMyBaIiBmaWxsPSJ1cmwoI2xpbmVhckdyYWRpZW50LWV5dmQ5c3lnZnktMSkiPjwvcGF0aD4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yMC42MjI5MTI2LDc5LjkzNTQ1MTUgTDIuMzA0MDIzMzYsNjIuMDgzMTUzOSBDMC43NDQxOTM5NTIsNjAuNTYwNzQwNCAtMC4wMjM2Mjk1NTQxLDU5LjAzMjQyNTcgMi4wNDU4MDg0OWUtMTUsNTcuNDg2MjY5NiBDMC4wMjQ3MzcyOTkzLDU1Ljk0MDExMzUgMC42OTU4Mjc1MSw1NC41MzA3ODY2IDIuMDA3Nzc1MTMsNTMuMjUyMTEzIEMzLjM4MDE4NDI0LDUxLjkxNDE1MTQgNC44NjE0MjUzOCw1MS4yMzYxODEzIDYuNDQ1NDMyNTIsNTEuMjA2NCBDOC4wMjk0NTMzOSw1MS4xODI2NTczIDkuNjAxMzY5NjEsNTEuOTI1OTU0MSAxMS4xNjEyMDg2LDUzLjQ0ODM2NzUgTDI5Ljg5NzI0MTcsNzEuNzA1MTE0MSBDMzIuMDMxNDc1MSw3My43ODA0NzExIDM0LjA4MTAzMDgsNzUuMjQ5MzYwNiAzNi4wNTc5ODYxLDc2LjExMTY0NTMgQzM4LjAzNTA3ODcsNzYuOTczOTI5OSA0MC4xMTQ4Mjc0LDc3LjEwNDcyMDUgNDIuMjk3MzY5Niw3Ni41MTU5NTcgQzQ0LjQ3OTkxMTgsNzUuOTI3MzMwNyA0Ni44MTk1OTQ5LDc0LjQxMDgxODYgNDkuMzI4NjMzMiw3MS45NjY2OTUzIEM1Mi43ODY5NjY5LDY4LjU5NDgyMzMgNTQuNDM3NDI2MSw2NS40MzExNDU5IDU0LjI2ODIwODEsNjIuNDc1NjYyOSBDNTQuMDk4ODUyOCw1OS41MjAwNDI2IDUyLjM4MTgzMTcsNTYuNDUxNDczMSA0OS4xMjMxODM2LDUzLjI3NTk5MjkgTDM5LjA1NjgzNzMsNDMuNTUyODg2MSBDMzcuNDc4ODQxMyw0Mi4wMTg2NyAzNi43MDQ5Mzk4LDQwLjQ4NDMxNjYgMzYuNzI5MDk0MiwzOC45NjIwNDA0IEMzNi43NTMyNDg2LDM3LjQzMzcyNTcgMzcuNDMwMzk1MiwzNi4wMjQyNjE1IDM4Ljc2NjU3MjcsMzQuNzIxOTgyNSBDNDAuMDk2NzExNiwzMy40MjU0Njc2IDQxLjU2NTg3NTYsMzIuNzQ3NjM0OCA0My4xNjE4NTAxLDMyLjY5NDExMDggQzQ0Ljc1Nzk2MTksMzIuNjQwNTg2OSA0Ni4zNDgwMzUxLDMzLjM4Mzg4MzYgNDcuOTE5OTkyNSwzNC45MTgyMzcgTDU3LjQxMTk4NTYsNDQuMDgyMjI0MyBDNjAuMzkyNTgzNyw0Ni45ODQxODM0IDYyLjU0NDkzMjksNDkuNzMxNjA5MiA2My44NjkwMzMyLDUyLjMyNDUwMTcgQzY1LjE5Mjk5NjMsNTQuOTE3MjU3IDY1LjY4ODcxMDQsNTcuODQ4OTk3MyA2NS4zNDQwOTg1LDYxLjExOTcyMjcgQzY1LjAzNTg1NTQsNjMuOTIwNjcyNCA2NC4xMjI5Mjg5LDY2LjYzMjQxNTYgNjIuNTk5MjgwMyw2OS4yNjA5OTA3IEM2MS4wODE4MDc1LDcxLjg4OTQyODYgNTguOTA1MzAzOSw3NC41Nzc0MjkxIDU2LjA4MTg0NjcsNzcuMzMwNzU2MyBDNTIuNzIwNDA1MSw4MC42MDczODMgNDkuNTEwMDY1Nyw4My4xMTY5NzAzIDQ2LjQ1MDgyODYsODQuODY1MjgyMiBDNDMuMzkxNTkxNCw4Ni42MTM3MzE0IDQwLjQzNTI4NSw4Ny41ODg5NjU0IDM3LjU3NTU5NjEsODcuNzkxMTIxMiBDMzQuNzE1OTA3Myw4Ny45OTM0MTQzIDMxLjg5ODQ4ODYsODcuNDM0Mjk0OSAyOS4xMTE0MDAyLDg2LjExNDE3NDUgQzI2LjMyNDE3NDUsODQuNzkzOTE3IDIzLjQ5NDY3ODcsODIuNzM2NDAxMiAyMC42MTY4NzQsNzkuOTI5NTUwMSBMMjAuNjIyOTEyNiw3OS45MzU0NTE1IFoiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQtZXl2ZDlzeWdmeS0yKSI+PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTMyLjA0OTU5MDksMzMuODcxNjM3OCBDMzUuNzY1OTM3NSwzMy44NzE2Mzc4IDM4Ljc3ODY0OTksMzAuOTA4MzMyMSAzOC43Nzg2NDk5LDI3LjI1Mjc4MzIgQzM4Ljc3ODY0OTksMjMuNTk3MzcxNSAzNS43NjU5Mzc1LDIwLjYzNDA2NTggMzIuMDQ5NTkwOSwyMC42MzQwNjU4IEMyOC4zMzMyNDQyLDIwLjYzNDA2NTggMjUuMzIwNTMxOCwyMy41OTczNzE1IDI1LjMyMDUzMTgsMjcuMjUyNzgzMiBDMjUuMzIwNTMxOCwzMC45MDgzMzIxIDI4LjMzMzI0NDIsMzMuODcxNjM3OCAzMi4wNDk1OTA5LDMzLjg3MTYzNzggWiIgZmlsbD0idXJsKCNyYWRpYWxHcmFkaWVudC1leXZkOXN5Z2Z5LTMpIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjwvcmVjdD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==";
	homepage: string;
	banance: Balance;
	unisat: Unisat;
	constructor(network: WalletNetwork);
	on(event: "accountsChanged" | "networkChanged", handler: any): void;
	removeListener(event: "accountsChanged" | "networkChanged", handler: any): void;
	connect(): Promise<boolean>;
	getCurrentInfo(): Promise<void>;
	disconnect(): Promise<void>;
	getAccounts(): Promise<string[]>;
	sendToAddress(toAddress: string, amount: number): Promise<string>;
	switchNetwork(network: WalletNetwork): Promise<void>;
	getPublicKey(): Promise<string>;
	getBalance(): Promise<Balance>;
	signPsbt(psbtHex: string, options?: any): Promise<string>;
	signMessage(message: string): Promise<string>;
	signPsbts(psbtHexs: string[], options?: any): Promise<string[]>;
	pushTx(rawTx: string): Promise<string>;
	pushPsbt(psbtHex: string): Promise<string>;
}
declare namespace OkxWalletTypes {
	interface AddressInfo {
		address: string;
		publicKey: string;
		compressedPublicKey: string;
	}
	type OnEvent = (event: "accountsChanged" | "accountChanged", handler: (accounts: Array<string> | Array<AddressInfo>) => void) => void;
	type Inscription = {
		inscriptionId: string;
		inscriptionNumber: string;
		address: string;
		outputValue: string;
		content: string;
		contentLength: string;
		contentType: string;
		preview: string;
		timestamp: number;
		offset: number;
		genesisTransaction: string;
		location: string;
	};
	type GetInscriptionsResult = {
		total: number;
		list: Inscription[];
	};
	type Network = "livenet" | "testnet";
	interface ConnectResult {
		address: string;
		publicKey: string;
	}
	interface SendProps {
		from: string;
		to: string;
		value: number;
		satBytes: number;
	}
	interface SendResult {
		txhash: string;
	}
	interface TransferNftProps {
		from: string;
		to: string;
		data: string | string[];
	}
	interface TransferNftResult {
		txhash: string;
	}
	interface SplitUtxoProps {
		from: string;
		amount: number;
	}
	interface SplitUtxoResult {
		utxos: {
			txId: string;
			vOut: number;
			amount: number;
			rawTransaction: string;
		}[];
	}
	interface InscribeProps {
		type: 51 | 58;
		from: string;
		tick: string;
		tid: string;
	}
	interface MintProps {
		type: 60 | 50 | 51 | 62 | 61 | 36 | 33 | 34 | 35 | 58;
		from: string;
		inscriptions: {
			contentType: string;
			body: string;
		}[];
	}
	interface MintResult {
		commitAddrs: string[];
		commitTx: string;
		revealTxs: string[];
		commitTxFee: number;
		revealTxFees: number[];
		feeRate: number;
		size: number;
	}
}
export type OkxWallet = {
	connect: () => Promise<OkxWalletTypes.ConnectResult>;
	requestAccounts: () => Promise<string[]>;
	getAccounts: () => Promise<string[]>;
	getNetwork: () => Promise<OkxWalletTypes.Network>;
	getPublicKey: () => Promise<string>;
	getBalance: () => Promise<Balance>;
	getInscriptions: (cursor: number, size: number) => Promise<OkxWalletTypes.GetInscriptionsResult>;
	sendBitcoin: (toAddress: string, satoshis: number, options?: {
		feeRate: number;
	}) => Promise<string>;
	sendInscription: (address: string, inscriptionId: string, options?: {
		feeRate: number;
	}) => Promise<string>;
	transferNft: ({ from, to, data, }: OkxWalletTypes.TransferNftProps) => Promise<OkxWalletTypes.TransferNftResult>;
	send: ({ from, to, value, satBytes }: OkxWalletTypes.SendProps) => Promise<OkxWalletTypes.SendResult>;
	signMessage: (message: string, type?: "ecdsa" | "bip322-simple") => Promise<string>;
	pushTx: (rawtx: string) => Promise<string>;
	splitUtxo: ({ from, amount }: OkxWalletTypes.SplitUtxoProps) => Promise<OkxWalletTypes.SplitUtxoResult>;
	inscribe: ({ type, from, tick, tid }: OkxWalletTypes.InscribeProps) => Promise<string>;
	mint: ({ type, from, inscriptions }: OkxWalletTypes.MintProps) => Promise<OkxWalletTypes.MintResult>;
	signPsbt: (psbtHex: string, options?: {
		autoFinalized?: boolean;
		toSignInputs: {
			index: number;
			address?: string;
			publicKey?: string;
			sighashTypes?: number[];
			disableTweakSigner?: boolean;
		}[];
	}) => Promise<string>;
	signPsbts: (psbtHexs: string[], options?: {
		autoFinalized?: boolean;
		toSignInputs: {
			index: number;
			address?: string;
			publicKey?: string;
			sighashTypes?: number[];
			disableTweakSigner?: boolean;
		};
	}[]) => Promise<string[]>;
	pushPsbt: (psbtHex: string) => Promise<string>;
	on: OkxWalletTypes.OnEvent;
};
declare class OkxConnector extends BtcConnector {
	readonly id = "okx";
	readonly name = "OKX";
	readonly logo = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxuczp4b2RtPSJodHRwOi8vd3d3LmNvcmVsLmNvbS9jb3JlbGRyYXcvb2RtLzIwMDMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjUwMCAyNTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyNTAwIDI1MDA7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7fQoJLnN0MXtmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8ZyBpZD0iTGF5ZXJfeDAwMjBfMSI+Cgk8ZyBpZD0iXzIxODczODEzMjM4NTYiPgoJCTxyZWN0IHk9IjAiIGNsYXNzPSJzdDAiIHdpZHRoPSIyNTAwIiBoZWlnaHQ9IjI1MDAiPjwvcmVjdD4KCQk8Zz4KCQkJPHBhdGggY2xhc3M9InN0MSIgZD0iTTE0NjMsMTAxNWgtNDA0Yy0xNywwLTMxLDE0LTMxLDMxdjQwNGMwLDE3LDE0LDMxLDMxLDMxaDQwNGMxNywwLDMxLTE0LDMxLTMxdi00MDQgICAgIEMxNDk0LDEwMjksMTQ4MCwxMDE1LDE0NjMsMTAxNXoiPjwvcGF0aD4KCQkJPHBhdGggY2xhc3M9InN0MSIgZD0iTTk5Niw1NDlINTkyYy0xNywwLTMxLDE0LTMxLDMxdjQwNGMwLDE3LDE0LDMxLDMxLDMxaDQwNGMxNywwLDMxLTE0LDMxLTMxVjU4MEMxMDI3LDU2MywxMDEzLDU0OSw5OTYsNTQ5eiI+PC9wYXRoPgoJCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTkzMCw1NDloLTQwNGMtMTcsMC0zMSwxNC0zMSwzMXY0MDRjMCwxNywxNCwzMSwzMSwzMWg0MDRjMTcsMCwzMS0xNCwzMS0zMVY1ODAgICAgIEMxOTYxLDU2MywxOTQ3LDU0OSwxOTMwLDU0OXoiPjwvcGF0aD4KCQkJPHBhdGggY2xhc3M9InN0MSIgZD0iTTk5NiwxNDgySDU5MmMtMTcsMC0zMSwxNC0zMSwzMXY0MDRjMCwxNywxNCwzMSwzMSwzMWg0MDRjMTcsMCwzMS0xNCwzMS0zMXYtNDA0ICAgICBDMTAyNywxNDk2LDEwMTMsMTQ4Miw5OTYsMTQ4MnoiPjwvcGF0aD4KCQkJPHBhdGggY2xhc3M9InN0MSIgZD0iTTE5MzAsMTQ4MmgtNDA0Yy0xNywwLTMxLDE0LTMxLDMxdjQwNGMwLDE3LDE0LDMxLDMxLDMxaDQwNGMxNywwLDMxLTE0LDMxLTMxdi00MDQgICAgIEMxOTYxLDE0OTYsMTk0NywxNDgyLDE5MzAsMTQ4MnoiPjwvcGF0aD4KCQk8L2c+Cgk8L2c+CjwvZz4KPC9zdmc+Cg==";
	homepage: string;
	banance: Balance;
	okxwallet: OkxWallet;
	constructor(network: WalletNetwork);
	on(event: "accountsChanged" | "accountChanged", handler: any): void;
	connect(): Promise<boolean>;
	getCurrentInfo(): Promise<void>;
	disconnect(): Promise<void>;
	getAccounts(): Promise<string[]>;
	getNetwork(): Promise<WalletNetwork>;
	getPublicKey(): Promise<string>;
	getBalance(): Promise<Balance>;
	sendToAddress(toAddress: string, amount: number): Promise<string>;
	switchNetwork(network: WalletNetwork): Promise<void>;
	signPsbt(psbtHex: string, options?: any): Promise<string>;
	signMessage(message: string): Promise<string>;
	signPsbts(psbtHexs: string[], options?: any): Promise<string[]>;
	pushTx(rawTx: string): Promise<string>;
	pushPsbt(psbtHex: string): Promise<string>;
}
export type Connector = UnisatConnector | OkxConnector;
export interface BtcConnectors {
	id: BtcConnectorId;
	instance: Connector;
	installed: boolean;
}
declare class BtcWalletConnect {
	private local_storage_key;
	private local_disconnect_key;
	connectorId: BtcConnectorId;
	localConnectorId?: BtcConnectorId;
	disConnectStatus: boolean;
	connected: boolean;
	address?: string;
	publicKey?: string;
	network: BtcWalletNetwork;
	balance: Balance;
	connectors: BtcConnectors[];
	connector?: Connector;
	constructor({ network, defaultConnectorId, }: BtcWalletConnectOptions);
	switchConnector(id: BtcConnectorId): Connector;
	connect(): Promise<boolean>;
	private getCurrentInfo;
	check(): Promise<false | undefined>;
	disconnect(): Promise<void>;
	getAccounts(): Promise<string[]>;
	getNetwork(): Promise<WalletNetwork>;
	switchNetwork(network: BtcWalletNetwork): Promise<void>;
	sendToAddress(toAddress: string, amount: number): Promise<string>;
	signMessage(message: string, type?: MessageType): Promise<string>;
	signPsbt(psbtHex: string, options?: any): Promise<string>;
	signPsbts(psbtHexs: string[], options?: any): Promise<string[]>;
	pushTx(rawTx: string): Promise<string>;
	pushPsbt(psbtHex: string): Promise<string>;
	on: NetworkChangedEvent | AccountsChangedEvent;
	removeListener: NetworkChangedEvent | AccountsChangedEvent;
}

export {
	BtcWalletConnect as default,
};

export {};
