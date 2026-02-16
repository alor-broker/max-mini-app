import { TestBed } from '@angular/core/testing';

import {
  ApiConfigProvider,
  ApiErrorsTracker,
  QuotesService
} from '@api-lib';
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { MockProvider } from "ng-mocks";

describe('QuotesService', () => {
  let service: QuotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(ApiConfigProvider),
        MockProvider(ApiErrorsTracker),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(QuotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
