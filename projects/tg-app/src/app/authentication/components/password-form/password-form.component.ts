import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { HapticFeedbackService, ImpactHapticStyle, PlatformInfoService } from "@environment-services-lib";

@Component({
  selector: 'tga-password-form',
  standalone: true,
  imports: [ReactiveFormsModule, NzIconDirective],
  templateUrl: './password-form.component.html',
  styleUrl: './password-form.component.less',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordFormComponent),
      multi: true
    }
  ]
})
export class PasswordFormComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnChanges {

  @Input() isBiometryButtonVisible = false;

  @Output() onBiometryButtonClicked = new EventEmitter();

  @ViewChild('inputElement')
  inputElement!: ElementRef<HTMLInputElement>;

  passwordControl = new FormControl('');
  isDesktopPlatform = false;

  onChange?: (val: string) => void;
  onTouch?: () => void;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly platformInfoService: PlatformInfoService,
    private readonly hapticFeedbackService: HapticFeedbackService,
    private readonly destroyRef: DestroyRef
  ) {
  }

  ngOnInit() {
    this.passwordControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(v => {
        let parsedValue = (v ?? '')
          .trim()
          .replace(/\D/g, '')
          .slice(0, 4);

        if (v != parsedValue) {
          this.passwordControl.setValue(parsedValue);
          return;
        }

        this.onChange?.(v ?? '');
        this.cdr.detectChanges();
      });

    this.isDesktopPlatform = this.platformInfoService.isDesktopPlatform();
  }

  ngOnChanges() {
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    if (this.isDesktopPlatform) {
      this.inputElement.nativeElement.focus();
    }
  }

  writeValue(val: string | null): void {
    this.passwordControl.setValue(val ?? '');
    this.cdr.detectChanges();
  }

  registerOnChange(fn: (val: string) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn:  () => void) {
    this.onTouch = fn;
  }

  addNumber(num: string) {
    this.hapticFeedbackService.impactOccurred(ImpactHapticStyle.Light);
    this.passwordControl.setValue((this.passwordControl.value ?? '') + num);
  }

  removeNumber() {
    const ctrlValue = (this.passwordControl.value ?? '') ?? '';
    this.passwordControl.setValue(ctrlValue.slice(0, -1));
  }

  focusToInput() {
    this.inputElement.nativeElement.focus();
  }

  biometryButtonClicked() {
    this.onBiometryButtonClicked.emit();
  }
}
