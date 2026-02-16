import { TestBed } from '@angular/core/testing';

import { WatchedInvestmentIdeasService } from './watched-investment-ideas.service';
import { MockProvider } from "ng-mocks";
import { StorageService } from "@environment-services-lib";

describe('WatchedInvestmentIdeasService', () => {
  let service: WatchedInvestmentIdeasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(StorageService)
      ]
    });
    service = TestBed.inject(WatchedInvestmentIdeasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
