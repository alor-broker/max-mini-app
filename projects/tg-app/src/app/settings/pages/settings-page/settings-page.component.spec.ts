import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { SettingsPageComponent } from './settings-page.component';
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { ApiTokenProviderService } from "../../../core/services/api-token-provider.service";
import { TranslocoTestModuleProvider } from "../../../../testing-utils/transloco-test-module-provider";
import {
  MockComponents,
  MockProvider
} from "ng-mocks";
import { PasswordSettingsComponent } from "../../components/password-settings/password-settings.component";
import {
  BackButtonService,
  LinksService
} from "@environment-services-lib";

describe('SettingsPageComponent', () => {
  let component: SettingsPageComponent;
  let fixture: ComponentFixture<SettingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SettingsPageComponent,
        TranslocoTestModuleProvider.getModule(),
        MockComponents(
          PasswordSettingsComponent,
        )
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: new Subject()
          }
        },
        {
          provide: ApiTokenProviderService,
          useValue: {
            logout: jasmine.createSpy('logout').and.callThrough()
          }
        },
        MockProvider(LinksService),
        MockProvider(BackButtonService),
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
