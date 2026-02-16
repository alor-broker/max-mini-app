import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { LimitOrderFormComponent } from './limit-order-form.component';
import { TranslocoTestModuleProvider } from "../../../../../testing-utils/transloco-test-module-provider";
import {
  MockComponent,
  MockProvider
} from "ng-mocks";
import { OrdersService } from "@api-lib";
import { SubmitOrderButtonsComponent } from "../../submit-order-buttons/submit-order-buttons.component";
import { OrderEvaluationComponent } from "../../order-evaluation/order-evaluation.component";
import { SelectedPortfolioDataContextService } from "../../../../home/services/selected-portfolio-data-context.service";
import { Subject } from "rxjs";
import {
  LinksService,
  ModalService
} from "@environment-services-lib";
import { CommonParametersService } from "../../../sevices/commom-parameters/common-parameters.service";

describe('LimitOrderComponent', () => {
  let component: LimitOrderFormComponent;
  let fixture: ComponentFixture<LimitOrderFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslocoTestModuleProvider.getModule(),
        LimitOrderFormComponent,
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
        MockProvider(ModalService),
        MockProvider(LinksService)
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LimitOrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
