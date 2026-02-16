import { Injectable } from '@angular/core';
import { BaseHttpApiService } from "../base-http-api.service";
import {
  ApiConfig,
  ApiConfigProvider,
  ApiErrorsTracker,
  ApiRequestOptions,
  ApiResponse,
  PortfolioKey,
  PortfolioPosition,
} from "@api-lib";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PortfolioPositionsService extends BaseHttpApiService {

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

  getAllForClient(login: string, options?: ApiRequestOptions): ApiResponse<PortfolioPosition[]> {
    return this.sendRequest(
      (config) => this.httpClient.get<PortfolioPosition[]>(
        `${this.getPositionsInfoUrl(config)}/${login}/positions`
      ),
      options
    );
  }

  getAllForPortfolio(
    portfolioKey: PortfolioKey,
    options?: ApiRequestOptions
  ): ApiResponse<PortfolioPosition[]> {
    return this.sendRequest(
      (config) => this.httpClient.get<PortfolioPosition[]>(
        `${this.getPositionsInfoUrl(config)}/${portfolioKey.exchange}/${portfolioKey.portfolio}/positions`
      ),
      options
    );
  }

  private getPositionsInfoUrl(config: ApiConfig): string {
    return `${config.apiUrl}/md/v2/Clients`
  }
}
