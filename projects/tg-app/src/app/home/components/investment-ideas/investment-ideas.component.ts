import {
  Component,
  DestroyRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { NzDescriptionsComponent, NzDescriptionsItemComponent } from "ng-zorro-antd/descriptions";
import {
  InvestmentIdeasService,
  InvestmentIdea,
  InstrumentsService,
  InstrumentKey
} from "@api-lib";
import { BehaviorSubject, forkJoin, Observable, of, shareReplay, tap } from "rxjs";
import { AsyncPipe, CommonModule } from "@angular/common";
import { mapWith } from "../../../core/utils/observable-helper";
import { NzSpinComponent } from "ng-zorro-antd/spin";
import { BackButtonService, StorageService } from "@environment-services-lib";
import { MarketService } from "../../../core/services/market.service";
import { map } from "rxjs/operators";
import { WatchedInvestmentIdeasService } from "../../services/watched-investment-ideas.service";
import { NzCollapseComponent, NzCollapsePanelComponent } from "ng-zorro-antd/collapse";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { NzButtonComponent } from "ng-zorro-antd/button";
import { NzAlertComponent } from "ng-zorro-antd/alert";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { StorageKeys } from "../../../core/utils/storage-keys";
import { TranslocoDirective } from "@jsverse/transloco";


interface InvestmentIdeaExtended extends InvestmentIdea {
  userFullName: string;
  symbolShortName: string;
}

@Component({
  selector: 'tga-investment-ideas',
  standalone: true,
  imports: [
    CommonModule,
    NzSpinComponent,
    NzCollapseComponent,
    NzCollapsePanelComponent,
    NzDescriptionsComponent,
    NzDescriptionsItemComponent,
    NzIconDirective,
    AsyncPipe,
    NzButtonComponent,
    NzAlertComponent,
    TranslocoDirective
  ],
  templateUrl: './investment-ideas.component.html',
  styleUrl: './investment-ideas.component.less'
})
export class InvestmentIdeasComponent implements OnInit, OnDestroy {

  @Output() onBack = new EventEmitter();

  showDisclaimer$ = new BehaviorSubject<boolean>(false);

  isOldIdeasRequested$ = new BehaviorSubject(false);
  isLoading$ = new BehaviorSubject(true);
  investmentIdeas$!: Observable<InvestmentIdeaExtended[]>;

  watchedIdeasIdsSet?: Set<number>;

  constructor(
    private readonly investmentIdeasService: InvestmentIdeasService,
    private readonly watchedInvestmentIdeasService: WatchedInvestmentIdeasService,
    private readonly backButtonService: BackButtonService,
    private readonly instrumentsService: InstrumentsService,
    private readonly marketService: MarketService,
    private readonly storageService: StorageService,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit() {
    this.checkShowDisclaimer();
    this.investmentIdeas$ = this.getInvestmentIdeas();
    this.backButtonService.onClick(this.onBackButtonCallback);
    this.backButtonService.show();
  }

  ngOnDestroy() {
    if (this.watchedIdeasIdsSet != null) {
      this.watchedInvestmentIdeasService.setWatchedIdeasIds(Array.from(this.watchedIdeasIdsSet));
    }
    this.backButtonService.offClick(this.onBackButtonCallback);
    this.isLoading$.complete();
    this.isOldIdeasRequested$.complete();
    this.showDisclaimer$.complete();
  }

  private onBackButtonCallback = () => {
    this.onBack.emit();
    this.backButtonService.hide();
  }

  private instrumentKeyFromTicker(ticker: string, defaultExchange: string): InstrumentKey {
    const parts = ticker.split(':');
    const exchange = parts.length > 1
      ? parts[0]
      : defaultExchange!;
    const symbol = parts.length > 1 ? parts[1] : parts[0];
    const board = parts[2];

    return {
      exchange: exchange.toUpperCase(),
      symbol,
      board
    };
  }

  private initWatchedIdeas(ideas: InvestmentIdeaExtended[]) {
    this.watchedInvestmentIdeasService.getWatchedIdeasIds()
      .subscribe(ids => {
        const currentIdeasIds = ideas.map(idea => idea.signalId);
        this.watchedIdeasIdsSet = new Set(ids.filter(id => currentIdeasIds.includes(id)));
      })
  }

  watchIdea(id: number) {
    this.watchedIdeasIdsSet!.add(id);
  }

  loadOldIdeas() {
    this.investmentIdeas$ = this.investmentIdeas$
      .pipe(
        mapWith(
          () => this.getInvestmentIdeas(true),
          (ideas, oldIdeas) => [...ideas, ...oldIdeas]
        ),
        tap(() => this.isOldIdeasRequested$.next(true))
      );
  }

  checkShowDisclaimer() {
    this.storageService.getItem(StorageKeys.InvestmentIdeasDisclaimer)
      .subscribe(val => {
        if (val == null) {
          this.showDisclaimer$.next(true);
        }
      })
  }

  onDisclaimerClosed() {
    this.storageService.setItem(StorageKeys.InvestmentIdeasDisclaimer, 'true')
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.showDisclaimer$.next(false);
      })
  }

  private getInvestmentIdeas(isInvalidAllowed = false) {
    this.isLoading$.next(true);

    return this.investmentIdeasService.getAuthors()
      .pipe(
        // get investment ideas with author name
        mapWith(
          () => this.investmentIdeasService.getInvestmentIdeas({
            orderBy: 'timestamp',
            valid: !isInvalidAllowed
          }),
          (authors, ideas) => {
            return (ideas ?? [])
              .reverse()
              .map(idea => {
                const userFullName = authors?.find(a => a.userId === idea.userId)?.fullName ?? 'Неизвестен';

                return {
                  ...idea,
                  userFullName
                } as InvestmentIdeaExtended;
              })
          }
        ),
        mapWith(
          () => this.marketService.getDefaultExchange(),
          (ideas, defaultExchange) => ({ ideas, defaultExchange })
        ),
        // get investment ideas with symbol short name
        mapWith(
          ({ ideas, defaultExchange }) => {
            if (ideas.length === 0) {
              return of({} as { [instrName: string]: string });
            }

            const tickersMap = new Map<string, Observable<string>>;

            ideas.forEach(idea => {
              if (!tickersMap.has(idea.symbol)) {
                tickersMap.set(
                  idea.symbol,
                  this.instrumentsService.getInstrument(this.instrumentKeyFromTicker(idea.symbol, defaultExchange!))
                    .pipe(
                      map(i => i?.shortname ?? '')
                    )
                )
              }
            });

            return forkJoin(Object.fromEntries(tickersMap));
          },
          ({ ideas }, tickers) => ideas.map(idea => ({
              ...idea,
              symbolShortName: tickers[idea.symbol]
            })
          )
        ),
        tap(ideas => this.initWatchedIdeas(ideas)),
        tap(() => this.isLoading$.next(false)),
        shareReplay(1)
      );
  }
}
