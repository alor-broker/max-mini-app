import {
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';
import {
  ApiResponse,
  OrderStatus,
  OrderType,
  PortfolioOrder,
  PortfolioOrdersService,
  PortfolioStopOrder,
  Side
} from "@api-lib";
import {
  shareReplay,
  switchMap
} from "rxjs";
import { SelectedPortfolioDataContextService } from "../../services/selected-portfolio-data-context.service";
import { InstrumentIconSourceService } from "../../../core/services/instrument-icon-source.service";
import {
  AsyncPipe,
  DecimalPipe,
  NgClass
} from "@angular/common";
import { ListComponent } from "../../../core/components/list/list/list.component";
import { ListItemComponent } from "../../../core/components/list/list-item/list-item.component";
import { NzAvatarComponent } from "ng-zorro-antd/avatar";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { NzTypographyComponent } from "ng-zorro-antd/typography";
import { Portfolio } from "../../../core/models/porfolio.models";
import { NzSkeletonComponent } from "ng-zorro-antd/skeleton";
import { TranslocoDirective } from "@jsverse/transloco";
import { OrdersRefreshService } from "../../services/orders-refresh.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'tga-stop-orders-list',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    ListComponent,
    ListItemComponent,
    NzAvatarComponent,
    NzIconDirective,
    NzTypographyComponent,
    NgClass,
    NzSkeletonComponent,
    TranslocoDirective
  ],
  templateUrl: './stop-orders-list.component.html',
  styleUrl: './stop-orders-list.component.less'
})
export class StopOrdersListComponent implements OnInit {
  orders$!: ApiResponse<PortfolioStopOrder[]>;

  @Output()
  selectItem = new EventEmitter<Pick<PortfolioOrder, 'portfolio' | 'exchange' | 'id' | 'type'>>();

  readonly Sides = Side;
  readonly Statuses = OrderStatus;
  readonly OrderTypes = OrderType;

  constructor(
    private readonly selectedPortfolioDataContextService: SelectedPortfolioDataContextService,
    private readonly apiPortfolioOrdersService: PortfolioOrdersService,
    private readonly instrumentIconSourceService: InstrumentIconSourceService,
    private readonly ordersRefreshService: OrdersRefreshService,
    private readonly destroyRef: DestroyRef
  ) {
  }

  ngOnInit(): void {
    const getOrders = (portfolio: Portfolio) => {
      return this.ordersRefreshService.refresh$
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          switchMap(() => this.apiPortfolioOrdersService.getSessionStopOrders(portfolio.portfolioKey))
        );
    }

    this.orders$ = this.selectedPortfolioDataContextService.selectedPortfolio$.pipe(
      switchMap(p => getOrders(p)),
      shareReplay(1)
    )
  }

  getIconUrl(order: PortfolioOrder): string {
    return this.instrumentIconSourceService.getIconUrl(order.symbol);
  }

  selectOrder(order: PortfolioOrder) {
    this.selectItem.emit({
      id: order.id,
      portfolio: order.portfolio,
      exchange: order.exchange,
      type: order.type
    })
  }
}
