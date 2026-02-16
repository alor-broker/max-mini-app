import {
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';
import { SelectedPortfolioDataContextService } from "../../services/selected-portfolio-data-context.service";
import {
  ApiResponse,
  PortfolioTrade,
  PortfolioTradesService,
  Side
} from "@api-lib";
import { InstrumentIconSourceService } from "../../../core/services/instrument-icon-source.service";
import {
  shareReplay,
  switchMap
} from "rxjs";
import { NzAvatarComponent } from "ng-zorro-antd/avatar";
import {
  AsyncPipe,
  DecimalPipe,
  NgClass
} from "@angular/common";
import { NzTypographyComponent } from "ng-zorro-antd/typography";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { ListComponent } from "../../../core/components/list/list/list.component";
import { ListItemComponent } from "../../../core/components/list/list-item/list-item.component";
import { NzSkeletonComponent } from "ng-zorro-antd/skeleton";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: 'tga-trades-list',
  standalone: true,
  imports: [
    NzAvatarComponent,
    AsyncPipe,
    DecimalPipe,
    NzTypographyComponent,
    NgClass,
    NzIconDirective,
    ListComponent,
    ListItemComponent,
    NzSkeletonComponent,
    TranslocoDirective
  ],
  templateUrl: './trades-list.component.html',
  styleUrl: './trades-list.component.less'
})
export class TradesListComponent implements OnInit {
  trades$!: ApiResponse<PortfolioTrade[]>;

  @Output()
  selectItem = new EventEmitter<PortfolioTrade>();

  readonly Sides = Side;

  constructor(
    private readonly selectedPortfolioDataContextService: SelectedPortfolioDataContextService,
    private readonly apiPortfolioTradesService: PortfolioTradesService,
    private readonly instrumentIconSourceService: InstrumentIconSourceService
  ) {
  }

  ngOnInit(): void {
    this.trades$ = this.selectedPortfolioDataContextService.selectedPortfolio$.pipe(
      switchMap(p => this.apiPortfolioTradesService.getSessionTrades(p.portfolioKey)),
      shareReplay(1)
    )
  }

  getIconUrl(trade: PortfolioTrade): string {
    return this.instrumentIconSourceService.getIconUrl(trade.symbol);
  }
}
