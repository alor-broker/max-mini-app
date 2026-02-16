import {
  ChangeDetectorRef,
  Component,
  DestroyRef, OnDestroy,
  OnInit
} from '@angular/core';
import { NzButtonComponent } from "ng-zorro-antd/button";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { NzSwitchComponent } from "ng-zorro-antd/switch";
import { SectionPanelComponent } from "../../../core/components/sections/section-panel/section-panel.component";
import { SectionsComponent } from "../../../core/components/sections/sections/sections/sections.component";
import { ModalService, StorageService } from "@environment-services-lib";
import { Router } from "@angular/router";
import { RoutesHelper } from "../../../core/utils/routes.helper";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent } from "ng-zorro-antd/form";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { StorageKeys } from "../../../core/utils/storage-keys";
import { BehaviorSubject, switchMap, tap } from "rxjs";
import { AsyncPipe } from "@angular/common";
import { PageLoaderComponent } from "../../../core/components/page-loader/page-loader.component";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: 'tga-password-settings',
  standalone: true,
  imports: [
    NzButtonComponent,
    NzIconDirective,
    NzSwitchComponent,
    SectionPanelComponent,
    SectionsComponent,
    ReactiveFormsModule,
    NzFormItemComponent,
    NzFormDirective,
    NzFormLabelComponent,
    NzFormControlComponent,
    AsyncPipe,
    PageLoaderComponent,
    TranslocoDirective
  ],
  templateUrl: './password-settings.component.html',
  styleUrl: './password-settings.component.less'
})
export class PasswordSettingsComponent implements OnInit, OnDestroy {

  isLoading$ = new BehaviorSubject(true);
  biometryAccessControl = new FormControl();
  isPasswordAvailable = false;

  constructor(
    private readonly router: Router,
    private readonly storageService: StorageService,
    private readonly modalService: ModalService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroyRef: DestroyRef
  ) {
  }

  ngOnInit() {
    this.storageService.getItem(StorageKeys.AppBiometryAccess)
      .pipe(
        tap(biometryAccess => {
          const isBiometryAvailable = biometryAccess == null ? false : (JSON.parse(biometryAccess) as boolean);
          this.biometryAccessControl.setValue(isBiometryAvailable, { emitEvent: false });
        }),
        switchMap(() => this.storageService.getItem(StorageKeys.AppPassword)),
        tap(pass => {
          if (pass == null) {
            return;
          }

          this.isPasswordAvailable = JSON.parse(pass) != null;
        }),
        tap(() => this.isLoading$.next(false))
      )
      .subscribe();

    this.biometryAccessControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(value => {
        this.storageService.setItem(StorageKeys.AppBiometryAccess, (value ?? false).toString())
          .subscribe();
      });
  }

  ngOnDestroy() {
    this.isLoading$.complete();
  }

  changePassword() {
    RoutesHelper.openFromRoot(this.router, RoutesHelper.appRoutes.authentication.createPassword)
  }

  turnOffPassword() {
    this.storageService.setItem(StorageKeys.AppPassword, JSON.stringify(null))
      .pipe(
        switchMap(() => this.modalService.showMessage({ message: 'Пароль успешно сброшен' }))
      )
      .subscribe(() => {
        this.isPasswordAvailable = false;
        this.cdr.detectChanges();
      });
  }
}
