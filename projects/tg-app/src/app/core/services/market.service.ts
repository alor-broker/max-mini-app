import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, shareReplay } from "rxjs";
import { map } from "rxjs/operators";
import { CurrencySettings, MarketSettings } from "../models/market-settings.model";

@Injectable({
  providedIn: 'root'
})
export class MarketService {

  private settings$?: Observable<MarketSettings>;

  constructor(
    private readonly http: HttpClient
  ) {}

  getMarketSettings(): Observable<MarketSettings> {
    if (!this.settings$) {
      this.settings$ = this.http.get<MarketSettings>(
          './market-settings-config.json',
          {
            headers: {
              "Cache-Control": "no-cache",
              "Pragma": "no-cache"
            }
          }
        )
        .pipe(
          shareReplay(1)
        );
    }

    return this.settings$;
  }

  getDefaultExchange(): Observable<string | undefined> {
    return this.getMarketSettings().pipe(
      map(x => x.exchanges.find(ex => ex.settings.isDefault)?.exchange)
    );
  }

  getCurrenciesSettings(): Observable<CurrencySettings> {
    return this.getMarketSettings().pipe(
      map(x => x.currencies)
    );
  }
}
