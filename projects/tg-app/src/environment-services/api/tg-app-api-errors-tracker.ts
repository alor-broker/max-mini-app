import { ApiErrorsTracker } from "@api-lib";
import { ButtonType, LinksService, ModalService } from "@environment-services-lib";
import { TranslatorService } from "../../app/core/services/translator.service";
import { HttpErrorResponse } from "@angular/common/http";
import { switchMap } from "rxjs";
import { environment } from "../../environments/environment";
import { mapWith } from "../../app/core/utils/observable-helper";
import { ButtonId } from "./tg-app-api-errors-tracker.model";
import { Clipboard } from "@angular/cdk/clipboard";
import { Injectable } from "@angular/core";

@Injectable()
export class TgAppApiErrorsTracker extends ApiErrorsTracker {

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
      this.translatorService.getTranslator('environment-services/tg-app-api-errors-service')
        .pipe(
          mapWith(
            () => this.translatorService.getTranslator(''),
            (tApiErrors, tMainErrors) => ({ tApiErrors, tMainErrors })
          ),
          switchMap(({ tApiErrors, tMainErrors }) => this.modalService.showMessage({
              message:
                `${ tMainErrors([ 'apiErrorsTracker', 'errorCode' ]) }: ${ error.error?.code ?? error.status }\n` +
                `${ tMainErrors([ 'apiErrorsTracker', 'errorText' ]) }: ${ error.error?.message ?? error.message }\n\n` +
                `${ tMainErrors([ 'apiErrorsTracker', 'helpInfo' ]) }`,
              title: tApiErrors(['errorTitle']),
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
              this.clipboard.copy(JSON.stringify(error.error == null ? error : error.error));
              break;
            case ButtonId.Support:
              this.clipboard.copy(JSON.stringify(error.error == null ? error : error.error));
              this.linksService.openApplicationLink(environment.externalLinks.tgAlorSupport)
          }
        });
    }
  }
}
