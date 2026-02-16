import { Injectable } from '@angular/core';
import { BaseHttpApiService } from "../base-http-api.service";
import {
  ApiConfig,
  ApiConfigProvider,
  ApiErrorsTracker,
  ApiRequestOptions,
  ApiResponse,
  PortfolioFortsRisks,
  PortfolioKey,
  PortfolioRisks,
  PortfolioSummary
} from "@api-lib";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PortfolioSummaryService extends BaseHttpApiService {

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

  getPortfolioSummary(portfolioKey: PortfolioKey, options?: ApiRequestOptions): ApiResponse<PortfolioSummary> {
    return this.sendRequest(
      config => this.httpClient.get<PortfolioSummary>(`${this.getPortfolioInfoBaseUrl(config, portfolioKey)}/summary`),
      options
    );
  }

  getPortfolioRisks(portfolioKey: PortfolioKey, options?: ApiRequestOptions): ApiResponse<PortfolioRisks> {
    return this.sendRequest(
      config => this.httpClient.get<PortfolioRisks>(`${this.getPortfolioInfoBaseUrl(config, portfolioKey)}/risk`),
      options
    );
  }

  getPortfolioFortsRisks(portfolioKey: PortfolioKey, options?: ApiRequestOptions): ApiResponse<PortfolioFortsRisks> {
    return this.sendRequest(
      config => this.httpClient.get<PortfolioFortsRisks>(`${this.getPortfolioInfoBaseUrl(config, portfolioKey)}/fortsrisk`),
      options
    );
  }

  private getPortfolioInfoBaseUrl(config: ApiConfig, portfolioKey: PortfolioKey): string {
    return `${config.apiUrl}/md/v2/Clients/${portfolioKey.exchange}/${portfolioKey.portfolio}`
  }
}
