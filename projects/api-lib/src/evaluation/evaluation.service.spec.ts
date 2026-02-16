import { TestBed } from '@angular/core/testing';

import {
  ApiConfigProvider,
  ApiErrorsTracker,
  EvaluationService
} from '@api-lib';
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { MockProvider } from "ng-mocks";

describe('EvaluationService', () => {
  let service: EvaluationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(ApiConfigProvider),
        MockProvider(ApiErrorsTracker),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(EvaluationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
