import { Injectable } from '@angular/core';
import { BaseHttpApiService } from "../base-http-api.service";
import {
  ApiConfigProvider,
  ApiErrorsTracker,
  ApiRequestOptions,
  ApiResponse,
  InvestmentIdea,
  InvestmentIdeaAuthor, InvestmentIdeasFilters
} from "@api-lib";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class InvestmentIdeasService extends BaseHttpApiService {

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

  getInvestmentIdeas(filters: InvestmentIdeasFilters = {}, options?: ApiRequestOptions): ApiResponse<InvestmentIdea[]> {
    return this.sendRequest(
      (config) => this.httpClient.get<InvestmentIdea[]>(
        `${config.superAppUrl}/autofollow/signals`,
        {
          params: filters as any
        }
      ),
      options,
      (res) => res?.map(idea => ({
        ...idea,
        timestamp: new Date(idea.timestamp),
        validTo: idea.validTo == null ? null : new Date(idea.validTo)
      }))
    );
  }

  getAuthors(options?: ApiRequestOptions): ApiResponse<InvestmentIdeaAuthor[]> {
    return this.sendRequest(
      (config) => this.httpClient.get<InvestmentIdeaAuthor[]>(`${config.superAppUrl}/autofollow/authors`),
      options
    )
  }
}
