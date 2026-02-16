import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentIdeasPreviewComponent } from './investment-ideas-preview.component';
import { ApiErrorsTracker, InvestmentIdeasService } from "@api-lib";
import { Subject } from "rxjs";
import { MockProvider } from "ng-mocks";

describe('InvestmentIdeasPreviewComponent', () => {
  let component: InvestmentIdeasPreviewComponent;
  let fixture: ComponentFixture<InvestmentIdeasPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentIdeasPreviewComponent],
      providers: [
        {
          provide: InvestmentIdeasService,
          useValue: {
            getInvestmentIdeas: jasmine.createSpy('getInvestmentIdeas').and.returnValue(new Subject())
          }
        },
        MockProvider(ApiErrorsTracker)
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestmentIdeasPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
