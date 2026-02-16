import {
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';
import {
  shareReplay,
  switchMap
} from "rxjs";
import {
  ApiResponse,
  OrderStatus,
  PortfolioOrder,
  PortfolioOrdersService,
  Side
} from "@api-lib";
import { SelectedPortfolioDataContextService } from "../../services/selected-portfolio-data-context.service";
import { InstrumentIconSourceService } from "../../../core/services/instrument-icon-source.service";
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
import { Portfolio } from "../../../core/models/porfolio.models";
import { NzSkeletonComponent } from "ng-zorro-antd/skeleton";
import { TranslocoDirective } from "@jsverse/transloco";
import { OrdersRefreshService } from "../../services/orders-refresh.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'tga-orders-list',
  standalone: true,
  imports: [
    NzAvatarComponent,
    NgClass,
    AsyncPipe,
    NzTypographyComponent,
    DecimalPipe,
    NzIconDirective,
    ListComponent,
    ListItemComponent,
    NzSkeletonComponent,
    TranslocoDirective
  ],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.less'
})
export class OrdersListComponent implements OnInit {
  orders$!: ApiResponse<PortfolioOrder[]>;

  @Output()
  selectItem = new EventEmitter<Pick<PortfolioOrder, 'portfolio' | 'exchange' | 'id' | 'type'>>();

  readonly Sides = Side;
  readonly Statuses = OrderStatus;

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
          switchMap(() => this.apiPortfolioOrdersService.getSessionLimitMarketOrders(portfolio.portfolioKey))
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
