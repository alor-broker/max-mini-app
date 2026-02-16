import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { PositionsListComponent } from './positions-list.component';
import { SelectedPortfolioDataContextService } from "../../services/selected-portfolio-data-context.service";
import { Subject } from "rxjs";
import { PortfolioPositionsService } from "@api-lib";
import { InstrumentIconSourceService } from "../../../core/services/instrument-icon-source.service";
import { MockProvider } from "ng-mocks";
import { MarketService } from "../../../core/services/market.service";

describe('PositionsListComponent', () => {
  let component: PositionsListComponent;
  let fixture: ComponentFixture<PositionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionsListComponent],
      providers: [
        {
          provide: SelectedPortfolioDataContextService,
          useValue: {
            selectedPortfolio$: new Subject()
          }
        },
        {
          provide: PortfolioPositionsService,
          useValue: {
            getAllForPortfolio: jasmine.createSpy('getAllForPortfolio').and.returnValue(new Subject())
          }
        },
        MockProvider(InstrumentIconSourceService),
        MockProvider(MarketService)
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PositionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
