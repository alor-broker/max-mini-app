import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { OrdersListComponent } from './orders-list.component';
import { SelectedPortfolioDataContextService } from "../../services/selected-portfolio-data-context.service";
import { Subject } from "rxjs";
import { InstrumentIconSourceService } from "../../../core/services/instrument-icon-source.service";
import { PortfolioOrdersService } from "@api-lib";
import { MockProvider } from "ng-mocks";

describe('OrdersListComponent', () => {
  let component: OrdersListComponent;
  let fixture: ComponentFixture<OrdersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersListComponent],
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
            getSessionLimitMarketOrders: jasmine.createSpy('getSessionLimitMarketOrders').and.returnValue(new Subject())
          }
        },
        MockProvider(InstrumentIconSourceService)
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OrdersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
