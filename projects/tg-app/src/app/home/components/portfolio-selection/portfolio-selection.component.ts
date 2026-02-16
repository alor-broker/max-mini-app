import {
  Component,
  OnInit
} from '@angular/core';
import { SelectedPortfolioDataContextService } from "../../services/selected-portfolio-data-context.service";
import {
  Observable,
  of,
  shareReplay,
  startWith
} from "rxjs";
import { Portfolio } from "../../../core/models/porfolio.models";
import { NzButtonComponent } from "ng-zorro-antd/button";
import {
  NzDropdownButtonDirective,
  NzDropDownDirective,
  NzDropdownMenuComponent
} from "ng-zorro-antd/dropdown";
import {
  NzMenuDirective,
  NzMenuItemComponent
} from "ng-zorro-antd/menu";
import { AsyncPipe } from "@angular/common";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { map } from "rxjs/operators";
import { ViewModel } from "../../../core/models/view-model.model";
import { mapWith } from "../../../core/utils/observable-helper";

interface PortfolioSelectionViewData {
  allPortfolios: Portfolio[];
  selectedPortfolio: Portfolio;
}

@Component({
  selector: 'tga-portfolio-selection',
  standalone: true,
  imports: [
    NzButtonComponent,
    NzDropdownButtonDirective,
    NzDropDownDirective,
    NzDropdownMenuComponent,
    NzMenuDirective,
    NzMenuItemComponent,
    AsyncPipe,
    NzIconDirective
  ],
  templateUrl: './portfolio-selection.component.html',
  styleUrl: './portfolio-selection.component.less'
})
export class PortfolioSelectionComponent implements OnInit {
  viewModel$!: Observable<ViewModel<PortfolioSelectionViewData>>;

  constructor(private readonly selectedPortfolioDataContextService: SelectedPortfolioDataContextService) {
  }

  ngOnInit(): void {
    const selection$ = this.selectedPortfolioDataContextService.portfolios$
      .pipe(
        mapWith(
          portfolios => portfolios.length > 0
            ? this.selectedPortfolioDataContextService.selectedPortfolio$
            : of(null),
          (allPortfolios, selectedPortfolio) => {
            if (allPortfolios.length === 0 || selectedPortfolio == null) {
              return;
            }

            return { allPortfolios, selectedPortfolio };
          }
        )
      )

    this.viewModel$ = selection$.pipe(
      map(s => ({
          isUpdating: false,
          viewData: s
        })
      ),
      startWith(({
          isUpdating: true
        })
      ),
      shareReplay(1)
    )
  }

  changeSelection(newSelection: Portfolio): void {
    this.selectedPortfolioDataContextService.selectPortfolio(newSelection);
  }
}
