import { TestBed } from '@angular/core/testing';

import { SelectedPortfolioDataContextService } from './selected-portfolio-data-context.service';
import {
  ClientService,
  PortfolioPositionsService
} from "@api-lib";
import { Subject } from "rxjs";
import { UserStateService } from "../../core/services/user-state.service";

describe('SelectedPortfolioDataContextService', () => {
  let service: SelectedPortfolioDataContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[
        {
          provide: ClientService,
          useValue: {
            getPortfolios: jasmine.createSpy('getPortfolios').and.returnValue(new Subject())
          }
        },
        {
          provide: PortfolioPositionsService,
          useValue: {
            getAllForClient: jasmine.createSpy('getAllForClient').and.returnValue(new Subject())
          }
        },
        {
          provide: UserStateService,
          useValue: {
            user$: new Subject()
          }
        }
      ]
    });
    service = TestBed.inject(SelectedPortfolioDataContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
