import { TestBed } from '@angular/core/testing';

import { InstrumentsService } from './instruments.service';
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { MockProvider } from "ng-mocks";
import {
  ApiConfigProvider,
  ApiErrorsTracker
} from "@api-lib";

describe('InstrumentsService', () => {
  let service: InstrumentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(ApiConfigProvider),
        MockProvider(ApiErrorsTracker),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(InstrumentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
