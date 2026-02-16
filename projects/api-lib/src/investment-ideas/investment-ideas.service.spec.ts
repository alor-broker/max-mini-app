import { TestBed } from '@angular/core/testing';

import { InvestmentIdeasService } from './investment-ideas.service';
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { MockProvider } from "ng-mocks";
import {
  ApiConfigProvider,
  ApiErrorsTracker
} from "@api-lib";

describe('InvestingIdeasService', () => {
  let service: InvestmentIdeasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(ApiConfigProvider),
        MockProvider(ApiErrorsTracker),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(InvestmentIdeasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
