import { Injectable } from '@angular/core';
import { BaseHttpApiService } from "../base-http-api.service";
import {
  ApiConfig,
  ApiConfigProvider,
  ApiErrorsTracker,
  ApiRequestOptions,
  ApiResponse,
  PortfolioKey,
  PortfolioTrade
} from "@api-lib";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PortfolioTradesService extends BaseHttpApiService {
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

  getSessionTrades(
    portfolioKey: PortfolioKey,
    withRepoTrades = false,
    options?: ApiRequestOptions
  ): ApiResponse<PortfolioTrade[]> {
    return this.sendRequest(
      (config) => this.httpClient.get<PortfolioTrade[]>(
        `${this.getClientInfoUrl(config)}/${portfolioKey.exchange}/${portfolioKey.portfolio}/trades`,
        {
          params: {
            withRepo: withRepoTrades,
            format: 'heavy'
          }
        }
      ),
      options,
      response => response.map(r => this.fixDates(r))
    );
  }

  getTradesHistoryForPortfolio(
    portfolioKey: PortfolioKey,
    cursor?: Partial<{
      from: string | null;
      limit: number | null;
    }>,
    options?: ApiRequestOptions
  ): ApiResponse<PortfolioTrade[]> {
    return this.getTradesHistory(
      portfolioKey,
      null,
      cursor,
      options
    )
  }

  getTradesHistoryForSymbol(
    portfolioKey: PortfolioKey,
    symbol: string,
    cursor?: Partial<{
      from: string | null;
      limit: number | null;
    }>,
    options?: ApiRequestOptions
  ): ApiResponse<PortfolioTrade[]> {
    return this.getTradesHistory(
      portfolioKey,
      symbol,
      cursor,
      options
    )
  }

  private getTradesHistory(
    portfolioKey: PortfolioKey,
    symbol: string | null,
    cursor?: Partial<{
      from: string | null;
      limit: number | null;
    }>,
    options?: ApiRequestOptions
  ): ApiResponse<PortfolioTrade[]> {
    let params: { [propName: string]: any } = {
      descending: true,
      format: 'heavy'
    };

    if (cursor != null) {
      if (cursor.limit != null) {
        params["limit"] = cursor.limit;
      }

      if (cursor.from != null) {
        params['from'] = cursor.from;
      }
    }

    return this.sendRequest(
      (config) => {
        let requestUrl = `${this.getClientInfoUrl(config)}/${portfolioKey.exchange}/${portfolioKey.portfolio}/history/trades`;
        if (symbol != null) {
          requestUrl = `${requestUrl}/${symbol}`
        }

        return this.httpClient.get<PortfolioTrade[]>(
          requestUrl,
          { params }
        )
      },
      options,
      response => response.map(r => this.fixDates(r))
    );
  }

  private fixDates(trade: PortfolioTrade): PortfolioTrade {
    return {
      ...trade,
      date: new Date(trade.date)
    }
  }

  private getClientInfoUrl(config: ApiConfig): string {
    return `${config.apiUrl}/md/v2/Clients`
  }
}
