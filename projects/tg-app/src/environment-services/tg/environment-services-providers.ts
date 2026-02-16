import { Provider } from "@angular/core";
import {
  ThemingService,
  StorageService,
  BiometryService,
  BackButtonService,
  LinksService,
  PlatformInfoService,
  ModalService,
  HapticFeedbackService,
  LanguageService
} from "@environment-services-lib";
import { TgThemingService } from "./theming/tg-theming.service";
import { TgStorageService } from "./storage/tg-storage.service";
import { TgBiometryService } from "./biometry/tg-biometry.service";
import { TgBackButtonService } from "./back-button/tg-back-button.service";
import { TgLinksService } from "./links/tg-links.service";
import { TgPlatformInfoService } from "./platform-info/tg-platform-info.service";
import { TgModalService } from "./modal/tg-modal.service";
import { TgHapticFeedbackService } from "./haptic-feedback/tg-haptic-feedback.service";
import { TgLanguageService } from "./language/tg-language.service";

export const EnvironmentServicesProviders: Provider[] = [
  {
    provide: ThemingService,
    useClass: TgThemingService
  },
  {
    provide: StorageService,
    useClass: TgStorageService
  },
  {
    provide: BiometryService,
    useClass: TgBiometryService
  },
  {
    provide: BackButtonService,
    useClass: TgBackButtonService
  },
  {
    provide: LinksService,
    useClass: TgLinksService
  },
  {
    provide: PlatformInfoService,
    useClass: TgPlatformInfoService
  },
  {
    provide: ModalService,
    useClass: TgModalService
  },
  {
    provide: HapticFeedbackService,
    useClass: TgHapticFeedbackService
  },
  {
    provide: LanguageService,
    useClass: TgLanguageService
  }
];
