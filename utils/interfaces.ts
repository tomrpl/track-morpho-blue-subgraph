export interface MarketParams {
  loanToken: string;
  collateralToken: string;
  oracle: string;
  irm: string;
  lltv: bigint;
}

export interface MarketState {
  totalSupplyAssets: bigint;
  totalSupplyShares: bigint;
  totalBorrowAssets: bigint;
  totalBorrowShares: bigint;
  lastUpdate: bigint;
  fee: bigint;
}

export interface UserPosition {
  supplyShares: bigint;
  borrowShares: bigint;
  collateral: bigint;
}

export interface Position {
  id: string;
  side: string;
  account: { id: string };
  balance: string;
}

export interface Token {
  id: string;
  name: string;
  lastPriceUSD: string;
  decimals: number;
}
