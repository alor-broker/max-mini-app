import { TestBed } from '@angular/core/testing';

import { ApiTokenProviderService } from './api-token-provider.service';
import { UserStateService } from "./user-state.service";
import { Subject } from "rxjs";
import { AuthService } from "../../../../../api-lib/src/auth/auth.service";
import { MockProvider } from "ng-mocks";
import { StorageService } from "@environment-services-lib";

describe('ApiTokenProviderService', () => {
  let service: ApiTokenProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: UserStateService,
          useValue: {
            state$: new Subject()
          }
        },
        {
          provide: AuthService,
          useValue: {
            refreshJwtToken: jasmine.createSpy('refreshJwtToken').and.callThrough()
          }
        },
        MockProvider(StorageService)
      ]
    });
    service = TestBed.inject(ApiTokenProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
