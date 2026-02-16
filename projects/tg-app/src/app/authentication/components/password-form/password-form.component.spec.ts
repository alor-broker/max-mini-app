import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { PasswordFormComponent } from './password-form.component';
import { MockProvider } from "ng-mocks";
import {
  HapticFeedbackService,
  PlatformInfoService
} from "@environment-services-lib";
import { provideHttpClient } from "@angular/common/http";

describe('PasswordFormComponent', () => {
  let component: PasswordFormComponent;
  let fixture: ComponentFixture<PasswordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordFormComponent],
      providers: [
        provideHttpClient(),
        MockProvider(PlatformInfoService),
        MockProvider(HapticFeedbackService)
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PasswordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
