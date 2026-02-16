import {
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';
import {
  ApiErrorsTracker,
  InvestmentIdea,
  InvestmentIdeasService
} from "@api-lib";
import { ViewModel } from "../../../core/models/view-model.model";
import { map } from "rxjs/operators";
import {
  Observable,
  shareReplay,
  startWith
} from "rxjs";
import { AsyncPipe } from "@angular/common";
import { NzSkeletonComponent } from "ng-zorro-antd/skeleton";
import { NzTypographyComponent } from "ng-zorro-antd/typography";
import { TranslocoDirective } from "@jsverse/transloco";
import { InvestmentIdeasApiErrorsTracker } from "../../services/investment-ideas-api-errors-tracker";

@Component({
  selector: 'tga-investment-ideas-preview',
  standalone: true,
  imports: [
    AsyncPipe,
    NzSkeletonComponent,
    NzTypographyComponent,
    TranslocoDirective
  ],
  templateUrl: './investment-ideas-preview.component.html',
  styleUrl: './investment-ideas-preview.component.less'
})
export class InvestmentIdeasPreviewComponent implements OnInit {

  @Output()
  unauthorizedError = new EventEmitter();

  viewModel$!: Observable<ViewModel<InvestmentIdea | null>>;

  constructor(
    private readonly investmentIdeasService: InvestmentIdeasService,
    private readonly apiErrorsTracker: ApiErrorsTracker
  ) {
  }

  ngOnInit(): void {
    const unauthorizedErrorCb = () => {
      this.unauthorizedError.emit();
    }

    const investmentIdeasApiErrorsTracker = new InvestmentIdeasApiErrorsTracker(
      this.apiErrorsTracker,
      unauthorizedErrorCb
    );

    this.viewModel$ =
      this.investmentIdeasService.getInvestmentIdeas({
          orderBy: 'timestamp',
          valid: true
        },
        {
          errorTracker: investmentIdeasApiErrorsTracker
        }
      ).pipe(
        map(i => {
          const ideas = i ?? [];

          const latestIdea = ideas.length > 0
            ? ideas[ideas.length - 1]
            : null;

          return {
            isUpdating: false,
            viewData: latestIdea
          };
        }),
        startWith(({
          isUpdating: true
        })),
        shareReplay(1)
      );
  }
}
