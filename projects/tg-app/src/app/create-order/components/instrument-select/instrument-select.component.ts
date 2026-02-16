import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NzInputDirective, NzInputGroupComponent } from "ng-zorro-antd/input";
import {
  NzAutocompleteComponent,
  NzAutocompleteOptionComponent,
  NzAutocompleteTriggerDirective, NzOptionSelectionChange
} from "ng-zorro-antd/auto-complete";
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { Instrument, InstrumentsService, SearchFilter } from "@api-lib";
import { BehaviorSubject, debounceTime, Observable, of } from "rxjs";
import { MarketService } from "../../../core/services/market.service";
import { map, switchMap } from "rxjs/operators";
import { AsyncPipe } from "@angular/common";
import { NzTagComponent } from "ng-zorro-antd/tag";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: 'tga-instrument-select',
  standalone: true,
  imports: [
    NzInputGroupComponent,
    NzAutocompleteTriggerDirective,
    ReactiveFormsModule,
    NzAutocompleteComponent,
    NzAutocompleteOptionComponent,
    NzInputDirective,
    AsyncPipe,
    NzTagComponent,
    NzIconDirective,
    TranslocoDirective
  ],
  templateUrl: './instrument-select.component.html',
  styleUrl: './instrument-select.component.less',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: InstrumentSelectComponent
    }
  ]
})
export class InstrumentSelectComponent implements ControlValueAccessor, OnInit, OnDestroy {

  @Output() instrumentSelected = new EventEmitter<Instrument | null>();

  private readonly filter$: BehaviorSubject<SearchFilter | null> = new BehaviorSubject<SearchFilter | null>(null);
  private touched = false;
  private defaultExchange?: string;

  searchControl = new FormControl<string | null>(null);
  selectedValue?: Instrument | null;
  filteredInstruments$: Observable<Instrument[]> = of([]);

  onChange?: (val: Instrument | null) => void;
  onTouch?: () => void;

  constructor(
    private readonly marketService: MarketService,
    private readonly instrumentsService: InstrumentsService
  ) {
  }

  ngOnInit() {
    this.marketService.getDefaultExchange()
      .subscribe(e => {
        this.defaultExchange = e;
      });

    this.filteredInstruments$ = this.filter$.pipe(
      debounceTime(200),
      switchMap(filter => {
          if (!filter) {
            return of(null);
          }

          return this.instrumentsService.searchInstruments(filter);
        }
      ),
      map(instruments => instruments ?? [])
    );
  }

  ngOnDestroy() {
    this.filter$.complete();
  }

  onSelect(event: NzOptionSelectionChange, val: Instrument): void {
    if (event.isUserInput) {
      this.emitValue(val);
    }
  }

  checkInstrumentSelection(): void {
    if (this.touched && !this.selectedValue) {
      this.emitValue(null);
    }
  }

  filterChanged(value: string): void {
    this.markAsTouched();

    const filter = {
      limit: 20
    } as SearchFilter;

    filter.exchange = this.defaultExchange ?? '';

    if (value.includes(':')) {
      const parts = value.split(':');

      let nextPartIndex = 0;

      filter.exchange = parts[nextPartIndex].toUpperCase();
      nextPartIndex++;

      filter.query = parts[nextPartIndex];
      nextPartIndex++;
      filter.instrumentGroup = parts[nextPartIndex]?.toUpperCase() ?? '';
    } else {
      filter.query = value;
    }

    this.filter$.next(filter);
  }

  getInstrumentString(instrument: Instrument) {
    return `${instrument.symbol}_${instrument.exchange}${instrument.board == null ? '' : '_' + instrument.board}`
  }

  writeValue(instrument: Instrument | null) {
    this.searchControl.setValue(instrument?.symbol ?? null);
    this.selectedValue = instrument;

    if (instrument == null) {
      this.filter$.next(null);
      this.touched = false;
    }
  }

  registerOnChange(fn: (val: Instrument | null) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn:  () => void) {
    this.onTouch = fn;
  }

  private emitValue(value: Instrument | null): void {
    const instrument = value ?? null;

    this.selectedValue = instrument;
    this.onChange?.(instrument);
    this.instrumentSelected.emit(instrument);
  }

  private markAsTouched(): void {
    if (!this.touched) {
      this.onTouch?.();
      this.touched = true;
    }

    this.selectedValue = null;
  }
}
