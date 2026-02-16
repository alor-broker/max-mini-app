import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitOrderButtonsComponent } from './submit-order-buttons.component';
import { TranslocoTestModuleProvider } from "../../../../testing-utils/transloco-test-module-provider";

describe('SubmitOrderButtonsComponent', () => {
  let component: SubmitOrderButtonsComponent;
  let fixture: ComponentFixture<SubmitOrderButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslocoTestModuleProvider.getModule(),
        SubmitOrderButtonsComponent
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitOrderButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
