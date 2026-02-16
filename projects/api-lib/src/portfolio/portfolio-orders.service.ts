import { Injectable } from '@angular/core';
import { BaseHttpApiService } from "../base-http-api.service";
import {
  ApiConfig,
  ApiConfigProvider,
  ApiErrorsTracker,
  ApiRequestOptions,
  ApiResponse,
  PortfolioKey,
  PortfolioOrder,
  PortfolioStopOrder
} from "@api-lib";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PortfolioOrdersService extends BaseHttpApiService {
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

  getSessionLimitMarketOrders(portfolioKey: PortfolioKey, options?: ApiRequestOptions): ApiResponse<PortfolioOrder[]> {
    return this.sendRequest(
      config => this.httpClient.get<PortfolioOrder[]>(
        this.getLimitMarketOrdersInfoUrl(config, portfolioKey),
        {
          params: {
            format: 'heavy'
          }
        }
      ),
      options,
      response => response.map(r => this.fixDates(r))
    );
  }

  getLimitMarketOrderDetails(portfolioKey: PortfolioKey, orderId: string, options?: ApiRequestOptions): ApiResponse<PortfolioOrder> {
    return this.sendRequest(
      config => this.httpClient.get<PortfolioOrder>(
        `${this.getLimitMarketOrdersInfoUrl(config, portfolioKey)}/${orderId}`,
        {
          params: {
            format: 'heavy'
          }
        }
      ),
      options,
      response => this.fixDates(response)
    );
  }

  getSessionStopOrders(portfolioKey: PortfolioKey, options?: ApiRequestOptions): ApiResponse<PortfolioStopOrder[]> {
    return this.sendRequest(
      config => this.httpClient.get<PortfolioStopOrder[]>(
        this.getStopOrdersInfoUrl(config, portfolioKey),
        {
          params: {
            format: 'heavy'
          }
        }
      ),
      options,
      response => response.map(r => this.fixDates(r))
    );
  }

  getStopOrderDetails(portfolioKey: PortfolioKey, orderId: string, options?: ApiRequestOptions): ApiResponse<PortfolioStopOrder> {
    return this.sendRequest(
      config => this.httpClient.get<PortfolioStopOrder>(
        `${this.getStopOrdersInfoUrl(config, portfolioKey)}/${orderId}`,
        {
          params: {
            format: 'heavy'
          }
        }
      ),
      options,
      response => this.fixDates(response)
    );
  }

  private getLimitMarketOrdersInfoUrl(config: ApiConfig, portfolioKey: PortfolioKey): string {
    return `${config.apiUrl}/md/v2/Clients/${portfolioKey.exchange}/${portfolioKey.portfolio}/orders`
  }

  private getStopOrdersInfoUrl(config: ApiConfig, portfolioKey: PortfolioKey): string {
    return `${config.apiUrl}/md/v2/Clients/${portfolioKey.exchange}/${portfolioKey.portfolio}/stoporders`
  }

  private fixDates<T extends PortfolioOrder>(order: T): T {
    return {
      ...order,
      transTime: new Date(order.transTime),
      updateTime: order.updateTime != null ? new Date(order.updateTime) : null,
      endTime: new Date(order.endTime)
    }
  }
}
