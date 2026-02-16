import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { StopOrdersListComponent } from './stop-orders-list.component';
import { SelectedPortfolioDataContextService } from "../../services/selected-portfolio-data-context.service";
import { Subject } from "rxjs";
import { PortfolioOrdersService } from "@api-lib";
import { InstrumentIconSourceService } from "../../../core/services/instrument-icon-source.service";
import { MockProvider } from "ng-mocks";

describe('StopOrdersListComponent', () => {
  let component: StopOrdersListComponent;
  let fixture: ComponentFixture<StopOrdersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StopOrdersListComponent],
      providers: [
        {
          provide: SelectedPortfolioDataContextService,
          useValue: {
            selectedPortfolio$: new Subject()
          }
        },
        {
          provide: PortfolioOrdersService,
          useValue: {
            getSessionStopOrders: jasmine.createSpy('getSessionStopOrders').and.returnValue(new Subject())
          }
        },
        MockProvider(InstrumentIconSourceService)
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(StopOrdersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
