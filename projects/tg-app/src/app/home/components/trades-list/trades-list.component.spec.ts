import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { TradesListComponent } from "./trades-list.component";
import { SelectedPortfolioDataContextService } from "../../services/selected-portfolio-data-context.service";
import { Subject } from "rxjs";
import { PortfolioTradesService } from "@api-lib";
import { InstrumentIconSourceService } from "../../../core/services/instrument-icon-source.service";
import { TranslocoTestModuleProvider } from "../../../../testing-utils/transloco-test-module-provider";
import { MockProvider } from "ng-mocks";

describe('TradesListComponent', () => {
  let component: TradesListComponent;
  let fixture: ComponentFixture<TradesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TradesListComponent,
        TranslocoTestModuleProvider.getModule()
      ],
      providers: [
        {
          provide: SelectedPortfolioDataContextService,
          useValue: {
            selectedPortfolio$: new Subject()
          }
        },
        {
          provide: PortfolioTradesService,
          useValue: {
            getSessionTrades: jasmine.createSpy('getSessionTrades').and.returnValue(new Subject())
          }
        },
        MockProvider(InstrumentIconSourceService)
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TradesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
