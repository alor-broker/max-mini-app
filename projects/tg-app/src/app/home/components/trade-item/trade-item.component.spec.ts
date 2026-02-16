import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { TradeItemComponent } from './trade-item.component';
import { TranslocoTestModuleProvider } from "../../../../testing-utils/transloco-test-module-provider";
import { PortfolioTrade } from "@api-lib";
import { MockProvider } from "ng-mocks";
import { BackButtonService } from "@environment-services-lib";

describe('TradeItemComponent', () => {
  let component: TradeItemComponent;
  let fixture: ComponentFixture<TradeItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslocoTestModuleProvider.getModule(),
        TradeItemComponent
      ],
      providers: [
        MockProvider(BackButtonService)
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TradeItemComponent);
    component = fixture.componentInstance;
    component.trade = {} as PortfolioTrade;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
