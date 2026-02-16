import {
  ApplicationConfig,
  isDevMode,
  provideZoneChangeDetection
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding
} from '@angular/router';
import { ApplicationProviders } from './application-providers'

import { routes } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi
} from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { ApiTokenInterceptor } from "./core/interceptors/api-token-interceptor";
import { NZ_I18N, ru_RU } from "ng-zorro-antd/i18n";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoader } from "./transloco-http-loader";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding()
    ),
    provideHttpClient(
      withInterceptorsFromDi(),
    ),
    provideAnimations(),
    //-----
    provideTransloco({
      config: {
        availableLangs: ['en', 'ru'],
        defaultLang: 'ru',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader
    }),
    ApplicationProviders,
    {
      provide: NZ_I18N,
      useValue: ru_RU
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiTokenInterceptor,
      multi: true
    },
  ]
};
