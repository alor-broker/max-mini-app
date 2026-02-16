import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { distinctUntilChanged, Observable } from "rxjs";
import {
  Instrument,
  LessMore,
  NewOrderResponse,
  NewStopLimitOrder,
  NewStopMarketOrder,
  OrdersService,
  Side
} from "@api-lib";
import { inputNumberValidation } from "../../../../core/utils/validation-options";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AsyncPipe } from "@angular/common";
import { InputNumberComponent } from "../../../../core/components/input-number/input-number.component";
import { NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent } from "ng-zorro-antd/form";
import { SubmitOrderButtonsComponent } from "../../submit-order-buttons/submit-order-buttons.component";
import { NzOptionComponent, NzSelectComponent } from "ng-zorro-antd/select";
import { NzDatePickerComponent } from "ng-zorro-antd/date-picker";
import { NzRadioComponent, NzRadioGroupComponent } from "ng-zorro-antd/radio";
import { BaseOrderFormComponent } from "../base-order-form.component";
import moment from "moment";
import { CommonParameters } from "../../../sevices/commom-parameters/common-parameters.service";
import { map } from "rxjs/operators";
import { TranslocoDirective } from "@jsverse/transloco";
import { OrderApiErrorsTracker } from "../../../../core/utils/order-api-errors-tracker";

@Component({
  selector: 'tga-stop-order-form',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    InputNumberComponent,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    ReactiveFormsModule,
    SubmitOrderButtonsComponent,
    NzSelectComponent,
    NzOptionComponent,
    NzDatePickerComponent,
    NzRadioGroupComponent,
    NzRadioComponent,
    TranslocoDirective
  ],
  templateUrl: './stop-order-form.component.html',
  styleUrls: [
    './stop-order-form.component.less',
    '../base-order-form.component.less'
  ],
  providers: [OrderApiErrorsTracker]
})
export class StopOrderFormComponent extends BaseOrderFormComponent implements OnInit {
  conditionType = LessMore;

  form = this.formBuilder.group({
    quantity: this.formBuilder.control<number | null>(
      null,
      [
        Validators.required,
        Validators.min(inputNumberValidation.min),
        Validators.max(inputNumberValidation.max)
      ]
    ),
    price: this.formBuilder.control<number | null>(null),
    triggerPrice: this.formBuilder.control<number | null>(null),
    condition: this.formBuilder.nonNullable.control(LessMore.More),
    stopEndUnixTime: this.formBuilder.control<Date | null>(null),
    withLimit: this.formBuilder.nonNullable.control(false),
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

    this.subscribeToFormControlsChange();
  }

  protected override prepareOrderStream(side: Side, instrument: Instrument, portfolio: string): Observable<NewOrderResponse | null> {
    const formValue = this.form.value;
    const options= {
      errorTracker: this.orderApiErrorsTracker
    };

    const orderReq= {
      ...formValue,
      side,
      stopEndUnixTime: formValue.stopEndUnixTime == null ? undefined : moment(formValue.stopEndUnixTime).unix(),
      instrument: this.toInstrumentKey(instrument)
    };

    if (formValue.withLimit) {
      return this.ordersService.submitStopLimitOrder(
        orderReq as NewStopLimitOrder,
        portfolio,
        options
      )
    }

    return this.ordersService.submitStopMarketOrder(
      orderReq as NewStopMarketOrder,
      portfolio,
      options
    )
  }

  disabledDate = (date: Date): boolean => {
    const today = moment().startOf('day');
    return moment(date).unix() < today.unix();
  };

  protected override changeInstrument(instrument: Instrument) {
    this.setPriceValidators(this.form.controls.triggerPrice, instrument);
    this.setPriceValidators(this.form.controls.price, instrument);
  }

  protected override initCommonParametersChange() {
    super.initCommonParametersChange();

    this.form.valueChanges
      .pipe(
        map(({ quantity, triggerPrice }) => ({ quantity, price: triggerPrice })),
        distinctUntilChanged((prev, curr) => prev.price === curr.price && prev.quantity === curr.quantity),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(params => this.commonParametersService.setParameters(params))
  }

  protected override commonParametersChange(params: Partial<CommonParameters>) {
    if (params.quantity != null) {
      this.form.controls.quantity.setValue(params.quantity);
    }

    if (params.price != null) {
      this.form.controls.triggerPrice.setValue(params.price);
    }
  }

  private subscribeToFormControlsChange() {
    this.form.controls.withLimit.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(val => {
        if (val) {
          this.form.controls.price.enable();
        } else {
          this.form.controls.price.disable();
        }
      });

    this.form.controls.triggerPrice.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(val => {
        this.form.controls.price.setValue(val);
      });

    this.form.controls.stopEndUnixTime.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged((prev, curr) => prev?.toString() !== curr?.toString())
      )
      .subscribe(v => {
        if (v == null) {
          return;
        }

        const endOfDayDate = moment(v).endOf('day').valueOf();
        this.form.controls.stopEndUnixTime.setValue(new Date(endOfDayDate))
      })
  }
}
