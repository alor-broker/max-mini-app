import { Component, OnDestroy, OnInit } from '@angular/core';
import { NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent } from "ng-zorro-antd/form";
import { ReactiveFormsModule, Validators } from "@angular/forms";
import { NzInputNumberComponent } from "ng-zorro-antd/input-number";
import { InputNumberComponent } from "../../../../core/components/input-number/input-number.component";
import { inputNumberValidation } from "../../../../core/utils/validation-options";
import {
  EvaluationRequest,
  Instrument,
  NewLimitOrder,
  NewOrderResponse,
  OrdersService,
  Side
} from "@api-lib";
import { BehaviorSubject, distinctUntilChanged, Observable } from "rxjs";
import { SectionsComponent } from "../../../../core/components/sections/sections/sections/sections.component";
import { SectionPanelComponent } from "../../../../core/components/sections/section-panel/section-panel.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SubmitOrderButtonsComponent } from "../../submit-order-buttons/submit-order-buttons.component";
import { mapWith } from "../../../../core/utils/observable-helper";
import { AsyncPipe } from "@angular/common";
import { OrderEvaluationComponent } from "../../order-evaluation/order-evaluation.component";
import { BaseOrderFormComponent } from "../base-order-form.component";
import { CommonParameters } from "../../../sevices/commom-parameters/common-parameters.service";
import { map } from "rxjs/operators";
import { TranslocoDirective } from "@jsverse/transloco";
import { OrderApiErrorsTracker } from "../../../../core/utils/order-api-errors-tracker";

@Component({
  selector: 'tga-limit-order-form',
  standalone: true,
  imports: [
    NzFormDirective,
    ReactiveFormsModule,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzInputNumberComponent,
    InputNumberComponent,
    SectionsComponent,
    SectionPanelComponent,
    SubmitOrderButtonsComponent,
    AsyncPipe,
    OrderEvaluationComponent,
    TranslocoDirective
  ],
  templateUrl: './limit-order-form.component.html',
  styleUrls: [
    './limit-order-form.component.less',
    '../base-order-form.component.less'
  ],
  providers: [OrderApiErrorsTracker]

})
export class LimitOrderFormComponent extends BaseOrderFormComponent implements OnInit, OnDestroy {

  readonly evaluationRequest$ = new BehaviorSubject<EvaluationRequest | null>(null);

  form = this.formBuilder.group({
    quantity: this.formBuilder.control<number | null>(
      null,
      [
        Validators.required,
        Validators.min(inputNumberValidation.min),
        Validators.max(inputNumberValidation.max)
      ]
    ),
    price: this.formBuilder.control<number | null>(
      null,
      [
        Validators.required,
        Validators.min(inputNumberValidation.negativeMin),
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
    const { quantity, price } = this.form.value;

    const req: NewLimitOrder = {
      quantity: quantity!,
      price: price!,
      instrument: this.toInstrumentKey(instrument),
      side
    };

    return this.ordersService.submitLimitOrder(
      req,
      portfolio,
      {
        errorTracker: this.orderApiErrorsTracker
      }
    )
  }

  protected changeInstrument(instrument:Instrument) {
    this.setPriceValidators(this.form.controls.price, instrument)
  }

  protected override initCommonParametersChange() {
    super.initCommonParametersChange();

    this.form.valueChanges
      .pipe(
        map(({ quantity, price }) => ({ quantity, price })),
        distinctUntilChanged((prev, curr) => prev.price === curr.price && prev.quantity === curr.quantity),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(params => this.commonParametersService.setParameters(params))
  }

  protected override commonParametersChange(params: Partial<CommonParameters>) {
    if (params.quantity != null && params.quantity !== this.form.controls.quantity.value) {
      this.form.controls.quantity.setValue(params.quantity);
    }

    if (params.price != null && params.price !== this.form.controls.price.value) {
      this.form.controls.price.setValue(params.price);
    }
  }

  private getEvaluationSub() {
    this.form.valueChanges
      .pipe(
        mapWith(
          () => this.orderMeta$,
          (formValue, { instrument, portfolio }) => ({ formValue, instrument, portfolio })
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ formValue, instrument, portfolio }) => {
        if (this.form.invalid) {
          this.evaluationRequest$.next(null);
          return;
        }

        this.evaluationRequest$.next({
          portfolio: portfolio,
          instrument: this.toInstrumentKey(instrument),
          price: formValue.price as number,
          lotQuantity: formValue.quantity as number
        });
      })
  }
}
