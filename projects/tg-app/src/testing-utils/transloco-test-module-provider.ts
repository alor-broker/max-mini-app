import {
  TranslocoTestingModule,
  TranslocoTestingOptions
} from "@jsverse/transloco";
import { ModuleWithProviders } from "@angular/core";

export class TranslocoTestModuleProvider {
  static getModule(options: TranslocoTestingOptions = {}): ModuleWithProviders<TranslocoTestingModule> {
    const { langs } = options;

    return TranslocoTestingModule.forRoot({
      langs: { ...langs },
      translocoConfig: {
        availableLangs: ['ru'],
        defaultLang: 'ru',
      },
      preloadLangs: true,
    });
  }
}
