import { Provider } from "@angular/core";
import {
  ApiConfigProvider,
  ApiErrorsTracker
} from "@api-lib";
import { TgAppApiConfigProvider } from "../environment-services/api/tg-app-api-config-provider";
import { EnvironmentServicesProviders } from "../environment-services/tg/environment-services-providers";
import { TgAppApiErrorsTracker } from "../environment-services/api/tg-app-api-errors-tracker";

export const ApplicationProviders: Provider[] = [
  ...EnvironmentServicesProviders,
  {
    provide: ApiConfigProvider,
    useClass: TgAppApiConfigProvider
  },
  {
    provide: ApiErrorsTracker,
    useClass: TgAppApiErrorsTracker
  }
]
