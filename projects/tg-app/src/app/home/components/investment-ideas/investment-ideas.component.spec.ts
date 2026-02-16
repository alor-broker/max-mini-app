import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { InvestmentIdeasComponent } from './investment-ideas.component';
import {
  InstrumentsService,
  InvestmentIdeasService
} from "@api-lib";
import { Subject } from "rxjs";
import { WatchedInvestmentIdeasService } from "../../services/watched-investment-ideas.service";
import { MarketService } from "../../../core/services/market.service";
import { TranslocoTestModuleProvider } from "../../../../testing-utils/transloco-test-module-provider";
import { MockProvider } from "ng-mocks";
import {
  BackButtonService,
  StorageService
} from "@environment-services-lib";

describe('InvestmentIdeasComponent', () => {
  let component: InvestmentIdeasComponent;
  let fixture: ComponentFixture<InvestmentIdeasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        InvestmentIdeasComponent,
        TranslocoTestModuleProvider.getModule()
      ],
      providers: [
        {
          provide: InvestmentIdeasService,
          useValue: {
            getAuthors: jasmine.createSpy('getAuthors').and.returnValue(new Subject()),
            getInvestmentIdeas: jasmine.createSpy('getInvestmentIdeas').and.returnValue(new Subject())
          }
        },
        {
          provide: WatchedInvestmentIdeasService,
          useValue: {
            setWatchedIdeasIds: jasmine.createSpy('setWatchedIdeasIds').and.callThrough(),
            getWatchedIdeasIds: jasmine.createSpy('getWatchedIdeasIds').and.returnValue(new Subject())
          }
        },
        MockProvider(BackButtonService),
        {
          provide: InstrumentsService,
          useValue: {
            getInstrument: jasmine.createSpy('getInstrument').and.returnValue(new Subject())
          }
        },
        {
          provide: MarketService,
          useValue: {
            getDefaultExchange: jasmine.createSpy('getDefaultExchange').and.returnValue(new Subject())
          }
        },
        MockProvider(StorageService)
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(InvestmentIdeasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
