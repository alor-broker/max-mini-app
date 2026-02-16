import { TestBed } from '@angular/core/testing';

import { OrdersRefreshService } from './orders-refresh.service';

describe('OrdersRefreshServiceService', () => {
  let service: OrdersRefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdersRefreshService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
