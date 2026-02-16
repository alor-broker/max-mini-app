import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Instrument, QuotesService, Quote } from "@api-lib";
import { InstrumentIconSourceService } from "../../../core/services/instrument-icon-source.service";
import { NzAvatarComponent } from "ng-zorro-antd/avatar";
import { BehaviorSubject, filter, Observable } from "rxjs";
import { AsyncPipe } from "@angular/common";
import { mapWith } from "../../../core/utils/observable-helper";
import { NzDescriptionsComponent, NzDescriptionsItemComponent } from "ng-zorro-antd/descriptions";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: 'tga-instrument-info',
  standalone: true,
  imports: [
    NzAvatarComponent,
    AsyncPipe,
    NzDescriptionsComponent,
    NzDescriptionsItemComponent,
    TranslocoDirective
  ],
  templateUrl: './instrument-info.component.html',
  styleUrl: './instrument-info.component.less'
})
export class InstrumentInfoComponent implements OnInit, OnDestroy {

  @Output()
  priceSelected = new EventEmitter<number>();

  private instrument$ = new BehaviorSubject<null | Instrument>(null);
  viewData$!: Observable<{ instrument: Instrument, lastQuote: Quote | null }>;

  @Input({ required: true })
  set instrument(instrument: Instrument) {
    this.instrument$.next(instrument);
  };

  constructor(
    private readonly instrumentIconSourceService: InstrumentIconSourceService,
    private readonly quotesService: QuotesService
  ) {
  }

  ngOnInit() {
    this.viewData$ = this.instrument$
      .pipe(
        filter(instrument => instrument != null),
        mapWith(
          (instrument) => this.quotesService.getLastQuoteInfo(instrument.symbol, instrument.exchange),
          (instrument, lastQuote) => ({ instrument, lastQuote })
        )
      )
  }

  ngOnDestroy() {
    this.instrument$.complete();
  }

  getIconUrl(symbol: string): string {
    return this.instrumentIconSourceService.getIconUrl(symbol);
  }

  selectPrice(price: number | null) {
    if (price == null) {
      return;
    }

    this.priceSelected.emit(price)
  }
}
