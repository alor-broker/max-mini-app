import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { CreatePasswordPageComponent } from './create-password-page.component';
import { TranslocoTestModuleProvider } from "../../../../testing-utils/transloco-test-module-provider";
import { MockProvider } from "ng-mocks";
import {
  BiometryService,
  HapticFeedbackService,
  StorageService
} from "@environment-services-lib";

describe('CreatePasswordPageComponent', () => {
  let component: CreatePasswordPageComponent;
  let fixture: ComponentFixture<CreatePasswordPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreatePasswordPageComponent,
        TranslocoTestModuleProvider.getModule()
      ],
      providers: [
        MockProvider(StorageService),
        MockProvider(BiometryService),
        MockProvider(HapticFeedbackService),
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CreatePasswordPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
