import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  NzCollapseComponent,
  NzCollapsePanelComponent
} from "ng-zorro-antd/collapse";
import { PortfolioSelectionComponent } from "../../components/portfolio-selection/portfolio-selection.component";
import { PortfolioEvaluationComponent } from "../../components/portfolio-evaluation/portfolio-evaluation.component";
import { PositionsListComponent } from "../../components/positions-list/positions-list.component";
import { TradesListComponent } from "../../components/trades-list/trades-list.component";
import { OrdersListComponent } from "../../components/orders-list/orders-list.component";
import { SectionsComponent } from "../../../core/components/sections/sections/sections/sections.component";
import { SectionPanelComponent } from "../../../core/components/sections/section-panel/section-panel.component";
import { NzButtonComponent } from "ng-zorro-antd/button";
import { BehaviorSubject } from "rxjs";
import { BackButtonService } from "@environment-services-lib";
import { AsyncPipe } from "@angular/common";
import {
  NzDrawerComponent,
  NzDrawerContentDirective
} from "ng-zorro-antd/drawer";
import { InvestmentIdeasComponent } from "../../components/investment-ideas/investment-ideas.component";
import { OrderItemComponent } from "../../components/order-item/order-item.component";
import { TradeItemComponent } from "../../components/trade-item/trade-item.component";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { StopOrdersListComponent } from "../../components/stop-orders-list/stop-orders-list.component";
import { LinksComponent } from "../../components/links/links.component";
import { RouterLink } from "@angular/router";
import { InvestmentIdeasPreviewComponent } from "../../components/investment-ideas-preview/investment-ideas-preview.component";
import { TranslocoDirective } from "@jsverse/transloco";

enum SelectedItemType {
  InvestingIdeas = 'investingIdeas',
  Order = 'order',
  Trade = 'trade'
}

interface DrawerContext {
  isVisible: boolean,
  itemType?: SelectedItemType,
  data?: any
}

@Component({
  selector: 'tga-home-page',
  standalone: true,
  imports: [
    NzCollapseComponent,
    NzCollapsePanelComponent,
    PortfolioSelectionComponent,
    PortfolioEvaluationComponent,
    PositionsListComponent,
    TradesListComponent,
    OrdersListComponent,
    SectionsComponent,
    SectionPanelComponent,
    NzButtonComponent,
    AsyncPipe,
    NzDrawerComponent,
    NzDrawerContentDirective,
    InvestmentIdeasComponent,
    OrderItemComponent,
    TradeItemComponent,
    NzIconDirective,
    StopOrdersListComponent,
    LinksComponent,
    RouterLink,
    InvestmentIdeasPreviewComponent,
    TranslocoDirective
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.less'
})
export class HomePageComponent implements OnInit, OnDestroy {
  readonly SubviewTypes = SelectedItemType;

  readonly drawerContext$ = new BehaviorSubject<DrawerContext>({ isVisible: false })
  isBackButtonAvailable = false;

  isInvestmentIdeasUnauthorizedError = false;

  constructor(
    private readonly backButtonService: BackButtonService
  ) {
  }

  ngOnDestroy(): void {
    this.drawerContext$.complete();
  }

  ngOnInit(): void {
    this.isBackButtonAvailable = this.backButtonService.isAvailable;
  }

  openSubview(itemType: SelectedItemType, data?: any) {
    this.drawerContext$.next({
      isVisible: true,
      itemType,
      data
    });
  }

  closeSubview(): void {
    this.drawerContext$.next({
      isVisible: false
    });
  }

  onInvestmentIdeasUnauthorizedError() {
    this.isInvestmentIdeasUnauthorizedError = true;
  }
}
