import { TestBed } from '@angular/core/testing';

import { MarketService } from './market.service';
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

describe('MarketService', () => {
  let service: MarketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(MarketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
