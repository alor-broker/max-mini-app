import {
  ActivatedRouteSnapshot,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot
} from "@angular/router";
import { UserStateService } from "../services/user-state.service";
import { inject } from "@angular/core";
import {
  map,
  take
} from "rxjs";
import { RoutesHelper } from "../utils/routes.helper";

export class AuthGuard {
  static canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    const userStateService = inject(UserStateService);
    const router = inject(Router);

    return userStateService.state$.pipe(
      map(state => {
        if(state != null && state.user != null && state.ssoToken != null) {
          return true;
        }

        return router.parseUrl(RoutesHelper.urlForRoot(RoutesHelper.appRoutes.authentication.unlock))
      }),
      take(1)
    );
  }
}
