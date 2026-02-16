import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BaseOrderFormComponent } from "../base-order-form.component";
import { BehaviorSubject, distinctUntilChanged, Observable } from "rxjs";
import {
  EvaluationRequest,
  Instrument,
  NewMarketOrder,
  NewOrderResponse,
  OrdersService,
  QuotesService,
  Side
} from "@api-lib";
import { ReactiveFormsModule, Validators } from "@angular/forms";
import { inputNumberValidation } from "../../../../core/utils/validation-options";
import { map } from "rxjs/operators";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CommonParameters } from "../../../sevices/commom-parameters/common-parameters.service";
import { mapWith } from "../../../../core/utils/observable-helper";
import { AsyncPipe } from "@angular/common";
import { InputNumberComponent } from "../../../../core/components/input-number/input-number.component";
import { NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent } from "ng-zorro-antd/form";
import { OrderEvaluationComponent } from "../../order-evaluation/order-evaluation.component";
import { SubmitOrderButtonsComponent } from "../../submit-order-buttons/submit-order-buttons.component";
import { TranslocoDirective } from "@jsverse/transloco";
import { OrderApiErrorsTracker } from "../../../../core/utils/order-api-errors-tracker";

@Component({
  selector: 'tga-market-order-form',
  standalone: true,
  imports: [
    AsyncPipe,
    InputNumberComponent,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    OrderEvaluationComponent,
    ReactiveFormsModule,
    SubmitOrderButtonsComponent,
    TranslocoDirective
  ],
  templateUrl: './market-order-form.component.html',
  styleUrls: [
    './market-order-form.component.less',
    '../base-order-form.component.less'
  ],
  providers: [OrderApiErrorsTracker]
})
export class MarketOrderFormComponent extends BaseOrderFormComponent implements OnInit, OnDestroy {

  private readonly quotesService: QuotesService = inject(QuotesService);

  readonly evaluationRequest$ = new BehaviorSubject<EvaluationRequest | null>(null);

  form = this.formBuilder.group({
    quantity: this.formBuilder.control<number | null>(
      null,
      [
        Validators.required,
        Validators.min(inputNumberValidation.min),
        Validators.max(inputNumberValidation.max)
      ]
    )
  });

  override get canSubmit(): boolean {
    return this.form.valid;
  }

  constructor(
    private readonly ordersService: OrdersService
  ) {
    super();
  }

  override ngOnInit() {
    super.ngOnInit();

    this.getEvaluationSub();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();

    this.evaluationRequest$.complete();
  }

  protected override prepareOrderStream(side: Side, instrument: Instrument, portfolio: string): Observable<NewOrderResponse | null> {
    const { quantity } = this.form.value;

    const req: NewMarketOrder = {
      quantity: quantity!,
      instrument: this.toInstrumentKey(instrument),
      side
    };

    return this.ordersService.submitMarketOrder(
      req,
      portfolio,
      {
        errorTracker: this.orderApiErrorsTracker
      }
    )
  }

  protected override initCommonParametersChange() {
    super.initCommonParametersChange();

    this.form.valueChanges
      .pipe(
        map(({ quantity }) => ({ quantity })),
        distinctUntilChanged((prev, curr) => prev.quantity === curr.quantity),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(params => this.commonParametersService.setParameters(params))
  }

  protected override commonParametersChange(params: Partial<CommonParameters>) {
    if (params.quantity != null && params.quantity !== this.form.controls.quantity.value) {
      this.form.controls.quantity.setValue(params.quantity);
    }
  }

  protected override changeInstrument() {
  }

  private getEvaluationSub() {
    this.form.valueChanges
      .pipe(
        mapWith(
          () => this.orderMeta$,
          (formValue, { instrument, portfolio }) => ({ formValue, instrument, portfolio })
        ),
        mapWith(
          ({ instrument }) => this.quotesService.getLastQuoteInfo(instrument.symbol, instrument.exchange),
          (data, quote) => ({ ...data, lastPrice: quote?.last_price ?? null })
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ formValue, instrument, portfolio, lastPrice }) => {
        if (this.form.invalid || lastPrice == null) {
          this.evaluationRequest$.next(null);
          return;
        }

        this.evaluationRequest$.next({
          portfolio: portfolio,
          instrument: this.toInstrumentKey(instrument),
          price: lastPrice,
          lotQuantity: formValue.quantity as number
        });
      })
  }
}
