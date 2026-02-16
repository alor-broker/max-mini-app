import { TestBed } from '@angular/core/testing';

import { PortfolioSummaryService } from './portfolio-summary.service';
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { MockProvider } from "ng-mocks";
import {
  ApiConfigProvider,
  ApiErrorsTracker
} from "@api-lib";

describe('PortfolioSummaryService', () => {
  let service: PortfolioSummaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(ApiConfigProvider),
        MockProvider(ApiErrorsTracker),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PortfolioSummaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
