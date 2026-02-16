import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioEvaluationComponent } from './portfolio-evaluation.component';
import { SelectedPortfolioDataContextService } from "../../services/selected-portfolio-data-context.service";
import { Subject } from "rxjs";
import { PortfolioSummaryService } from "@api-lib";
import { TranslocoTestModuleProvider } from "../../../../testing-utils/transloco-test-module-provider";
import { MockProvider } from "ng-mocks";
import { LinksService, ModalService } from "@environment-services-lib";

describe('PortfolioEvaluationComponent', () => {
  let component: PortfolioEvaluationComponent;
  let fixture: ComponentFixture<PortfolioEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslocoTestModuleProvider.getModule(),
        PortfolioEvaluationComponent
      ],
      providers: [
        {
          provide: SelectedPortfolioDataContextService,
          useValue: {
            selectedPortfolio$: new Subject(),
            portfolios$: new Subject()
          }
        },
        {
          provide: PortfolioSummaryService,
          useValue: {
            getPortfolioSummary: jasmine.createSpy('getPortfolioSummary').and.returnValue(new Subject())
          }
        },
        MockProvider(ModalService),
        MockProvider(LinksService)
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
