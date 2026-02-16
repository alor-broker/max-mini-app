import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { UnlockPageComponent } from './unlock-page.component';
import { TranslocoTestModuleProvider } from "../../../../testing-utils/transloco-test-module-provider";
import { ApiTokenProviderService } from "../../../core/services/api-token-provider.service";
import { Subject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { MockProvider } from "ng-mocks";
import {
  BackButtonService,
  BiometryService,
  HapticFeedbackService,
  StorageService
} from "@environment-services-lib";

describe('UnlockPageComponent', () => {
  let component: UnlockPageComponent;
  let fixture: ComponentFixture<UnlockPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UnlockPageComponent,
        TranslocoTestModuleProvider.getModule()
      ],
      providers: [
        MockProvider(BiometryService),
        MockProvider(StorageService),
        MockProvider(BackButtonService),
        MockProvider(HapticFeedbackService),
        {
          provide: ApiTokenProviderService,
          useValue: {
            apiToken$: new Subject(),
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: new Subject()
          }
        },
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UnlockPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
