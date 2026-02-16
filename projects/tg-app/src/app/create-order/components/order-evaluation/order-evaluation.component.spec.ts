import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderEvaluationComponent } from './order-evaluation.component';
import { TranslocoTestModuleProvider } from "../../../../testing-utils/transloco-test-module-provider";
import { MockProvider } from "ng-mocks";
import { EvaluationService } from "@api-lib";
import { Subject } from "rxjs";

describe('OrderEvaluationComponent', () => {
  let component: OrderEvaluationComponent;
  let fixture: ComponentFixture<OrderEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslocoTestModuleProvider.getModule(),
        OrderEvaluationComponent
      ],
      providers: [
        MockProvider(
          EvaluationService,
          {
            evaluateOrder: () => new Subject()
          }
        )
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
