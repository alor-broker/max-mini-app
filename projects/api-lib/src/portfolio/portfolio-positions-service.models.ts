export interface PortfolioPosition {
  symbol: string;
  brokerSymbol: string;
  exchange: string;
  shortName: string;
  portfolio: string;
  volume: number;
  currentVolume: number;
  avgPrice: number;
  qtyUnits: number;
  openUnits: number;
  lotSize: number;
  qtyT0: number;
  qtyT1: number;
  qtyT2: number;
  qtyTFuture: number;
  qtyT0Batch: number;
  qtyT1Batch: number;
  qtyT2Batch: number;
  qtyTFutureBatch: number;
  openQtyBatch: number;
  open: number;
  dailyUnrealisedPl: number;
  unrealisedPl: number;
  isCurrency: boolean;
  existing: boolean;
}
