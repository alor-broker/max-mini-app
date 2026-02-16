import { ChangeDetectorRef, Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NzInputDirective } from "ng-zorro-antd/input";

@Component({
  selector: 'tga-input-number',
  standalone: true,
  imports: [
    NzInputDirective,
    FormsModule
  ],
  templateUrl: './input-number.component.html',
  styleUrl: './input-number.component.less',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputNumberComponent),
      multi: true
    }
  ],
})
export class InputNumberComponent implements ControlValueAccessor {

  @Input() placeholder = '';
  @Input() readonly = false;
  @Input() allowNegative = false;
  @Input() allowDecimal = true;

  @ViewChild('inputElement', {static: true})
  inputElement!: ElementRef<HTMLInputElement>;

  value?: number | null;
  displayValue?: string | null;

  private readonly minus = '-';

  onChange?: (val: number | null) => void;
  onTouch?: () => void;

  constructor(
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  writeValue(value: number | null): void {
    if(value === this.value) {
      return;
    }

    if(Number(this.displayValue) === Number(value)) {
      return;
    }

    this.value = value;
    this.setValue(value);

    this.setDisplayValue(value);

    this.cdr.markForCheck();
  }

  onModelChange(value: string): void {
    let parsedValue = value
      .trim()
      .replace(/,/g, '.')
      .replace(/[^\d.-]/g, '');

    parsedValue = this.removeExtraSymbol('.', parsedValue);

    if(this.allowNegative) {
      parsedValue = this.removeExtraSign(parsedValue);
    } else {
      parsedValue = parsedValue.replace(/-/g, '');
    }

    if(!this.allowDecimal) {
      parsedValue = parsedValue.replace(/\./g, '');
    }

    let newValue: number | null = parsedValue.length > 0
      ? Number(parsedValue)
      : null;

    if(parsedValue === this.minus && this.allowNegative) {
      newValue = null;
    } else if (newValue != null && Number.isNaN(newValue)) {
      newValue = this.value ?? null;
      parsedValue = '';
    }

    this.setDisplayValue(parsedValue);
    this.setValue(newValue);
  }

  setValue(value: number | null): void {
    if (this.value !== value) {
      this.value = value;
      this.onChange?.(value);
    }
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: ((...args: any[]) => any)): void {
    this.onTouch = fn;
  }

  private setDisplayValue(value: number | string | null): void {
    this.displayValue = value?.toString() ?? '';
    this.inputElement.nativeElement.value = this.displayValue;
  }

  private removeExtraSymbol(symbol: string, input: string): string {
    const symbolIndexes = [...input].reduce((previousValue: number[], currentValue, currentIndex) => {
        if (currentValue === symbol) {
          return [...previousValue, currentIndex];
        }

        return previousValue;
      },
      []
    );

    if (symbolIndexes.length <= 1) {
      return input;
    }

    let normalizedValue = '';
    if (symbolIndexes.length > 1) {
      for (let i = 0; i < input.length; i++) {
        if (symbolIndexes.indexOf(i) > 0) {
          continue;
        }

        normalizedValue += input[i];
      }
    }

    return normalizedValue;
  }

  private removeExtraSign(input: string): string {
    let startSymbol = '';
    if(input.startsWith(this.minus)) {
      startSymbol = this.minus;
    }

    return startSymbol + input.replace(/-/g, '');
  }
}
