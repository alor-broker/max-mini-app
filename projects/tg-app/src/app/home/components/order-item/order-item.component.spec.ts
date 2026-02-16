import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { OrderItemComponent } from './order-item.component';
import { TranslocoTestModuleProvider } from "../../../../testing-utils/transloco-test-module-provider";
import { OrdersService, PortfolioOrder } from "@api-lib";
import { MockProvider } from "ng-mocks";
import { BackButtonService, LinksService, ModalService } from "@environment-services-lib";
import { TranslatorService } from "../../../core/services/translator.service";
import { Subject } from "rxjs";

describe('OrderItemComponent', () => {
  let component: OrderItemComponent;
  let fixture: ComponentFixture<OrderItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OrderItemComponent,
        TranslocoTestModuleProvider.getModule()
      ],
      providers: [
        MockProvider(BackButtonService),
        MockProvider(
          OrdersService,
          {
            getOrder: () => new Subject()
          }
        ),
        MockProvider(ModalService),
        MockProvider(
          TranslatorService,
          {
            getTranslator: () => new Subject()
          }
        ),
        MockProvider(LinksService),
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OrderItemComponent);
    component = fixture.componentInstance;
    component.orderData = {} as PortfolioOrder;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
