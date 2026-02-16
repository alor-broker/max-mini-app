import { LessMore, Side } from "../models/api.enums";
import { InstrumentKey } from "../instruments/instruments-service.model";

export interface NewOrder {
  side: Side;
  instrument: InstrumentKey;
  quantity: number;
}

export interface NewMarketOrder extends NewOrder {}

export interface NewLimitOrder extends NewOrder {
  price: number;
}

export interface NewStopMarketOrder extends NewOrder {
  triggerPrice: number;
  condition: LessMore;
  stopEndUnixTime?: number;
}

export interface NewStopLimitOrder extends NewStopMarketOrder {
  price: number;
}

export interface NewOrderResponse {
  message: string;
  orderNumber: string;
}

export interface CancelOrderResponse extends NewOrderResponse {}
