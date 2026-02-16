import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioSelectionComponent } from './portfolio-selection.component';
import { SelectedPortfolioDataContextService } from "../../services/selected-portfolio-data-context.service";
import { Subject } from "rxjs";

describe('PortfolioSelectionComponent', () => {
  let component: PortfolioSelectionComponent;
  let fixture: ComponentFixture<PortfolioSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioSelectionComponent],
      providers:[
        {
          provide: SelectedPortfolioDataContextService,
          useValue: {
            portfolios$: new Subject(),
            selectedPortfolio$: new Subject()
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
