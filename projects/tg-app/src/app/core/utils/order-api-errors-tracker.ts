import { ApiErrorsTracker } from "@api-lib";
import { ButtonType, LinksService, ModalService } from "@environment-services-lib";
import { HttpErrorResponse } from "@angular/common/http";
import { Clipboard } from "@angular/cdk/clipboard";
import { environment } from "../../../environments/environment";
import { TranslatorService } from "../services/translator.service";
import { switchMap } from "rxjs";
import { OrderActionType } from "../models/order-api-errors-tracker.model";
import { mapWith } from "./observable-helper";
import { ButtonId } from "../../../environment-services/api/tg-app-api-errors-tracker.model";
import { Injectable } from "@angular/core";

@Injectable()
export class OrderApiErrorsTracker extends ApiErrorsTracker {

  private orderActionType!: OrderActionType;

  constructor(
    private readonly modalService: ModalService,
    private readonly clipboard: Clipboard,
    private readonly linksService: LinksService,
    private readonly translatorService: TranslatorService
  ) {
    super();
  }

  override track(error: Error): void {
    if (error instanceof HttpErrorResponse) {
      this.translatorService.getTranslator('core/order-api-errors-tracker')
        .pipe(
          mapWith(
            () => this.translatorService.getTranslator(''),
            (tOrderErrors, tMainErrors) => ({ tOrderErrors, tMainErrors })
          ),
          switchMap(({ tOrderErrors, tMainErrors }) => this.modalService.showMessage({
              message:
                `${ tMainErrors([ 'apiErrorsTracker', 'errorCode' ]) }: ${ error.error.code }\n` +
                `${ tMainErrors([ 'apiErrorsTracker', 'errorText' ]) }: ${ error.error.message }\n\n` +
                `${ tMainErrors([ 'apiErrorsTracker', 'helpInfo' ]) }`,
              title: this.orderActionType === OrderActionType.Create ? tOrderErrors([ 'createOrderErrorTitle' ]) : tOrderErrors([ 'cancelOrderErrorTitle' ]),
              buttons: [
                {
                  id: ButtonId.Copy,
                  text: tMainErrors([ 'apiErrorsTracker', 'copyBtn' ])
                },
                {
                  id: ButtonId.Support,
                  text: tMainErrors([ 'apiErrorsTracker', 'supportBtn' ])
                },
                {
                  type: ButtonType.Close
                }
              ]
            })
          )
        )
        .subscribe(buttonId => {
          switch (buttonId) {
            case ButtonId.Copy:
              this.clipboard.copy(JSON.stringify(error.error));
              break;
            case ButtonId.Support:
              this.clipboard.copy(JSON.stringify(error.error));
              this.linksService.openApplicationLink(environment.externalLinks.tgAlorSupport)
          }
        });
    }
  }

  setActionType(actionType: OrderActionType) {
    this.orderActionType = actionType;
  }
}
