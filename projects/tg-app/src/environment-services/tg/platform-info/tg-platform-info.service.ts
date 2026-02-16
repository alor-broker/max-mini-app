import { Inject, Injectable } from '@angular/core';
import { PlatformInfoService } from "@environment-services-lib";
import { TelegramWebApp, WebApp } from "@m1cron-labs/ng-telegram-mini-app";

@Injectable()
export class TgPlatformInfoService extends PlatformInfoService {

  private readonly desktopPlatforms = ['windows', 'macos', 'linux', 'web'];

  constructor(
    @Inject(TelegramWebApp) private readonly tgWebApp: WebApp
  ) {
    super();
  }

  override isDesktopPlatform(): boolean {
    return this.desktopPlatforms.includes(this.tgWebApp.platform);
  }
}
