import { Side } from "../models/api.enums";

export enum OrderType {
  Market = 'market',
  Limit = 'limit',
  StopMarket = 'stop',
  StopLimit = 'stoplimit'
}

export enum OrderStatus {
  Working = 'working',
  Filled = 'filled',
  Canceled = 'canceled',
  Rejected = 'rejected'
}

export enum OrderTimeInForce {
  OneDay = 'oneday',
  ImmediateOrCancel = 'immediateorcancel',
  FillOrKill = 'fillorkill',
  AtTheClose = 'attheclose',
  GoodTillCancelled = 'goodtillcancelled'
}

export enum StopOrderCondition {
  More = 'more',
  MoreOrEqual = 'moreorequal',
  Less = 'less',
  LessOrEqual = 'lessorequal',
}

export interface IcebergParameters {
  creationFixedQuantity?: number | null;
  creationVarianceQuantity?: number | null;
  visibleQuantity?: number | null;
  visibleQuantityBatch?: number | null;
  visibleFilledQuantity?: number | null;
  visibleFilledQuantityBatch?: number | null;
}

export interface PortfolioOrder {
  id: string;
  symbol: string;
  exchange: string;
  board: string;
  brokerSymbol: string;
  portfolio: string;
  type: OrderType;
  side: Side;
  status: OrderStatus;
  transTime: Date;
  endTime: Date;
  updateTime: Date | null;
  qtyUnits: number;
  qtyBatch: number;
  filledQtyUnits: number;
  filledQtyBatch?: number;
  price: number;
  existing: boolean;
  volume: number | null;
  timeInForce?: OrderTimeInForce;
  iceberg?: IcebergParameters | null;
  comment?: string;
}

export interface PortfolioStopOrder extends PortfolioOrder {
  condition: StopOrderCondition;
  stopPrice: number;
}
