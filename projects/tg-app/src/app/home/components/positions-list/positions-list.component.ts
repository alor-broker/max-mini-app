import {
  Component,
  OnInit
} from '@angular/core';
import { SelectedPortfolioDataContextService } from "../../services/selected-portfolio-data-context.service";
import {
  ApiResponse,
  InstrumentKey,
  PortfolioPosition,
  PortfolioPositionsService
} from "@api-lib";
import {
  Observable,
  shareReplay,
  switchMap,
  take
} from "rxjs";
import { map } from "rxjs/operators";
import {
  AsyncPipe,
  DecimalPipe
} from "@angular/common";
import { NzTypographyComponent } from "ng-zorro-antd/typography";
import { NzAvatarComponent } from "ng-zorro-antd/avatar";
import { InstrumentIconSourceService } from "../../../core/services/instrument-icon-source.service";
import { ListItemComponent } from "../../../core/components/list/list-item/list-item.component";
import { ListComponent } from "../../../core/components/list/list/list.component";
import { NzSkeletonComponent } from "ng-zorro-antd/skeleton";
import { Router } from "@angular/router";
import { RoutesHelper } from "../../../core/utils/routes.helper";
import { TranslocoDirective } from "@jsverse/transloco";
import { MarketService } from "../../../core/services/market.service";

@Component({
  selector: 'tga-positions-list',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    NzTypographyComponent,
    NzAvatarComponent,
    ListItemComponent,
    ListComponent,
    NzSkeletonComponent,
    TranslocoDirective
  ],
  templateUrl: './positions-list.component.html'
})
export class PositionsListComponent implements OnInit {
  positions$!: ApiResponse<PortfolioPosition[]>;

  constructor(
    private readonly selectedPortfolioDataContextService: SelectedPortfolioDataContextService,
    private readonly apiPortfolioPositionsService: PortfolioPositionsService,
    private readonly instrumentIconSourceService: InstrumentIconSourceService,
    private readonly marketService: MarketService,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    this.positions$ =
      this.selectedPortfolioDataContextService.selectedPortfolio$.pipe(
        switchMap(portfolio => this.apiPortfolioPositionsService.getAllForPortfolio(portfolio.portfolioKey)),
        shareReplay(1)
      );
  }

  showLots(position: PortfolioPosition): boolean {
    return position.symbol !== 'RUB'
  }

  positionTitle(position: PortfolioPosition): string {
    if (position.symbol !== 'RUB') {
      return position.shortName;
    }

    return 'Рубли'
  }

  iconSymbol(position: PortfolioPosition): string {
    if (position.symbol !== 'RUB') {
      return position.symbol;
    }

    return '₽'
  }

  getIconUrl(position: PortfolioPosition): string {
    return this.instrumentIconSourceService.getIconUrl(position.symbol);
  }

  createOrder(position: PortfolioPosition) {
    this.getInstrumentFromPortfolio(position)
      .pipe(take(1))
      .subscribe(instrument => {
        if (instrument == null) {
          return;
        }

        RoutesHelper.openFromRoot(
          this.router,
          RoutesHelper.appRoutes.createOrder,
          {
            ticker: this.getTickerString(instrument)
          }
        )
      });
  }

  private getTickerString(position: InstrumentKey): string {
    return `${position.exchange}:${position.symbol}`
  }

  private getInstrumentFromPortfolio(position: PortfolioPosition): Observable<null | InstrumentKey> {
    return this.marketService.getCurrenciesSettings()
      .pipe(
        map(currencies => {
          if (currencies.baseCurrency === position.symbol) {
            return null;
          }

          const mappedCurrency = currencies.portfolioCurrencies.find(c => c.positionSymbol === position.symbol);

          if (mappedCurrency != null) {
            if (mappedCurrency.exchangeInstrument == null) {
              return null;
            }

            return {
              symbol: mappedCurrency.exchangeInstrument.symbol,
              exchange: mappedCurrency.exchangeInstrument.exchange ?? currencies.defaultCurrencyExchange
            };
          }

          return { symbol: position.symbol, exchange: position.exchange }
        })
      )
  }
}
