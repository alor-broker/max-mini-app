import { Side } from "../models/api.enums";

export interface RepoSpecificFields {
  repoRate: number;
  extRef: string;
  repoTerm: number;
  account: string;
  tradeTypeInfo: string;
  value: number;
  yield: number;
}

export interface PortfolioTrade {
  id: string;
  orderNo: string;
  comment?: string;
  symbol: string;
  shortName: string;
  brokerSymbol: string;
  exchange: string;
  date: Date;
  board: string;
  qtyUnits: number;
  qtyBatch: number;
  qty: number;
  price: number;
  accruedInt: number;
  side: Side,
  existing: false,
  commission: 0.10746,
  repoSpecificFields?: RepoSpecificFields
  volume: 134.92
}
