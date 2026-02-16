import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Evaluation, EvaluationRequest, EvaluationService } from "@api-lib";
import { BehaviorSubject, filter, Observable } from "rxjs";
import { switchMap } from "rxjs/operators";
import { AsyncPipe, CurrencyPipe } from "@angular/common";
import { NzDescriptionsComponent, NzDescriptionsItemComponent } from "ng-zorro-antd/descriptions";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: 'tga-order-evaluation',
  standalone: true,
  imports: [
    AsyncPipe,
    NzDescriptionsComponent,
    NzDescriptionsItemComponent,
    CurrencyPipe,
    TranslocoDirective
  ],
  templateUrl: './order-evaluation.component.html',
  styleUrl: './order-evaluation.component.less'
})
export class OrderEvaluationComponent implements OnInit, OnDestroy {

  private readonly evaluationRequest$ = new BehaviorSubject<EvaluationRequest | null>(null);
  evaluation$!: Observable<Evaluation | null>;

  @Input({required: true})
  set evaluationProperties(evaluationProperties: EvaluationRequest | null) {
    this.evaluationRequest$.next(evaluationProperties);
  }

  @Input() currency = 'RUB';

  constructor(
    private readonly evaluationService: EvaluationService
  ) {
  }

  ngOnInit() {
    const getEvaluationDisplay = (request: EvaluationRequest): Observable<Evaluation | null> =>
      this.evaluationService.evaluateOrder(request);

    this.evaluation$ = this.evaluationRequest$.pipe(
      filter((er): er is EvaluationRequest => er != null),
      switchMap(er => getEvaluationDisplay(er))
    );
  }

  ngOnDestroy() {
    this.evaluationRequest$.complete();
  }
}
