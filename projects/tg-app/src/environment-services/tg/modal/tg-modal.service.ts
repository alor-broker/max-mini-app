import { Inject, Injectable } from '@angular/core';
import { TelegramWebApp, WebApp } from "@m1cron-labs/ng-telegram-mini-app";
import { Observable } from "rxjs";
import { ModalParams, ModalService } from "@environment-services-lib";

@Injectable()
export class TgModalService extends ModalService {

  private maxModalMessageLength = 256;

  constructor(
    @Inject(TelegramWebApp) private readonly tgWebApp: WebApp
  ) {
    super();
  }

  override showMessage(params: ModalParams): Observable<string> {
    return new Observable<string>(subscriber => {
      if (!this.tgWebApp.isVersionAtLeast('6.2')) {
        subscriber.complete();
        return;
      }

      let modalMessage = params.message;
      modalMessage = modalMessage.length <= this.maxModalMessageLength
        ? modalMessage
        : modalMessage.slice(0, this.maxModalMessageLength - 3) + '...';

      this.tgWebApp.showPopup({
        ...params,
        message: modalMessage,
        buttons: (params.buttons?.length ?? 0 > 0) ? params.buttons : [{ text: 'OK' }]
      }, (buttonId?: string) => {
        subscriber.next(buttonId);
        subscriber.complete();
      });
    })
  }
}
