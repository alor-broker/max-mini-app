import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import {
  BiometryService,
  HapticFeedbackService,
  NotificationHapticStyle,
  StorageService
} from "@environment-services-lib";
import { Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { of, switchMap, tap } from "rxjs";
import { PasswordFormComponent } from "../../components/password-form/password-form.component";
import { RoutesHelper } from "../../../core/utils/routes.helper";
import { NzButtonComponent } from "ng-zorro-antd/button";
import { StorageKeys } from "../../../core/utils/storage-keys";
import { TranslocoDirective } from "@jsverse/transloco";

enum PasswordPhase {
  Create = 'create',
  Repeat = 'repeat'
}

@Component({
  selector: 'tga-create-password-page',
  standalone: true,
  imports: [
    PasswordFormComponent,
    ReactiveFormsModule,
    NzButtonComponent,
    TranslocoDirective
  ],
  templateUrl: './create-password-page.component.html',
  styleUrl: './create-password-page.component.less'
})
export class CreatePasswordPageComponent implements OnInit {

  passwordCtrl = new FormControl('');
  passwordPhaseEnum = PasswordPhase;
  passwordPhase = PasswordPhase.Create;
  createdPassword = '';

  constructor(
    private readonly storageService: StorageService,
    private readonly biometryService: BiometryService,
    private readonly hapticFeedbackService: HapticFeedbackService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroyRef: DestroyRef,
  ) {
  }

  ngOnInit() {
    this.passwordCtrl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(v => {
        if (v == null || v.length != 4) {
          return;
        }

        if (this.passwordPhase === PasswordPhase.Create) {
          this.createdPassword = v;
          this.passwordPhase = PasswordPhase.Repeat;
          this.passwordCtrl.setValue('');
          return;
        }

        if (v === this.createdPassword) {
          this.storageService.setItem(StorageKeys.AppPassword, v)
            .subscribe(
              isSaved => {
                if (!isSaved) {
                  this.createdPassword = '';
                  this.passwordPhase = PasswordPhase.Create;
                  this.passwordCtrl.setValue('');
                  this.cdr.detectChanges();
                }

                this.setBiometry();
              }
            )
        } else {
          this.hapticFeedbackService.notificationOccurred(NotificationHapticStyle.Error);
          this.passwordCtrl.setValue('');
          this.cdr.detectChanges();
        }
      });
  }

  createAgain() {
    this.passwordPhase = PasswordPhase.Create;
    this.createdPassword = '';
    this.passwordCtrl.setValue('');
    this.cdr.detectChanges();
  }

  private setBiometry() {
    this.biometryService.isBiometryAvailable()
      .pipe(
        switchMap(isAvailable => {
          if (isAvailable) {
            return this.biometryService.requestAccess('Для входа по биометрии предоставьте доступ')
          }

          return of(null);
        }),
        tap(isAccepted => {
          if (isAccepted != null) {
            this.storageService.setItem(StorageKeys.AppBiometryAccess, JSON.stringify(isAccepted))
              .subscribe();
          }
        })
      )
      .subscribe(() => {
        RoutesHelper.openFromRoot(this.router, RoutesHelper.appRoutes.home);
        this.cdr.detectChanges();
      })
  }
}
