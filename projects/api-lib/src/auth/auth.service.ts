import { Injectable } from '@angular/core';
import { BaseHttpApiService } from "../base-http-api.service";
import {
  HttpClient,
  HttpContext
} from "@angular/common/http";
import {
  ApiConfig,
  ApiConfigProvider,
  ApiErrorsTracker,
  ApiRequestOptions,
  ApiResponse
} from "@api-lib";
import { RefreshJwtTokenResponse } from "./auth-service.models";
import { map } from "rxjs";
import { HttpContextTokens } from "../http.constants";

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseHttpApiService {
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

  refreshJwtToken(refreshToken: string, options?: ApiRequestOptions): ApiResponse<RefreshJwtTokenResponse> {
    return this.sendRequest(
      config => this.httpClient.post<RefreshJwtTokenResponse>(
        `${this.getAuthActionsUrl(config)}/refresh`,
        {
          refreshToken: refreshToken
        },
        {
          context: new HttpContext().set(HttpContextTokens.SkipAuthorization, true)
        }
      ),
      options,
      response => ({
        ...response,
        refreshExpiresAt: new Date(response.refreshExpiresAt)
      })
    );
  }

  deleteJwtToken(refreshToken: string, options?: ApiRequestOptions): ApiResponse<boolean> {
    return this.sendRequest(
      config => this.httpClient.delete(`${this.getAuthActionsUrl(config)}/refresh/refreshToken`),
      options
    ).pipe(
      map(r => r != null)
    );
  }

  private getAuthActionsUrl(config: ApiConfig): string {
    return `${config.userDataUrl}/auth/actions`
  }
}
