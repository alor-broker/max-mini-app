import { Inject, Injectable } from '@angular/core';
import { LanguageService } from "@environment-services-lib";
import { TelegramWebApp, WebApp } from "@m1cron-labs/ng-telegram-mini-app";

@Injectable()
export class TgLanguageService extends LanguageService {

  constructor(
    @Inject(TelegramWebApp) private readonly tgWebApp: WebApp
  ) {
    super();
  }

  override getSystemLang(): string {
    return this.tgWebApp.initDataUnsafe.user?.language_code ?? 'ru';
  }
}
