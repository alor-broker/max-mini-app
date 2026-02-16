import { InstrumentKey } from "@api-lib";

export interface EvaluationRequest {
  price: number;
  lotQuantity: number;
  instrument: InstrumentKey;
  portfolio: string;
}

export interface Evaluation {
  portfolio: string;
  ticker: string;
  exchange: string;
  quantityToSell: number;
  quantityToBuy: number;
  notMarginQuantityToSell: number;
  notMarginQuantityToBuy: number;
  orderEvaluation: number;
  commission: number;
  price?: number;
}
