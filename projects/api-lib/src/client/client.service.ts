import { Injectable } from '@angular/core';
import {
  ApiConfig,
  ApiConfigProvider
} from "../api-config-provider";
import { ApiErrorsTracker } from "../api-errors-tracker";
import { HttpClient } from "@angular/common/http";
import {
  ApiRequestOptions,
  ApiResponse
} from "../models/public.models";
import { BaseHttpApiService } from "../base-http-api.service";
import {
  ClientFullName,
  ClientPortfolio
} from "./client-service.models";

@Injectable({
  providedIn: 'root'
})
export class ClientService extends BaseHttpApiService {
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

  getFullName(login: string, options?: ApiRequestOptions): ApiResponse<ClientFullName> {
    return this.sendRequest(
      (config) => this.httpClient.get<ClientFullName>(
        `${this.getClientInfoUrl(config)}/users/${login}/full-name`
      ),
      options
    );
  }

  getPortfolios(clientId: string, options?: ApiRequestOptions): ApiResponse<ClientPortfolio[]> {
    return this.sendRequest(
      config => this.httpClient.get<ClientPortfolio[]>(
        `${this.getClientInfoUrl(config)}/users/${clientId}/all-portfolios`
      ),
      options
    );
  }

  private getClientInfoUrl(config: ApiConfig): string {
    return `${config.userDataUrl}/client/v1.0`
  }
}
