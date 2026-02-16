import { TestBed } from '@angular/core/testing';

import { InstrumentIconSourceService } from './instrument-icon-source.service';

describe('InstrumentIconSourceService', () => {
  let service: InstrumentIconSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstrumentIconSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
