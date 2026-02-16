import { TestBed } from '@angular/core/testing';

import { PortfolioOrdersService } from './portfolio-orders.service';
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { MockProvider } from "ng-mocks";
import {
  ApiConfigProvider,
  ApiErrorsTracker
} from "@api-lib";

describe('PortfolioOrdersService', () => {
  let service: PortfolioOrdersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(ApiConfigProvider),
        MockProvider(ApiErrorsTracker),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PortfolioOrdersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
