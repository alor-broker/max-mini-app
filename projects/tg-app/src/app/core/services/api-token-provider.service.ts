import { Injectable } from '@angular/core';
import {
  SsoToken,
  UserState,
  UserStateService
} from "./user-state.service";
import { AuthService } from "../../../../../api-lib/src/auth/auth.service";
import { StorageService } from "@environment-services-lib";
import { environment } from "../../../environments/environment";
import { User } from "../models/user.models";
import {
  distinct,
  filter,
  interval,
  map,
  NEVER,
  Observable,
  of,
  shareReplay,
  switchMap
} from "rxjs";
import { mapWith } from "../utils/observable-helper";
import { StorageKeys } from "../utils/storage-keys";

export interface JwtBody {
  exp: number;
  portfolios: string;
  clientid: string;
  ein: string;
  agreements: string;
  sub: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiTokenProviderService {
  readonly apiToken$: Observable<string>;

  constructor(
    private readonly userStateService: UserStateService,
    private readonly apiAuthService: AuthService,
    private readonly storageService: StorageService,
  ) {
    this.apiToken$ = this.userStateService.state$.pipe(
      filter(u => u != null),
      switchMap((userState, index) => {
        if (
          userState?.ssoToken?.refreshToken != null
          && userState.ssoToken.refreshToken.length > 0
          && ((userState.ssoToken.jwt == null || userState.ssoToken.jwt.length == 0) || !this.isAuthorised(userState?.ssoToken))
        ) {
          // refreshToken is set after login. Need to get jwt
          this.refreshToken(userState);
          return NEVER;
        } else if (this.isAuthorised(userState?.ssoToken)) {
          // token is restored. Need to refresh
          if (index === 0) {
            this.refreshToken(userState!);
            return NEVER;
          }
        } else {
          // user is not authorized
          this.storageService.removeItem(StorageKeys.SsoToken)
            .subscribe(() => this.redirectToSso(userState?.isExited ?? false));
          return NEVER;
        }

        return of(userState);
      }),
      mapWith(() => interval(1000), (userState,) => userState),
      switchMap(userState => {
        if (this.isAuthorised(userState?.ssoToken)) {
          return of(userState);
        }

        this.refreshToken(userState!);
        return NEVER;
      }),
      shareReplay(1),
      filter(userState => this.isAuthorised(userState?.ssoToken)),
      map(userState => userState!.ssoToken!.jwt!),
      distinct()
    );

    this.storageService.getItem(StorageKeys.SsoToken)
      .subscribe(token => {
        if (token == null) {
          this.updateUserState({
            ssoToken: {
              refreshToken: ''
            },
            user: null,
            isExited: false
          });
          return;
        }

        this.setRefreshToken(token);
      });
  }

  setRefreshToken(token: string, cb?: (isSaved: boolean) => void): void {
    this.storageService.setItem(StorageKeys.SsoToken, token)
      .subscribe(isSaved => {
          this.updateUserState({
            ssoToken: {
              refreshToken: token
            },
            user: null,
            isExited: false
          });

          cb?.(isSaved);
        }
      );
  }

  logout() {
    this.storageService.removeItem(StorageKeys.SsoToken)
      .subscribe(isRemoved => {
          if (!isRemoved) {
            console.log('Not removed');
            return;
          }

          this.redirectToSso(true);
        }
      );
  }

  private redirectToSso(isExit: boolean): void {
    window.location.assign(environment.ssoUrl + `?url=http://${window.location.host}/auth&scope=MiniApp` + (isExit ? '&exit=1' : ''));
  }

  private refreshToken(userState: UserState): void {
    const refreshToken = userState.ssoToken?.refreshToken;

    if (refreshToken == null) {
      return;
    }

    this.apiAuthService.refreshJwtToken(refreshToken)
      .subscribe(response => {
        if (response) {
          const jwt = response.jwt;
          const jwtBody = this.decodeJwtBody(jwt);
          const user: User = {
            clientId: jwtBody.clientid,
            login: jwtBody.sub
          };

          this.updateUserState({
            ...userState,
            ssoToken: {
              ...userState.ssoToken!,
              jwt
            },
            user
          });
        } else {
          this.storageService.removeItem(StorageKeys.SsoToken)
            .subscribe(() => this.redirectToSso(false));
        }
      });
  }

  private isAuthorised(ssoToken?: SsoToken | null): boolean {
    if (ssoToken?.jwt != null && ssoToken.jwt.length > 0) {
      return this.checkTokenTime((ssoToken).jwt);
    }

    return false;
  }

  private updateUserState(state: UserState | null): void {
    this.userStateService.updateState(state);
  }

  private decodeJwtBody(jwt: string): JwtBody {
    const mainPart = jwt.split('.')[1];
    const decodedString = atob(mainPart);
    return JSON.parse(decodedString) as JwtBody;
  }

  private checkTokenTime(token: string | undefined): boolean {
    if (token != null && token.length > 0) {
      const expirationTime = this.decodeJwtBody(token).exp * 1000;

      // need to refresh the token before it expires. See https://github.com/alor-broker/Astras-Trading-UI/issues/1367
      const timeReserveMs = 1000 * 5;
      const now = Date.now() + timeReserveMs;
      return now < expirationTime;
    }

    return false;
  }
}
