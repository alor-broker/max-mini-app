import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {
  ApiResponse,
  OrdersService,
  OrderStatus,
  OrderType,
  PortfolioOrder,
  PortfolioStopOrder,
  Side,
  StopOrderCondition
} from "@api-lib";
import { NzDescriptionsComponent, NzDescriptionsItemComponent } from "ng-zorro-antd/descriptions";
import { BackButtonService, ButtonType, ModalService } from "@environment-services-lib";
import { AsyncPipe, DatePipe, NgClass } from "@angular/common";
import { OrderConditionPipe } from "../../../core/pipes/order-condition.pipe";
import { SectionsComponent } from "../../../core/components/sections/sections/sections/sections.component";
import { SectionPanelComponent } from "../../../core/components/sections/section-panel/section-panel.component";
import { TranslocoDirective } from "@jsverse/transloco";
import { NzButtonComponent } from "ng-zorro-antd/button";
import { TranslatorFn, TranslatorService } from "../../../core/services/translator.service";
import { BehaviorSubject, Observable, shareReplay, switchMap, tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { OrderApiErrorsTracker } from "../../../core/utils/order-api-errors-tracker";
import { OrderActionType } from "../../../core/models/order-api-errors-tracker.model";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { OrdersRefreshService } from "../../services/orders-refresh.service";


@Component({
  selector: 'tga-order-item',
  standalone: true,
  imports: [
    NzDescriptionsComponent,
    NzDescriptionsItemComponent,
    DatePipe,
    OrderConditionPipe,
    NgClass,
    SectionsComponent,
    SectionPanelComponent,
    TranslocoDirective,
    NzButtonComponent,
    AsyncPipe,
    NzIconDirective,
  ],
  providers: [OrderApiErrorsTracker],
  templateUrl: './order-item.component.html'
})
export class OrderItemComponent implements OnInit, OnDestroy {
  @Input({ required: true }) orderData!: Pick<PortfolioOrder, 'portfolio' | 'exchange' | 'id' | 'type'>;
  @Output() onBack = new EventEmitter();

  orderSide = Side;
  orderStatus = OrderStatus;
  orderType = OrderType;

  order$!: ApiResponse<PortfolioStopOrder | PortfolioOrder>;
  isLoading$ = new BehaviorSubject(false);

  private ordersTranslator!: Observable<TranslatorFn>;

  constructor(
    private readonly backButtonService: BackButtonService,
    private readonly ordersService: OrdersService,
    private readonly modalService: ModalService,
    private readonly translatorService: TranslatorService,
    private readonly orderApiErrorsTracker: OrderApiErrorsTracker,
    private readonly cdr: ChangeDetectorRef,
    private readonly ordersRefreshService: OrdersRefreshService,
    private readonly destroyRef: DestroyRef
  ) {
  }

  private onBackButtonCallback = () => {
    this.onBack.emit();
    this.backButtonService.hide();
  }

  ngOnInit() {
    this.backButtonService.onClick(this.onBackButtonCallback)
    this.backButtonService.show();

    this.getOrder();

    this.ordersTranslator = this.translatorService.getTranslator('home/order-item')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        shareReplay(1)
      );

    this.orderApiErrorsTracker.setActionType(OrderActionType.Cancel);
  }

  ngOnDestroy() {
    this.backButtonService.offClick(this.onBackButtonCallback);
  }

  getOrderStopPrice(order: PortfolioStopOrder | PortfolioOrder): number | null {
    return (order as PortfolioStopOrder).stopPrice ?? null
  }

  getOrderCondition(order: PortfolioStopOrder | PortfolioOrder): StopOrderCondition | null {
    return (order as PortfolioStopOrder).condition ?? null
  }

  cancelOrder() {
    this.ordersTranslator
      .pipe(
        switchMap(t => this.modalService.showMessage({
            message: t([ 'cancelModalMessage' ]),
            buttons: [
              { type: ButtonType.Default, text: t([ 'no' ]) },
              { type: ButtonType.Destructive, text: t([ 'yes' ]), id: 'yes' }
            ]
          })
        )
      )
      .subscribe(btnId => {
        if (btnId === 'yes') {
          this.ordersService.cancelOrder(
              this.orderData.id,
              {
                portfolio: this.orderData.portfolio,
                exchange: this.orderData.exchange,
                stop: this.orderData.type === OrderType.StopMarket || this.orderData.type === OrderType.StopLimit
              },
              { errorTracker: this.orderApiErrorsTracker }
            )
            .subscribe((res) => {
              if (res?.message === 'success') {
                this.ordersRefreshService.refreshOrders();
                this.getOrder();
                this.cdr.detectChanges();
              }
            })
        }
      })
  }

  private getOrder() {
    this.isLoading$.next(true);
    this.order$ = this.ordersService.getOrder(this.orderData)
      .pipe(
        tap(() => this.isLoading$.next(false))
      );
  }
}
