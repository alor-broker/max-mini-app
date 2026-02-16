import { Injectable } from '@angular/core';
import { ApiConfigProvider, ApiErrorsTracker, ApiRequestOptions, ApiResponse, SearchFilter } from "@api-lib";
import { HttpClient } from "@angular/common/http";
import { BaseHttpApiService } from "../base-http-api.service";
import { Instrument, InstrumentKey } from "./instruments-service.model";

@Injectable({
  providedIn: 'root'
})
export class InstrumentsService extends BaseHttpApiService {

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

  searchInstruments(filters: SearchFilter, options?: ApiRequestOptions): ApiResponse<Instrument[]> {
    return this.sendRequest<Instrument[]>(
      (config) => this.httpClient.get<Instrument[]>(
        `${this.getInstrumentsUrl(config.apiUrl)}`,
        {
          params: {
            ...filters,
            IncludeUnknownBoards: false
          }
        }
      ),
      options,
      (res) => res.map(r => ({
        ...r,
        board: r.board ?? r.primary_board,
        minstep: r.minstep ?? 0.01
      }))
    )
  }

  getInstrument(instrument: InstrumentKey, options?: ApiRequestOptions): ApiResponse<Instrument> {
    return this.sendRequest<Instrument>(
      (config) => this.httpClient.get<Instrument>(
        `${this.getInstrumentsUrl(config.apiUrl)}/${instrument.exchange}/${instrument.symbol}`
      ),
      options,
      (res) => ({
        ...res,
        board: res.board ?? res.primary_board,
        minstep: res.minstep ?? 0.01
      })
    )
  }

  private getInstrumentsUrl(apiUrl: string) {
    return `${apiUrl}/md/v2/Securities`
  }
}
