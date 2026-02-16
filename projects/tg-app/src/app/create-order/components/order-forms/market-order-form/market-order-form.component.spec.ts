import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { MarketOrderFormComponent } from './market-order-form.component';
import { TranslocoTestModuleProvider } from "../../../../../testing-utils/transloco-test-module-provider";
import {
  MockComponent,
  MockProvider
} from "ng-mocks";
import {
  OrdersService,
  QuotesService
} from "@api-lib";
import { SubmitOrderButtonsComponent } from "../../submit-order-buttons/submit-order-buttons.component";
import { OrderEvaluationComponent } from "../../order-evaluation/order-evaluation.component";
import { SelectedPortfolioDataContextService } from "../../../../home/services/selected-portfolio-data-context.service";
import { Subject } from "rxjs";
import { CommonParametersService } from "../../../sevices/commom-parameters/common-parameters.service";
import {
  LinksService,
  ModalService
} from "@environment-services-lib";

describe('MarketOrderFormComponent', () => {
  let component: MarketOrderFormComponent;
  let fixture: ComponentFixture<MarketOrderFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslocoTestModuleProvider.getModule(),
        MarketOrderFormComponent,
        MockComponent(SubmitOrderButtonsComponent),
        MockComponent(OrderEvaluationComponent)
      ],
      providers: [
        MockProvider(OrdersService),
        MockProvider(
          SelectedPortfolioDataContextService,
          {
            selectedPortfolio$: new Subject()
          }
        ),
        MockProvider(
          CommonParametersService,
          {
            parameters$: new Subject()
          }
        ),
        MockProvider(
          QuotesService,
          {
            getLastQuoteInfo: () => new Subject()
          }
        ),
        MockProvider(LinksService),
        MockProvider(ModalService)
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketOrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
