import { Injectable } from '@angular/core';
import { ApiConfigProvider, ApiErrorsTracker, ApiResponse } from "@api-lib";
import { BaseHttpApiService } from "../base-http-api.service";
import { HttpClient } from "@angular/common/http";
import { Evaluation, EvaluationRequest } from "./evaluation-service.model";

@Injectable({
  providedIn: 'root'
})
export class EvaluationService extends BaseHttpApiService {

  constructor(
    configProvider: ApiConfigProvider,
    errorsTracker: ApiErrorsTracker,
    httpClient: HttpClient
  ) {
    super(
      configProvider,
      errorsTracker,
      httpClient
    );
  }

  evaluateOrder(req: EvaluationRequest): ApiResponse<Evaluation> {
    return this.sendRequest<Evaluation>(
      (config) => this.httpClient.post<Evaluation>(
        `${config.apiUrl}/commandapi/warptrans/FX1/v2/client/orders/estimate`,
        {
          portfolio: req.portfolio,
          ticker: req.instrument.symbol,
          exchange: req.instrument.exchange,
          board: req.instrument.board,
          price: req.price,
          lotQuantity: req.lotQuantity,
          includeLimitOrders: true
        }
      ),
    );
  }
}
