import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  Observable,
  switchMap,
  take
} from "rxjs";
import { ApiTokenProviderService } from "../services/api-token-provider.service";
import { HttpContextTokens } from "@api-lib";
@Injectable()
export class ApiTokenInterceptor implements HttpInterceptor {
  constructor(
    private readonly aApiTokenProviderService: ApiTokenProviderService
  ) {
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.context.get(HttpContextTokens.SkipAuthorization)) {
      return next.handle(req);
    }

    return this.aApiTokenProviderService.apiToken$
      .pipe(
        take(1),
        switchMap(
          token => {
            return next.handle(req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            }));
          }
        ),
      );
  }

}
