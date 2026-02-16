import { Inject, Injectable } from '@angular/core';
import { HapticFeedbackService, ImpactHapticStyle, NotificationHapticStyle } from "@environment-services-lib";
import { HapticFeedback, NotificationType, TelegramWebApp, WebApp } from "@m1cron-labs/ng-telegram-mini-app";

@Injectable()
export class TgHapticFeedbackService extends HapticFeedbackService {

  private hapticFeedbackCtx: HapticFeedback | null = null;

  constructor(
    @Inject(TelegramWebApp) private readonly tgWebApp: WebApp
  ) {
    super();

    if (tgWebApp.isVersionAtLeast('6.1')) {
      this.hapticFeedbackCtx = tgWebApp.HapticFeedback;
    }
  }

  override impactOccurred(style: ImpactHapticStyle) {
    this.hapticFeedbackCtx?.impactOccurred(style);
  }

  override notificationOccurred(style: NotificationHapticStyle) {
    switch (style) {
      case NotificationHapticStyle.Error:
        this.hapticFeedbackCtx?.notificationOccurred(NotificationType.Error);
        break;
      case NotificationHapticStyle.Warning:
        this.hapticFeedbackCtx?.notificationOccurred(NotificationType.Warning);
        break;
      case NotificationHapticStyle.Success:
        this.hapticFeedbackCtx?.notificationOccurred(NotificationType.Success);
        break;
    }
  }
}
