import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NzButtonComponent } from "ng-zorro-antd/button";
import { Instrument, InstrumentKey, InstrumentsService } from "@api-lib";
import { SectionPanelComponent } from "../../../core/components/sections/section-panel/section-panel.component";
import { SectionsComponent } from "../../../core/components/sections/sections/sections/sections.component";
import { NzTabComponent, NzTabSetComponent } from "ng-zorro-antd/tabs";
import { InstrumentSelectComponent } from "../../components/instrument-select/instrument-select.component";
import { InstrumentInfoComponent } from "../../components/instrument-info/instrument-info.component";
import { BackButtonService } from "@environment-services-lib";
import { StopOrderFormComponent } from "../../components/order-forms/stop-order-form/stop-order-form.component";
import { LimitOrderFormComponent } from "../../components/order-forms/limit-order-form/limit-order-form.component";
import { Router } from "@angular/router";
import { RoutesHelper } from "../../../core/utils/routes.helper";
import { CommonParametersService } from "../../sevices/commom-parameters/common-parameters.service";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MarketOrderFormComponent } from "../../components/order-forms/market-order-form/market-order-form.component";
import { TranslocoDirective } from "@jsverse/transloco";
import { LinksComponent } from "../../../home/components/links/links.component";

@Component({
  selector: 'tga-create-order',
  standalone: true,
  imports: [
    NzButtonComponent,
    SectionPanelComponent,
    SectionsComponent,
    NzTabSetComponent,
    NzTabComponent,
    InstrumentSelectComponent,
    InstrumentInfoComponent,
    StopOrderFormComponent,
    LimitOrderFormComponent,
    ReactiveFormsModule,
    MarketOrderFormComponent,
    TranslocoDirective,
    LinksComponent
  ],
  providers: [ CommonParametersService ],
  templateUrl: './create-order-page.component.html',
  styleUrl: './create-order-page.component.less'
})
export class CreateOrderPageComponent implements OnInit, OnDestroy {

  instrumentSelectControl = new FormControl<Instrument | null>(null)
  selectedInstrument: Instrument | null = null;

  @Input()
  set ticker(ticker: string) {
    if (ticker == null) {
      return;
    }

    this.instrumentsService.getInstrument(this.getInstrumentKey(ticker))
      .subscribe(instrument => {
        if (instrument == null) {
          return;
        }

        this.instrumentSelectControl.setValue(instrument);
        this.selectedInstrument = instrument;
      })
  }

  constructor(
    private readonly backButtonService: BackButtonService,
    private readonly router: Router,
    private readonly instrumentsService: InstrumentsService,
    private readonly commonParametersService: CommonParametersService
  ) {
  }

  ngOnInit() {
    this.backButtonService.onClick(this.onBackButtonCallback);
    this.backButtonService.show();
  }

  ngOnDestroy() {
    this.backButtonService.offClick(this.onBackButtonCallback);
  }

  selectInstrument(instrument: Instrument | null) {
    this.selectedInstrument = instrument;
    this.commonParametersService.reset();
  }

  private onBackButtonCallback = () => {
    RoutesHelper.openFromRoot(this.router, RoutesHelper.appRoutes.home);
    this.backButtonService.hide();
  }

  priceSelected(price: number) {
    this.commonParametersService.setParameters({ price });
  }

  private getInstrumentKey(ticker: string): InstrumentKey {
    const [exchange, symbol] = ticker.split(':');

    return { exchange, symbol }
  }
}
