import { TestBed } from '@angular/core/testing';

import { PortfolioTradesService } from './portfolio-trades.service';
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { MockProvider } from "ng-mocks";
import {
  ApiConfigProvider,
  ApiErrorsTracker
} from "@api-lib";

describe('PortfolioTradesService', () => {
  let service: PortfolioTradesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(ApiConfigProvider),
        MockProvider(ApiErrorsTracker),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PortfolioTradesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
