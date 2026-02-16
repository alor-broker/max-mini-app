import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DatePipe } from "@angular/common";
import { NzDescriptionsComponent, NzDescriptionsItemComponent } from "ng-zorro-antd/descriptions";
import { PortfolioTrade, Side } from "@api-lib";
import { BackButtonService } from "@environment-services-lib";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: 'tga-trade-item',
  standalone: true,
  imports: [
    DatePipe,
    NzDescriptionsComponent,
    NzDescriptionsItemComponent,
    TranslocoDirective
  ],
  templateUrl: './trade-item.component.html'
})
export class TradeItemComponent implements OnInit, OnDestroy {
  @Input({ required: true }) trade!: PortfolioTrade;
  @Output() onBack = new EventEmitter();

  side = Side;

  constructor(private readonly backButtonService: BackButtonService) {
  }

  private onBackButtonCallback = () => {
    this.onBack.emit();
    this.backButtonService.hide();
  }

  ngOnInit() {
    this.backButtonService.onClick(this.onBackButtonCallback)
    this.backButtonService.show();
  }

  ngOnDestroy() {
    this.backButtonService.offClick(this.onBackButtonCallback);
  }
}
