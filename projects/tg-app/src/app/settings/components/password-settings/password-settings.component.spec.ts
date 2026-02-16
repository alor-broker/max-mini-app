import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { PasswordSettingsComponent } from './password-settings.component';
import { NzIconModule } from "ng-zorro-antd/icon";
import { TranslocoTestModuleProvider } from "../../../../testing-utils/transloco-test-module-provider";
import { MockProvider } from "ng-mocks";
import {
  ModalService,
  StorageService
} from "@environment-services-lib";

describe('PasswordSettingsComponent', () => {
  let component: PasswordSettingsComponent;
  let fixture: ComponentFixture<PasswordSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PasswordSettingsComponent,
        NzIconModule,
        TranslocoTestModuleProvider.getModule()
      ],
      providers: [
        MockProvider(StorageService),
        MockProvider(ModalService),
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PasswordSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
