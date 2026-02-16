import { Component, DestroyRef, inject, Input, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { Instrument, InstrumentKey, NewOrderResponse, Side } from "@api-lib";
import { BehaviorSubject, filter, Observable, take } from "rxjs";
import { ModalService } from "@environment-services-lib";
import { SelectedPortfolioDataContextService } from "../../../home/services/selected-portfolio-data-context.service";
import { mapWith } from "../../../core/utils/observable-helper";
import { inputNumberValidation } from "../../../core/utils/validation-options";
import { TgaValidators } from "../../../core/utils/validators";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { switchMap } from "rxjs/operators";
import { OrderApiErrorsTracker } from "../../../core/utils/order-api-errors-tracker";
import { CommonParameters, CommonParametersService } from "../../sevices/commom-parameters/common-parameters.service";
import { OrderActionType } from "../../../core/models/order-api-errors-tracker.model";

interface OrderMeta {
  instrument: Instrument;
  portfolio: string;
}

@Component({
  template: '',
  providers: [OrderApiErrorsTracker]
})
export abstract class BaseOrderFormComponent implements OnInit, OnDestroy {

  private readonly selectedPortfolioDataContextService = inject(SelectedPortfolioDataContextService);
  protected readonly formBuilder: FormBuilder = inject(FormBuilder);
  protected readonly modalService: ModalService = inject(ModalService);
  protected readonly commonParametersService: CommonParametersService = inject(CommonParametersService);
  protected readonly destroyRef: DestroyRef = inject(DestroyRef);
  protected  readonly orderApiErrorsTracker: OrderApiErrorsTracker = inject(OrderApiErrorsTracker);

  @Input({ required: true }) set instrument(instr: Instrument | null) {
    this.selectedInstrument$.next(instr);
  }

  private selectedInstrument$ = new BehaviorSubject<Instrument | null>(null);

  protected orderMeta$!: Observable<OrderMeta>;

  abstract get canSubmit(): boolean;

  ngOnInit() {
    this.orderApiErrorsTracker.setActionType(OrderActionType.Create);

    this.orderMeta$ = this.selectedInstrument$
      .pipe(
        filter(i => i != null),
        mapWith(
          () => this.selectedPortfolioDataContextService.selectedPortfolio$,
          (instrument, portfolio) => ({
            instrument,
            portfolio: portfolio.portfolioKey.portfolio
          })
        )
      );

    this.initInstrumentChange();
    this.initCommonParametersChange();
  }

  ngOnDestroy() {
    this.selectedInstrument$.complete();
  }

  submitOrder(side: Side): void {
    if (!this.canSubmit) {
      return;
    }

    this.orderMeta$.pipe(
      take(1),
      switchMap(({ instrument, portfolio }) => this.prepareOrderStream(side, instrument, portfolio)),
      take(1)
    ).subscribe(res => {
      if (res != null) {
        this.modalService.showMessage({
            message: `Заявка успешно выставлена, её номер на бирже ${ res.orderNumber }`,
            title: 'Заявка выставлена'
          })
          .subscribe();
      }
    });
  }

  protected abstract prepareOrderStream(side: Side, instrument: Instrument, portfolio: string): Observable<NewOrderResponse | null>;

  protected initInstrumentChange(): void {
    this.orderMeta$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ instrument, portfolio }) => this.changeInstrument(instrument, portfolio));
  }

  protected abstract changeInstrument(instrument: Instrument, portfolio: string): void;

  protected initCommonParametersChange() {
    this.commonParametersService.parameters$
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(params => this.commonParametersChange(params))
  }

  protected abstract commonParametersChange(params: Partial<CommonParameters>): void;

  protected setPriceValidators(target: FormControl<number | null>, newInstrument: Instrument): void {
    target.clearValidators();
    target.addValidators([
      Validators.required,
      Validators.min(inputNumberValidation.negativeMin),
      Validators.max(inputNumberValidation.max),
      TgaValidators.stepMultiplicity(newInstrument.minstep)
    ]);

    target.updateValueAndValidity();
  }

  protected toInstrumentKey(instrument: Instrument): InstrumentKey {
    return {
      symbol: instrument.symbol,
      exchange: instrument.exchange,
      ISIN: instrument.ISIN,
      board: instrument.board
    }
  }
}
