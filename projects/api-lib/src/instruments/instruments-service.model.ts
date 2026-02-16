export enum TradingStatus {
  Break = 2,
  NormalPeriod = 17,
  Closed = 18,
  ClosingAuction = 102,
  ClosingPeriod = 103,
  LargePackagesAuction = 106,
  DiscreteAuction = 107,
  OpeningPeriod = 118,
  OpeningAuction = 119,
  ClosingPriceAuctionPeriod = 120
}

export interface SearchFilter {
  query: string;
  limit: number;
  sector?: string;
  cficode?: string;
  exchange?: string;
  instrumentGroup?: string;
}

export interface InstrumentKey {
  symbol: string;
  exchange: string;
  board?: string | null;
  ISIN?: string;
}

export interface Instrument extends InstrumentKey {
  shortname: string;
  description: string;
  primary_board: string;
  currency: string;
  type?: string;
  lotsize?: number;
  facevalue?: number;
  cfiCode?: string;
  cancellation?: Date;
  minstep: number;
  rating?: number;
  marginbuy?: number;
  marginsell?: number;
  marginrate?: number;
  pricestep?: number;
  priceMax?: number;
  priceMin?: number;
  theorPrice?: number;
  theorPriceLimit?: number;
  volatility?: number;
  yield?: number | null;
  tradingStatus?: TradingStatus;
  tradingStatusInfo?: string;
  complexProductCategory?: string;
}
