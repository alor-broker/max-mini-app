import {
  ApiConfig,
  ApiConfigProvider
} from "@api-lib";
import {
  Observable,
  of
} from "rxjs";
import { environment } from "../../environments/environment";

export class TgAppApiConfigProvider extends ApiConfigProvider {
  getConfig(): Observable<ApiConfig> {
    return of({
      apiUrl: environment.apiUrl,
      userDataUrl: environment.userDataUrl,
      superAppUrl: environment.superAppUrl
    });
  }
}
