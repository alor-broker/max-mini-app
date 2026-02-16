import { TestBed } from '@angular/core/testing';

import { PortfolioPositionsService } from './portfolio-positions.service';
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { MockProvider } from "ng-mocks";
import {
  ApiConfigProvider,
  ApiErrorsTracker
} from "@api-lib";

describe('PortfolioPositionsService', () => {
  let service: PortfolioPositionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(ApiConfigProvider),
        MockProvider(ApiErrorsTracker),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PortfolioPositionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
