import { Injectable } from '@angular/core';
import { BaseHttpApiService } from "../base-http-api.service";
import { ApiConfigProvider, ApiErrorsTracker, ApiRequestOptions, ApiResponse } from "@api-lib";
import { HttpClient } from "@angular/common/http";
import { Quote } from "./quotes-service.model";

@Injectable({
  providedIn: 'root'
})
export class QuotesService extends BaseHttpApiService {

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

  getLastQuoteInfo(symbol: string, exchange: string, options?: ApiRequestOptions): ApiResponse<Quote> {
    return this.sendRequest<Quote, Quote[]>(
      config => this.httpClient.get<Quote[]>(`${config.apiUrl}/md/v2/Securities/${exchange}:${symbol}/quotes`),
      options,
      quotes => quotes[0] ?? null
    );
  }
}
