import { Component, OnInit } from '@angular/core';
import { SelectedPortfolioDataContextService } from "../../services/selected-portfolio-data-context.service";
import { PortfolioSummary, PortfolioSummaryService } from "@api-lib";
import { filter, Observable, of, shareReplay, startWith } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { AsyncPipe, DecimalPipe } from "@angular/common";
import { NzTypographyComponent } from "ng-zorro-antd/typography";
import { ViewModel } from "../../../core/models/view-model.model";
import { Portfolio } from "../../../core/models/porfolio.models";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { TranslocoDirective } from "@jsverse/transloco";
import { ButtonType, LinksService, ModalService } from "@environment-services-lib";
import { TranslatorService } from "../../../core/services/translator.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: 'tga-portfolio-evaluation',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    NzTypographyComponent,
    NzIconDirective,
    TranslocoDirective
  ],
  templateUrl: './portfolio-evaluation.component.html',
  styleUrl: './portfolio-evaluation.component.less'
})
export class PortfolioEvaluationComponent implements OnInit {
  viewModel$!: Observable<ViewModel<PortfolioSummary>>;

  constructor(
    private readonly selectedPortfolioDataContextService: SelectedPortfolioDataContextService,
    private readonly apiPortfolioSummaryService: PortfolioSummaryService,
    private readonly modalService: ModalService,
    private readonly translatorService: TranslatorService,
    private readonly linksService: LinksService
  ) {
  }

  ngOnInit(): void {
    const getSummary = (portfolio: Portfolio): Observable<ViewModel<PortfolioSummary>> => {
      return this.apiPortfolioSummaryService.getPortfolioSummary(portfolio.portfolioKey).pipe(
        filter((p): p is PortfolioSummary => p != null),
        map(s => ({
          isUpdating: false,
          viewData: s
        })),
        startWith(({
          isUpdating: true
        })),
      )
    };

    this.viewModel$ = this.selectedPortfolioDataContextService.portfolios$
      .pipe(
        switchMap((portfolios) => {
          if (portfolios.length > 0) {
            return this.selectedPortfolioDataContextService.selectedPortfolio$
              .pipe(
                switchMap(portfolio => getSummary(portfolio))
              )
          } else {
            this.showEmptyPortfoliosModal();
          }

          return of({ isUpdating: false });
        }),
        startWith(({
          isUpdating: true
        })),
        shareReplay(1)
      );
  }

  private showEmptyPortfoliosModal() {
    this.translatorService.getTranslator('home/portfolio-evaluation')
      .pipe(
        switchMap(t => this.modalService.showMessage({
            title: t(['emptyPortfoliosModalTitle']),
            message: t(['emptyPortfoliosModalText']),
            buttons: [
              {
                text: t(['emptyPortfoliosModalButton']),
                id: 'deposit'
              },
              {
                type: ButtonType.Close
              }
            ]
          })
        )
      )
      .subscribe(id => {
        if (id === 'deposit') {
          this.linksService.openBrowserLink(environment.externalLinks.personalAccount + '/operations/money/money_input')
        }
      })
  }
}
